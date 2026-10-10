import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { load } from '@cashfreepayments/cashfree-js';
import { getReferralCode, clearReferralCode } from '../../utils/referral/referral';
import api from '../../api/axios';

const resolveCashfreeMode = () => {
    if (import.meta.env.VITE_CASHFREE_MODE) return import.meta.env.VITE_CASHFREE_MODE;
    const host = window.location.hostname;
    if (host === 'powerfiling.com' || host === 'www.powerfiling.com') return 'production';
    return 'sandbox';
};

export default function CheckoutForm({ serviceId, planId, planName, amount: planPrice }) {
    const navigate = useNavigate();
    const [message, setMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [cashfree, setCashfree] = useState(null);

    const [referralCode, setReferralCode] = useState('');
    const [referralMsg, setReferralMsg] = useState({ text: '', type: '' });
    const [referralValidating, setReferralValidating] = useState(false);

    const [useReferralCoins, setUseReferralCoins] = useState(false);
    const [useCashbackCoins, setUseCashbackCoins] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [userCoins, setUserCoins] = useState({ referral: 0, cashback: 0 });

    const [couponCode, setCouponCode] = useState('');
    const [couponValidating, setCouponValidating] = useState(false);
    const [couponData, setCouponData] = useState(null);
    const [couponMsg, setCouponMsg] = useState({ text: '', type: '' });
    const [suggestedCoupons, setSuggestedCoupons] = useState([]);
    const [loadingSuggestedPlans,setLoadingSuggestedPlans] = useState(false)

    // 2. FETCH suggested coupons for this plan on mount:
    useEffect(() => {    
    if (!planId) return;
    setLoadingSuggestedPlans(true)
    api.get(`/coupons/suggested?planId=${planId}`)
        .then(({ data }) => setSuggestedCoupons(data.data || []))
        .then(()=>setLoadingSuggestedPlans(false))
        .catch(() => setSuggestedCoupons([]));
    }, [planId]);

    // 3. VALIDATE handler (works for both fixed + percentage, backend returns final values):
    const handleApplyCoupon = async (codeOverride) => {
    const codeToApply = codeOverride || couponCode;
    if (!codeToApply.trim()) return;
    setCouponValidating(true);
    setCouponMsg({ text: '', type: '' });
    try {
        const { data } = await api.post('/coupons/validate', { code: codeToApply.trim(), planId });
        if (data.success) {
            setCouponCode(data.data.code);
            setCouponData(data.data);
            setCouponMsg({ text: data.message, type: 'success' });
        }
    } catch (err) {
        setCouponMsg({ text: err.response?.data?.error || err.response.data.message, type: 'error' });
    } finally {
        setCouponValidating(false);
    }
    };
 
    const handleRemoveCoupon = () => {
        setCouponData(null);
        setCouponCode('');
        setCouponMsg({ text: '', type: '' });
    };

    useEffect(() => {
        const initCashfree = async () => {
            try {
                const cf = await load({ mode: resolveCashfreeMode() });
                setCashfree(cf);
            } catch (err) {
                console.error('Failed to load Cashfree SDK:', err);
                setMessage('Payment gateway failed to load. Please refresh the page.');
            }
        };
        initCashfree();
    }, []);

    useEffect(() => {
        const stored = getReferralCode();
        if (stored) setReferralCode(stored);

        const fetchCoins = async () => {
            try {
                const { data } = await api.get('/referral/me');
                if (data.success) {
                    setUserCoins({
                        referral: data.data.coins,
                        cashback: data.data.cashbackCoins,
                    });
                }
            } catch (err) {
                console.error('Could not fetch coins:', err);
            }
        };
        fetchCoins();
    }, []);

    const maxCoinDiscount = Math.floor(planPrice * 0.5);
    const referralCoinsToUse = useReferralCoins ? Math.min(userCoins.referral, maxCoinDiscount) : 0;
    const remainingAfterReferral = maxCoinDiscount - referralCoinsToUse;
    const cashbackCoinsToUse = useCashbackCoins
        ? Math.min(userCoins.cashback, remainingAfterReferral)
        : 0;
    const totalCoinDiscount = referralCoinsToUse + cashbackCoinsToUse;
    const disableCashback = useReferralCoins && referralCoinsToUse >= maxCoinDiscount;
    const disableReferral = useCashbackCoins && cashbackCoinsToUse >= maxCoinDiscount;
    const finalPrice = Math.max(planPrice - totalCoinDiscount - (couponData?.actualDiscount || 0), 1);
    console.log(finalPrice)

    const handleValidateReferral = async () => {
        if (!referralCode.trim()) return;
        setReferralValidating(true);
        setReferralMsg({ text: '', type: '' });
        try {
            const { data } = await api.post('/referral/validate', { referralCode });
            if (data.success) {
                setReferralMsg({ text: data.message, type: 'success' });
            } else {
                setReferralMsg({ text: data.error || 'Invalid referral code', type: 'error' });
            }
        } catch (err) {
            setReferralMsg({
                text: err.response?.data?.error || 'Could not validate code.',
                type: 'error',
            });
        } finally {
            setReferralValidating(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!termsAccepted) {
            setMessage('Please accept the Terms & Conditions to continue.');
            return;
        }

        if (!cashfree) {
            setMessage('Payment gateway is still loading. Please wait.');
            return;
        }

        setIsLoading(true);
        setMessage(null);

        try {
            const { data: orderData } = await api.post('/payments/create-order', {
                planId,
                serviceId,
                couponCode: couponData?.code || '',
                referralCode,
                referralCoinsUsed: referralCoinsToUse,
                cashbackCoinsUsed: cashbackCoinsToUse,
            });

             if (orderData.isMock) {
            // Skip Cashfree SDK entirely — go straight to confirm
            console.log('Mock payment mode enabled. Skipping Cashfree SDK.',orderData);
            const confirmRes = await api.post('/payments/confirm', {
                orderId: orderData.orderId,
                planId,
            })    
            console.log("confirmRes =", confirmRes);
            console.log("confirmRes.data =", confirmRes.data);
            console.log("confirmRes.data.success =", confirmRes.data?.success);
                    if (confirmRes.data.success) {
                clearReferralCode();
                console.log("➡️ Navigating with state:", {
    transactionId: orderData.orderId,
    purchaseId: confirmRes.data.purchaseId,
    serviceId: confirmRes.data.serviceId,
    planName: confirmRes.data.planName,
});
                navigate('/payment-success', {
                    replace: true,
                    state: {
                        transactionId: orderData?.orderId,
                        serviceId: confirmRes?.data?.serviceId || serviceId,
                        purchaseId: confirmRes?.data?.purchaseId,
                        planName: confirmRes?.data?.planName || planName,
                    },
                });
            } else {
                navigate('/payment-failed', {
                    replace: true,
                    state: {
                        errorMessage: 'Payment could not be confirmed. Please try again.',
                        transactionId: orderData.orderId,
                        planName,
                        serviceId,
                    },
                });
            }
            return;
        
        }

            if (!orderData.success || !orderData.paymentSessionId) {
                throw new Error('Failed to initialize payment');
            }

            // Always match SDK mode to backend — prevents sandbox/production session mismatch
            const checkoutMode = orderData.cashfreeMode || resolveCashfreeMode();
            const checkoutCashfree = await load({ mode: checkoutMode });

            const result = await checkoutCashfree.checkout({
                paymentSessionId: orderData.paymentSessionId,
                redirectTarget: '_self',
            });

            // With redirectTarget _self, user leaves this page — only handle inline/modal errors
            if (result?.error) {
                setIsLoading(false);
                navigate('/payment-failed', {
                    replace: true,
                    state: {
                        errorMessage: result.error.message || 'Payment was cancelled or failed.',
                        transactionId: orderData.orderId,
                        planName,
                        serviceId,
                    },
                });
                return;
            }

            const { data: confirmData } = await api.post('/payments/confirm', {
                orderId: orderData.orderId,
            });

            if (confirmData.success && confirmData.purchaseId) {
                clearReferralCode();
                navigate('/payment-success', {
                    replace: true,
                    state: {
                        transactionId: orderData.orderId,
                        serviceId: confirmData.serviceId || serviceId,
                        purchaseId: confirmData.purchaseId,
                        planName: confirmData.planName || planName,
                    },
                });
            } else {
                navigate('/payment-failed', {
                    replace: true,
                    state: {
                        errorMessage: 'Payment could not be confirmed. Please try again.',
                        transactionId: orderData.orderId,
                        planName,
                        serviceId,
                    },
                });
            }
        } catch (err) {
            console.error('Payment error:', err);
            const errMsg =
                err.response?.data?.message ||
                err.response?.data?.error ||
                err.message ||
                'Payment failed. Please try again.';

            navigate('/payment-failed', {
                replace: true,
                state: {
                    errorMessage: errMsg,
                    transactionId: err.response?.data?.transactionId || null,
                    planName,
                    serviceId,
                },
            });
        } finally {
            setIsLoading(false);
        }
    };

    // 4. JSX — Suggested Coupons chips (place above the input box):
    const SuggestedCoupons = () => (
        !couponData && suggestedCoupons.length > 0 && (
            <div className="mb-3">
                <p className="text-xs font-semibold text-slate-500 mb-2">Suggested Coupons</p>
                <div className="flex flex-wrap gap-2">
                    {suggestedCoupons.map(c => (
                        <button
                            key={c.code}
                            type="button"
                            onClick={() => handleApplyCoupon(c.code)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
                        >
                            🏷️ {c.code}
                            <span className="text-blue-500">
                                ({c.discountType === 'percentage' ? `${c.discountPercent}% off` : `₹${c.discountAmount} off`})
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        )
    );

    const renderCouponBox = () => (
    <div className="mt-4">
    {loadingSuggestedPlans ? (
        <div className="mt-6 rounded-xl border border-slate-200 p-4 animate-pulse">
            <div className="h-5 w-40 bg-slate-200 rounded mb-4" />
            <div className="space-y-3">
            <div className="h-20 bg-slate-100 rounded-xl" />
            <div className="h-20 bg-slate-100 rounded-xl" />
            </div>
        </div>
        ) : (
        <SuggestedCoupons />
        )}
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
            Coupon Code <span className="text-slate-400 font-normal normal-case">(optional)</span>
        </label>
        {couponData ? (
            <div className="flex items-center justify-between px-4 py-3 bg-green-50 border border-green-300 rounded-xl">
                <div>
                    <p className="text-sm font-bold text-green-700">
                        🎉 {couponData.code} applied — ₹{couponData.actualDiscount} off
                        {couponData.discountType === 'percentage' ? ` (${couponData.discountPercent}%)` : ''}
                    </p>
                </div>
                <button type="button" onClick={handleRemoveCoupon} className="text-xs text-red-500 hover:text-red-700 font-semibold ml-3">
                    Remove
                </button>
            </div>
        ) : (
            <div>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={couponCode}
                        onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponMsg({ text: '', type: '' }); }}
                        placeholder="Enter coupon code"
                        className={`flex-1 px-4 py-2.5 bg-slate-50 border rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-blue-500 focus:bg-white uppercase ${
                            couponMsg.type === 'error' ? 'border-red-300' : 'border-slate-200'
                        }`}
                    />
                    <button
                        type="button"
                        onClick={() => handleApplyCoupon()}
                        disabled={couponValidating || !couponCode.trim()}
                        className="px-4 py-2.5 bg-slate-800 text-white text-sm font-semibold rounded-xl hover:bg-slate-700 transition-all disabled:opacity-50 whitespace-nowrap"
                    >
                        {couponValidating ? 'Checking...' : 'Apply'}
                    </button>
                </div>
                {couponMsg.text && (
                    <p className={`text-xs mt-1.5 ml-1 font-medium ${couponMsg.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                        {couponMsg.text}
                    </p>
                )}
            </div>
        )}
    </div>
);
 

    return (
        <form id="payment-form" onSubmit={handleSubmit} className="mt-6 space-y-6">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                {(userCoins.referral + userCoins.cashback) > 0 && (
                    <>
                        <p className="text-sm font-semibold text-slate-700">Use Coins for Discount</p>
                        <p className="text-xs text-slate-400">Max 50% of plan price can be paid with coins</p>

                        {userCoins.referral > 0 && (
                            <label
                                className={`flex items-center justify-between p-3 bg-white border rounded-xl transition-colors ${
                                    disableReferral
                                        ? 'opacity-40 cursor-not-allowed border-slate-200'
                                        : 'cursor-pointer hover:border-blue-300 border-slate-200'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={useReferralCoins}
                                        disabled={disableReferral}
                                        onChange={(e) => setUseReferralCoins(e.target.checked)}
                                        className="w-4 h-4 accent-blue-600"
                                    />
                                    <div>
                                        <p className="text-sm font-semibold text-blue-600">Referral Coins</p>
                                        <p className="text-xs text-slate-400">Withdrawable</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-slate-800">{userCoins.referral} coins</p>
                                    <p className="text-xs text-green-600 font-semibold">
                                        -{referralCoinsToUse || 0} off
                                    </p>
                                </div>
                            </label>
                        )}

                        {userCoins.cashback > 0 && (
                            <label
                                className={`flex items-center justify-between p-3 bg-white border rounded-xl transition-colors ${
                                    disableCashback
                                        ? 'opacity-40 cursor-not-allowed border-slate-200'
                                        : 'cursor-pointer hover:border-green-300 border-slate-200'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={useCashbackCoins}
                                        disabled={disableCashback}
                                        onChange={(e) => setUseCashbackCoins(e.target.checked)}
                                        className="w-4 h-4 accent-green-600"
                                    />
                                    <div>
                                        <p className="text-sm font-semibold text-green-600">Cashback Coins</p>
                                        <p className="text-xs text-slate-400">Discount only</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-slate-800">{userCoins.cashback} coins</p>
                                    <p className="text-xs text-green-600 font-semibold">
                                        -{cashbackCoinsToUse || 0} off
                                    </p>
                                </div>
                            </label>
                        )}
                    </>
                )}
                {renderCouponBox()}
                {(useReferralCoins || useCashbackCoins || couponData || planPrice !== finalPrice) && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg space-y-1 mt-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Original price</span>
                            <span className="font-semibold">₹{planPrice}</span>
                        </div>
                        {useReferralCoins && (
                            <div className="flex justify-between text-sm">
                                <span className="text-blue-600">Referral discount</span>
                                <span className="font-semibold text-blue-600">-₹{referralCoinsToUse}</span>
                            </div>
                        )}
                        {useCashbackCoins && (
                            <div className="flex justify-between text-sm">
                                <span className="text-green-600">Cashback discount</span>
                                <span className="font-semibold text-green-600">-₹{cashbackCoinsToUse}</span>
                            </div>
                        )}
                        {couponData && (
                            <div className="flex justify-between text-sm">
                                <span className="text-purple-600">Coupon ({couponData.code})</span>
                                <span className="font-semibold text-purple-600">
                                    -₹{couponData.actualDiscount}
                                </span>
                            </div>
                        )}
                        <div className="flex justify-between text-sm font-bold border-t border-green-200 pt-2">
                            <span>You pay</span>
                            <span className="text-blue-600">₹{finalPrice}</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <input
                    type="checkbox"
                    id="terms"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="w-4 h-4 mt-0.5 accent-blue-600 shrink-0 cursor-pointer"
                />
                <label htmlFor="terms" className="text-xs text-slate-600 cursor-pointer leading-relaxed">
                    I have read and consent to Powerfiling processing my information in accordance with the{' '}
                    <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-semibold">
                        Terms & Conditions
                    </a>
                    ,{' '}
                    <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-semibold">
                        Privacy Policy
                    </a>
                    {' '}and{' '}
                    <a href="/refund" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-semibold">
                        Refund Policy
                    </a>
                </label>
            </div>

            <button
                disabled={isLoading || !cashfree || !termsAccepted}
                id="submit"
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-75 disabled:cursor-not-allowed transition-colors"
            >
                <span id="button-text">
                    {isLoading
                        ? 'Processing...'
                        : !termsAccepted
                          ? 'Accept Terms to Continue'
                          : `Pay ₹${finalPrice} & Continue`}
                </span>
            </button>
            {message && (
                <div id="payment-message" className="text-red-600 text-sm text-center">
                    {message}
                </div>
            )}
        </form>
    );
}
