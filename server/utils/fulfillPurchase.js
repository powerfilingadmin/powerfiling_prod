import Purchase from '../models/Purchase.js';
import Plan from '../models/Plan.js';
import User from '../models/User.js';
import Coupon from '../models/Coupon.js';
import PendingPayment from '../models/PendingPayment.js';
import sendEmail from './sendEmail.js';
import { getInvoiceTemplate, getPaymentFailedTemplate } from './emailTemplates.js';
import { creditCashbackCoins, creditReferralCoins } from '../controllers/referralController.js';
import { fetchCashfreeOrder, isOrderPaid, getOrderStatus, getPaymentOutcomeMessage } from '../services/cashfreeService.js';
import AppError from './AppError.js';

export const notifyPaymentFailed = async ({ orderId, userId, reason }) => {
    const pending = await PendingPayment.findOneAndUpdate(
        {
            orderId,
            userId,
            status: { $nin: ['completed', 'processing'] },
            failureEmailSent: false,
        },
        { $set: { status: 'failed', failureEmailSent: true } },
        { new: true }
    );

    if (!pending) {
        return { sent: false };
    }

    const user = await User.findById(userId);
    if (!user?.email) {
        return { sent: false };
    }

    try {
        await sendEmail({
            email: user.email,
            subject: 'Payment Not Completed - Powerfiling',
            message: `Your payment for ${pending.planName} was not completed. Reference: ${orderId}. ${reason || ''}`,
            html: getPaymentFailedTemplate(user, pending, { orderId, reason }),
        });
        return { sent: true };
    } catch (err) {
        console.error('[Payment] Failed payment email error:', err.message);
        return { sent: false };
    }
};

const verifyCashfreePayment = async (orderId, pending) => {
    const cashfreeOrder = await fetchCashfreeOrder(orderId);
    const orderStatus = getOrderStatus(cashfreeOrder);

    if (!isOrderPaid(cashfreeOrder)) {
        const failureReason = getPaymentOutcomeMessage(orderStatus);
        setImmediate(() => {
            notifyPaymentFailed({
                orderId,
                userId: pending.userId,
                reason: failureReason,
            }).catch((err) => {
                console.error('[Payment] Failed payment email error:', err.message);
            });
        });
        throw new AppError(failureReason, 400);
    }

    const cashfreeCustomerId =
        cashfreeOrder?.customer_details?.customer_id ||
        cashfreeOrder?.customer_details?.customerId;

    if (
        cashfreeCustomerId &&
        cashfreeCustomerId.toString() !== pending.userId.toString()
    ) {
        throw new AppError('Payment ownership verification failed', 403);
    }

    const paidAmount = Number(cashfreeOrder.order_amount);
    if (Math.abs(paidAmount - pending.finalAmountPaid) > 0.01) {
        throw new AppError('Payment amount mismatch', 400);
    }

    return cashfreeOrder;
};

const deductCoinsAtomically = async (pending) => {
    if (pending.referralCoinsUsed <= 0 && pending.cashbackCoinsUsed <= 0) {
        return false;
    }

    const updatedUser = await User.findOneAndUpdate(
        {
            _id: pending.userId,
            coins: { $gte: pending.referralCoinsUsed },
            cashbackCoins: { $gte: pending.cashbackCoinsUsed },
        },
        {
            $inc: {
                coins: -pending.referralCoinsUsed,
                cashbackCoins: -pending.cashbackCoinsUsed,
            },
        },
        { new: true }
    );

    if (!updatedUser) {
        throw new AppError('Insufficient coins at fulfillment time', 400);
    }

    return true;
};

const markCouponUsedAtomically = async (pending) => {
    if (!pending.couponCode) {
        return false;
    }

    const couponUpdated = await Coupon.findOneAndUpdate(
        {
            code: pending.couponCode.toUpperCase(),
            isActive: true,
            usedBy: { $not: { $elemMatch: { userId: pending.userId } } },
            $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
        },
        {
            $push: { usedBy: { userId: pending.userId, usedAt: new Date() } },
            $inc: { totalUses: 1 },
        }
    );

    if (!couponUpdated) {
        throw new AppError('Coupon is no longer valid', 400);
    }

    return true;
};

const rollbackFulfillment = async (pending, { coinsDeducted, couponMarked }) => {
    if (coinsDeducted) {
        await User.findByIdAndUpdate(pending.userId, {
            $inc: {
                coins: pending.referralCoinsUsed,
                cashbackCoins: pending.cashbackCoinsUsed,
            },
        });
    }

    if (couponMarked && pending.couponCode) {
        await Coupon.findOneAndUpdate(
            { code: pending.couponCode.toUpperCase() },
            {
                $pull: { usedBy: { userId: pending.userId } },
                $inc: { totalUses: -1 },
            }
        );
    }

    await PendingPayment.updateOne(
        { _id: pending._id, status: 'processing' },
        { $set: { status: 'pending' } }
    );
};

/**
 * Idempotent purchase fulfillment after Cashfree confirms payment.
 */
export const fulfillPurchaseFromOrder = async ({ orderId, userId }) => {
    const pending = await PendingPayment.findOne({ orderId, userId });
    const existingPurchase = await Purchase.findOne({ paymentId: orderId });
    if (existingPurchase) {
        return { 
            purchase: existingPurchase,
            alreadyProcessed: true,
            planName: existingPurchase.planName,
            serviceId: pending?.serviceId || null,
         };
    }

    
    if (!pending) {
        throw new AppError('Payment session not found', 404);
    }

    if (pending.status === 'completed') {
        const purchase = await Purchase.findOne({ paymentId: orderId });
        if (purchase) return { purchase, alreadyProcessed: true };
    }

    if (pending.status === 'processing') {
        const purchase = await Purchase.findOne({ paymentId: orderId });
        if (purchase) return { purchase, alreadyProcessed: true };
        throw new AppError('Payment is being processed', 409);
    }

    const isMockOrder = String(orderId).startsWith('mock_');

    if (!isMockOrder) {
        await verifyCashfreePayment(orderId, pending);
    }

    const claimed = await PendingPayment.findOneAndUpdate(
        { _id: pending._id, status: { $in: ['pending', 'failed'] } },
        { $set: { status: 'processing' } },
        { new: true }
    );

    if (!claimed) {
        const purchase = await Purchase.findOne({ paymentId: orderId });
        if (purchase) return { purchase, alreadyProcessed: true };
        throw new AppError('Payment already being processed', 409);
    }

    let coinsDeducted = false;
    let couponMarked = false;

    try {
        coinsDeducted = await deductCoinsAtomically(claimed);
        couponMarked = await markCouponUsedAtomically(claimed);

        const user = await User.findById(userId);
        if (!user) {
            throw new AppError('User not found', 404);
        }

        const plan = await Plan.findById(claimed.planId);

        let purchase;
        try {
            purchase = await Purchase.create({
                userId,
                planId: claimed.planId,
                planName: claimed.planName,
                planPrice: claimed.planPrice,
                paymentId: orderId,
                paymentStatus: 'Completed',
                formUnlocked: true,
                coinDiscountApplied: claimed.coinDiscountApplied,
                referralCoinsUsed: claimed.referralCoinsUsed,
                cashbackCoinsUsed: claimed.cashbackCoinsUsed,
                finalAmountPaid: claimed.finalAmountPaid,
                couponCode: claimed.couponCode,
                couponDiscount: claimed.couponDiscount,
                originalPrice: claimed.planPrice,
            });
        } catch (err) {
            if (err.code === 11000) {
                const duplicate = await Purchase.findOne({ paymentId: orderId });
                if (duplicate) {
                    return { purchase: duplicate, alreadyProcessed: true };
                }
            }
            throw err;
        }

        await User.findByIdAndUpdate(userId, { $push: { purchasedPlans: purchase._id } });
        await PendingPayment.updateOne({ _id: claimed._id }, { $set: { status: 'completed' } });

        setImmediate(async () => {
            try {
                if (claimed.referralCode && !user.referredBy && !user.referralRewardCredited) {
                    const decodedId = Buffer.from(claimed.referralCode, 'base64').toString('utf-8');
                    if (/^[a-f\d]{24}$/i.test(decodedId) && decodedId !== userId.toString()) {
                        const buyer = await User.findById(userId);
                        if (buyer && !buyer.referredBy) {
                            buyer.referredBy = decodedId;
                            await buyer.save({ validateBeforeSave: false });
                        }
                    }
                }

                await creditReferralCoins({ buyerUserId: userId, planName: claimed.planName });
                await creditCashbackCoins({ buyerUserId: userId, planName: claimed.planName });

                if (plan) {
                    await sendEmail({
                        email: user.email,
                        subject: 'Payment Successful - Powerfiling Receipt',
                        message: `You have successfully purchased ${plan.name}. Transaction ID: ${orderId}`,
                        html: getInvoiceTemplate(user, purchase, plan),
                    });
                }
            } catch (err) {
                console.error('[Payment] Non-critical post-payment task failed:', err);
            }
        });

        return {
            purchase,
            alreadyProcessed: false,
            serviceId: claimed.serviceId,
            planName: claimed.planName,
        };
    } catch (err) {
        await rollbackFulfillment(claimed, { coinsDeducted, couponMarked });
        throw err;
    }
};
