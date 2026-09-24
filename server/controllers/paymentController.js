import crypto from 'crypto';
import mongoose from 'mongoose';
import asyncHandler from '../middlewares/asyncHandler.js';
import Purchase from '../models/Purchase.js';
import Plan from '../models/Plan.js';
import ITRForm from '../models/ITRForm.js';
import Document from '../models/Document.js';
import PendingPayment from '../models/PendingPayment.js';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import { bucket } from '../config/firebase.js';
import { calculateOrderPricing } from '../utils/paymentPricing.js';
import { fulfillPurchaseFromOrder, notifyPaymentFailed } from '../utils/fulfillPurchase.js';
import {
    createCashfreeOrder,
    verifyWebhookSignature,
} from '../services/cashfreeService.js';

const generateOrderId = (userId) =>
    `ll_${userId.toString().slice(-6)}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

const getClientUrl = () => process.env.CLIENT_URL || 'http://localhost:5173';
const getServerUrl = () => process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5001}`;

const normalizePhone = (phone, fallback = '9999999999') => {
    const digits = String(phone || '').replace(/\D/g, '');
    if (digits.length === 10) return digits;
    if (digits.length > 10) return digits.slice(-10);
    return fallback;
};

// @desc      Create Cashfree Order
// @route     POST /api/v1/payments/create-order
// @access    Private
export const createOrder = asyncHandler(async (req, res, next) => {
    const {
        planId,
        serviceId,
        couponCode,
        referralCode,
        referralCoinsUsed = 0,
        cashbackCoinsUsed = 0,
    } = req.body;

    if (!planId) {
        return next(new AppError('Plan ID is required', 400));
    }

    if (!mongoose.isValidObjectId(planId)) {
        return next(new AppError('Invalid plan ID', 400));
    }

    const pricing = await calculateOrderPricing({
        planId,
        userId: req.user.id,
        couponCode,
        referralCoinsUsed,
        cashbackCoinsUsed,
    });

     // ── MOCK BYPASS ──────────────────────────────────────────────────────────
    if (process.env.ALLOW_MOCK_PAYMENTS === 'true') {
        const mockOrderId = `mock_${req.user.id}_${Date.now()}`;

        await PendingPayment.create({
            orderId: mockOrderId,
            userId: req.user.id,
            planId: pricing.plan._id,
            serviceId: serviceId || null,
            planName: pricing.plan.name,
            planPrice: pricing.planPrice,
            referralCoinsUsed: pricing.referralCoinsUsed,
            cashbackCoinsUsed: pricing.cashbackCoinsUsed,
            coinDiscountApplied: pricing.coinDiscountApplied,
            couponCode: pricing.couponCode,
            couponDiscount: pricing.couponDiscount,
            referralCode: referralCode || null,
            finalAmountPaid: pricing.finalAmountPaid,
            status: 'pending',
        });

        return res.status(200).json({
            success: true,
            orderId: mockOrderId,
            paymentSessionId: 'mock_session',
            cashfreeMode: 'mock',
            finalPrice: pricing.finalAmountPaid,
            coinDiscount: pricing.coinDiscountApplied,
            couponDiscount: pricing.couponDiscount,
            isMock: true,
        });
    }

    const orderId = generateOrderId(req.user.id);
    const clientUrl = getClientUrl();
    const serverUrl = getServerUrl();
   
    console.log("Pricing object:", pricing);
    console.log("Final Amount:", pricing.finalAmountPaid);
    console.log("Type:", typeof pricing.finalAmountPaid);
    const cashfreeOrder = await createCashfreeOrder({
        orderId,
        amount: pricing.finalAmountPaid,
        customer: {
            customerId: req.user.id.toString(),
            name: req.user.name,
            email: req.user.email || 'customer@powerfiling.com',
            phone: normalizePhone(req.user.mobile),
        },
        returnUrl: `${clientUrl}/payment-success?order_id={order_id}`,
        notifyUrl: `${serverUrl}/api/v1/payments/webhook`,
        orderNote: `Purchase: ${pricing.plan.name}`,
        orderTags: {
            planId: pricing.plan._id.toString(),
            userId: req.user.id.toString(),
        },
    });

    await PendingPayment.create({
        orderId,
        userId: req.user.id,
        planId: pricing.plan._id,
        serviceId: serviceId || null,
        planName: pricing.plan.name,
        planPrice: pricing.planPrice,
        referralCoinsUsed: pricing.referralCoinsUsed,
        cashbackCoinsUsed: pricing.cashbackCoinsUsed,
        coinDiscountApplied: pricing.coinDiscountApplied,
        couponCode: pricing.couponCode,
        couponDiscount: pricing.couponDiscount,
        referralCode: referralCode || null,
        finalAmountPaid: pricing.finalAmountPaid,
        status: 'pending',
    });

    res.status(200).json({
        success: true,
        orderId,
        paymentSessionId: cashfreeOrder.payment_session_id,
        cashfreeMode: process.env.CASHFREE_ENV === 'production' ? 'production' : 'sandbox',
        finalPrice: pricing.finalAmountPaid,
        coinDiscount: pricing.coinDiscountApplied,
        couponDiscount: pricing.couponDiscount,
    });
});

// @desc      Confirm Payment (verify Cashfree order server-side)
// @route     POST /api/v1/payments/confirm
// @access    Private
export const confirmPayment = asyncHandler(async (req, res, next) => {
    const orderId = req.body.orderId || req.body.paymentIntentId;
    console.log("ALLOW_MOCK_PAYMENTS:", process.env.ALLOW_MOCK_PAYMENTS);
    console.log("NODE_ENV:", process.env.NODE_ENV);
    console.log("orderId:", orderId);

    if (!orderId) {
        return next(new AppError('Order ID is required', 400));
    }

    // Dev-only mock bypass — requires explicit env flag
    if (
        process.env.ALLOW_MOCK_PAYMENTS === 'true' &&
        process.env.NODE_ENV !== 'production' &&
        String(orderId).startsWith('mock_')
    ) {
        console.log("✅ Entered MOCK payment flow");
        const existingPurchase = await Purchase.findOne({ paymentId: orderId });
        if (existingPurchase) {
            return res.status(200).json({
                success: true,
                message: 'Mock Payment already processed',
                purchaseId: existingPurchase._id,
            });
        }

        const { planId, couponCode, referralCode, referralCoinsUsed = 0, cashbackCoinsUsed = 0 } = req.body;
        if (!planId) return next(new AppError('Plan ID is required for mock payment', 400));

        const pricing = await calculateOrderPricing({
            planId,
            userId: req.user.id,
            couponCode,
            referralCoinsUsed,
            cashbackCoinsUsed,
        });

        if (Number.isNaN(pricing.finalAmountPaid)) {
    console.error("Pricing calculation failed:", pricing);
    return next(new AppError("Pricing calculation failed", 500));
}

        const { purchase : mockPurchase, alreadyProcessed : mockAlreadyProcessed, serviceId: mockServiceId,planName: mockPlanName } = await fulfillPurchaseFromOrder({
            orderId,
            userId: req.user.id,
        });

        return res.status(200).json({
    success: true,
    message: mockAlreadyProcessed
        ? 'Mock Payment already processed'
        : 'Mock Payment confirmed successfully',
    purchaseId: mockPurchase._id,
    transactionId: orderId,
    serviceId:mockServiceId,
    planName:mockPlanName,
    paymentStatus: 'PAID',
});
    }

    const pending = await PendingPayment.findOne({ orderId, userId: req.user.id });
    if (!pending) {
        return next(new AppError('Payment session not found or unauthorized', 403));
    }

    try {
        console.log("❌ Entered REAL payment flow");
        const { purchase, alreadyProcessed, serviceId, planName } = await fulfillPurchaseFromOrder({
            orderId,
            userId: req.user.id,
        });

        res.status(200).json({
            success: true,
            message: alreadyProcessed ? 'Payment already processed' : 'Payment confirmed successfully',
            purchaseId: purchase._id,
            transactionId: orderId,
            serviceId,
            planName,
            paymentStatus: 'PAID',
        });
    } catch (err) {
        if (err instanceof AppError && [400, 403, 409].includes(err.statusCode)) {
            return res.status(err.statusCode).json({
                success: false,
                message: err.message,
                transactionId: orderId,
                serviceId: pending.serviceId,
                planName: pending.planName,
            });
        }
        throw err;
    }
});

// @desc      Notify failed payment and send email (idempotent)
// @route     POST /api/v1/payments/notify-failed
// @access    Private
export const notifyFailedPayment = asyncHandler(async (req, res, next) => {
    const orderId = req.body.orderId || req.body.paymentIntentId;
    const reason = req.body.reason;

    if (!orderId) {
        return next(new AppError('Order ID is required', 400));
    }

    const result = await notifyPaymentFailed({
        orderId,
        userId: req.user.id,
        reason,
    });

    res.status(200).json({
        success: true,
        emailSent: result.sent,
    });
});

// @desc      Cashfree payment webhook
// @route     POST /api/v1/payments/webhook
// @access    Public (signature verified)
export const paymentWebhook = asyncHandler(async (req, res) => {
    const signature = req.headers['x-webhook-signature'];
    const timestamp = req.headers['x-webhook-timestamp'];
    const rawBody = req.rawBody;

    if (!verifyWebhookSignature(signature, rawBody, timestamp)) {
        return res.status(401).json({ success: false, message: 'Invalid webhook signature' });
    }

    let payload;
    try {
        payload = JSON.parse(rawBody);
    } catch {
        return res.status(400).json({ success: false, message: 'Invalid payload' });
    }

    res.status(200).json({ success: true });

    const eventType = payload.type;
    if (eventType !== 'PAYMENT_SUCCESS_WEBHOOK') return;

    const orderId = payload?.data?.order?.order_id;
    if (!orderId) return;

    const pending = await PendingPayment.findOne({ orderId });
    if (!pending) {
        console.error('[Webhook] No pending payment for order:', orderId);
        return;
    }

    const webhookUserId = payload?.data?.customer_details?.customer_id;
    if (webhookUserId && pending.userId.toString() !== webhookUserId.toString()) {
        console.error('[Webhook] Customer mismatch for order:', orderId);
        return;
    }

    setImmediate(async () => {
        try {
            await fulfillPurchaseFromOrder({
                orderId,
                userId: pending.userId.toString(),
            });
        } catch (err) {
            console.error('[Webhook] Fulfillment failed:', err.message);
        }
    });
});

// @desc Check if user has active purchase for a plan
// @route GET /api/v1/payments/check-status
// @access Private
export const checkPurchaseStatus = asyncHandler(async (req, res, next) => {
    const { planId } = req.query;

    if (!planId) {
        return next(new AppError('Plan ID is required', 400));
    }

    const purchase = await Purchase.findOne({
        userId: req.user.id,
        planId: planId,
        paymentStatus: 'Completed',
    }).sort({ createdAt: -1 });

    if (!purchase) {
        return res.status(200).json({
            success: true,
            hasActivePlan: false,
        });
    }

    const itr = await ITRForm.findOne({ purchaseId: purchase._id });

    if (itr) {
        return res.status(200).json({
            success: true,
            hasActivePlan: false,
            isFiled: true,
        });
    }

    return res.status(200).json({
        success: true,
        hasActivePlan: true,
        purchaseId: purchase._id,
        isFiled: false,
    });
});

// @desc      Get My Orders (Purchases)
// @route     GET /api/v1/payments/my-orders
// @access    Private
export const getMyOrders = asyncHandler(async (req, res, next) => {
    const purchases = await Purchase.find({ userId: req.user.id })
        .populate('planId')
        .sort({ createdAt: -1 });

    const ordersWithStatus = await Promise.all(
        purchases.map(async (purchase) => {
            let itrStatus = 'Pending Filing';
            let itrId = null;
            let submittedAt = null;
            let itrUpdatedAt = null;

            if (purchase.formUnlocked) {
                const itr = await ITRForm.findOne({ purchaseId: purchase._id });
                if (itr) {
                    itrStatus = itr.status || 'Submitted';
                    itrId = itr._id;
                    submittedAt = itr.submittedAt || itr.createdAt;
                    itrUpdatedAt = itr.updatedAt;
                }
            }

            const purchaseObj = purchase.toObject();

            return {
                ...purchaseObj,
                serviceName: purchase.planId?.name || purchase.planName || 'Tax Service',
                itrStatus,
                itrId,
                submittedAt,
                itrUpdatedAt,
            };
        })
    );

    res.status(200).json({
        success: true,
        count: ordersWithStatus.length,
        data: ordersWithStatus,
    });
});

// @desc      Get All Orders (Admin)
// @route     GET /api/v1/payments/all
// @access    Private (Admin)
export const getAllOrders = asyncHandler(async (req, res, next) => {
    const purchases = await Purchase.find()
        .populate('userId', 'name email mobile')
        .populate('planId')
        .sort({ createdAt: -1 });

    const ordersWithStatus = await Promise.all(
        purchases.map(async (purchase) => {
            let itrStatus = 'Pending Filing';
            let itrId = null;
            let submittedAt = null;
            let itrUpdatedAt = null;

            if (purchase.formUnlocked) {
                const itr = await ITRForm.findOne({ purchaseId: purchase._id });
                if (itr) {
                    itrStatus = itr.status || 'Submitted';
                    itrId = itr._id;
                    submittedAt = itr.submittedAt || itr.createdAt;
                    itrUpdatedAt = itr.updatedAt;
                }
            }

            const purchaseObj = purchase.toObject();

            return {
                ...purchaseObj,
                itrStatus,
                itrId,
                submittedAt,
                itrUpdatedAt,
            };
        })
    );

    res.status(200).json({
        success: true,
        count: ordersWithStatus.length,
        data: ordersWithStatus,
    });
});

const refreshDocumentUrls = async (documents) => {
    if (!documents?.length) return [];

    return Promise.all(documents.map(async (doc) => {
        const docObj = doc.toObject ? doc.toObject() : doc;
        const storagePath = docObj.storagePath;

        if (!storagePath) return docObj;

        try {
            const [newUrl] = await bucket.file(storagePath).getSignedUrl({
                version: 'v4',
                action: 'read',
                expires: Date.now() + 15 * 60 * 1000,
            });
            return { ...docObj, fileUrl: newUrl };
        } catch (err) {
            console.error('URL refresh failed for shared doc:', err);
            return docObj;
        }
    }));
};

const assertOrderAccess = (purchase, user) => {
    const isAdminOrCA =
        user.role === 'admin' || (user.role === 'ca' && user.adminStatus === 'approved');
    const purchaseUserId = purchase.userId?._id || purchase.userId;

    if (!isAdminOrCA && purchaseUserId.toString() !== user.id.toString()) {
        throw new AppError('Not authorized to view this order', 403);
    }

    return purchaseUserId;
};

// @desc      Get shared documents for a specific order
// @route     GET /api/v1/payments/:id/shared-documents
// @access    Private
export const getOrderSharedDocuments = asyncHandler(async (req, res, next) => {
    const purchase = await Purchase.findById(req.params.id);

    if (!purchase) {
        return next(new AppError('Order not found', 404));
    }

    let purchaseUserId;
    try {
        purchaseUserId = assertOrderAccess(purchase, req.user);
    } catch (error) {
        return next(error);
    }

    const itr = await ITRForm.findOne({ purchaseId: purchase._id });
    if (!itr) {
        return res.status(200).json({ success: true, count: 0, data: [] });
    }

    const documents = await Document.find({
        isShared: true,
        sharedWith: purchaseUserId,
        $or: [
            { formId: itr._id },
            { _id: { $in: itr.sharedDocuments || [] } },
        ],
    }).sort({ uploadedAt: -1 });

    const refreshedDocs = await refreshDocumentUrls(documents);

    res.status(200).json({
        success: true,
        count: refreshedDocs.length,
        data: refreshedDocs,
    });
});

// @desc      Get Order By ID
// @route     GET /api/v1/payments/:id
// @access    Private
export const getOrderById = asyncHandler(async (req, res, next) => {
    const purchase = await Purchase.findById(req.params.id)
        .populate('userId', 'name email mobile')
        .populate('planId');

    if (!purchase) {
        return next(new AppError('Order not found', 404));
    }

    try {
        assertOrderAccess(purchase, req.user);
    } catch (error) {
        return next(error);
    }

    let itrStatus = 'Pending Filing';
    let itrId = null;
    let submittedAt = null;
    let itrUpdatedAt = null;

    if (purchase.formUnlocked) {
        const itr = await ITRForm.findOne({ purchaseId: purchase._id });
        if (itr) {
            itrStatus = itr.status || 'Submitted';
            itrId = itr._id;
            submittedAt = itr.submittedAt || itr.createdAt;
            itrUpdatedAt = itr.updatedAt;
        }
    }

    const purchaseObj = purchase.toObject();

    res.status(200).json({
        success: true,
        data: {
            ...purchaseObj,
            serviceName: purchase.planId?.name || purchase.planName || 'Tax Service',
            itrStatus,
            itrId,
            submittedAt,
            itrUpdatedAt,
        },
    });
});
