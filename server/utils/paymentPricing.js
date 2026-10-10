import Plan from '../models/Plan.js';
import Coupon from '../models/Coupon.js';
import User from '../models/User.js';
import AppError from './AppError.js';

const MAX_COIN_DISCOUNT_RATIO = 0.5;

const sanitizeCoinAmount = (value) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 0) return 0;
    return Math.floor(parsed);
};

/**
 * Server-side pricing — never trust client-sent amounts.
 */
export const calculateOrderPricing = async ({
    planId,
    userId,
    couponCode,
    referralCoinsUsed = 0,
    cashbackCoinsUsed = 0,
}) => {
    const plan = await Plan.findById(planId);
    if (!plan) {
        throw new AppError('Plan not found', 404);
    }

    const user = await User.findById(userId);
    if (!user) {
        throw new AppError('User not found', 404);
    }

    const safeReferralCoins = sanitizeCoinAmount(referralCoinsUsed);
    const safeCashbackCoins = sanitizeCoinAmount(cashbackCoinsUsed);
    const maxCoinDiscount = Math.floor(plan.price * MAX_COIN_DISCOUNT_RATIO);
    const requestedCoinDiscount = safeReferralCoins + safeCashbackCoins;

    if (safeReferralCoins > (user.coins || 0)) {
        throw new AppError('Insufficient referral coins', 400);
    }
    if (safeCashbackCoins > (user.cashbackCoins || 0)) {
        throw new AppError('Insufficient cashback coins', 400);
    }
    if (requestedCoinDiscount > maxCoinDiscount) {
        throw new AppError('Coin discount cannot exceed 50% of plan price', 400);
    }

    const coinDiscountApplied = Math.min(requestedCoinDiscount, maxCoinDiscount);

    let couponDiscount = 0;
    let validatedCouponCode = null;

    if (couponCode?.trim()) {
        const coupon = await Coupon.findOne({ code: couponCode.toUpperCase().trim() });
        if (!coupon) throw new AppError('Invalid coupon code', 400);
        if (!coupon.isActive) throw new AppError('This coupon is no longer active', 400);
        if (coupon.expiresAt && new Date() > coupon.expiresAt) {
            throw new AppError('This coupon has expired', 400);
        }
        const alreadyUsed = coupon.usedBy.some((u) => u.userId.toString() === userId.toString());
        if (alreadyUsed) throw new AppError('You have already used this coupon', 400);

        const maxCouponDiscount = Math.max(plan.price - coinDiscountApplied - 1, 0);

        let calculatedCouponDiscount = 0;

        if (coupon.discountType === 'fixed') {
            calculatedCouponDiscount = coupon.discountAmount || 0;
        } else if (coupon.discountType === 'percentage') {
            calculatedCouponDiscount = Math.floor(
                (plan.price * (coupon.discountPercent || 0)) / 100
            );

            // Respect max discount for percentage coupons
            if (coupon.maxPercentDiscount) {
                calculatedCouponDiscount = Math.min(
                    calculatedCouponDiscount,
                    coupon.maxPercentDiscount
                );
            }
        }

        couponDiscount = Math.min(
            calculatedCouponDiscount,
            maxCouponDiscount
        );

        validatedCouponCode = coupon.code;
    }

    const finalAmountPaid = Math.max(plan.price - coinDiscountApplied - couponDiscount, 1);

    if (!Number.isFinite(finalAmountPaid)) {
        throw new AppError('Invalid payment calculation', 500);
    }

    return {
        plan,
        user,
        planPrice: plan.price,
        referralCoinsUsed: safeReferralCoins,
        cashbackCoinsUsed: safeCashbackCoins,
        coinDiscountApplied,
        couponDiscount,
        couponCode: validatedCouponCode,
        finalAmountPaid,
        totalCoinDiscount: coinDiscountApplied,
    };
};
