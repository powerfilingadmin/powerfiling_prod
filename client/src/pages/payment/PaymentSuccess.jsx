import { useEffect, useState } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { CheckCircle, LayoutDashboard, FileText } from 'lucide-react';
import api from '../../api/axios';

const PaymentSuccess = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const [countdown, setCountdown] = useState(10);
    const [status, setStatus] = useState('verifying'); // verifying | success | failed

    const orderIdFromUrl = searchParams.get('order_id');

    const [paymentState, setPaymentState] = useState({
        transactionId: null,
        serviceId: location.state?.serviceId || null,
        purchaseId: location.state?.purchaseId || null,
        planName: location.state?.planName || null,
    });
    console.log("===== PaymentSuccess =====");
console.log("location.state:", location.state);
console.log("search:", location.search);

    useEffect(() => {
        const verifyPayment = async () => {
            // Already confirmed via CheckoutForm navigation state
            if (location.state?.purchaseId) {
                setPaymentState({
                    transactionId: location.state.transactionId || orderIdFromUrl,
                    serviceId: location.state.serviceId || null,
                    purchaseId: location.state.purchaseId,
                    planName: location.state.planName || null,
                });
                setStatus('success');
                return;
            }

            if (!orderIdFromUrl) {
                navigate('/payment-failed', {
                    replace: true,
                    state: { errorMessage: 'No payment information found.' },
                });
                return;
            }

            try {
                const { data } = await api.post('/payments/confirm', { orderId: orderIdFromUrl });
                console.log("verifyPayment()");

if (location.state?.purchaseId) {
    console.log("Using navigation state");
} else {
    console.log("No purchaseId in navigation state");
}

if (!orderIdFromUrl) {
    console.log("Redirecting to payment-failed because no order_id");
}

                if (data.success && data.purchaseId) {
                    setPaymentState({
                        transactionId: orderIdFromUrl,
                        serviceId: data.serviceId || null,
                        purchaseId: data.purchaseId,
                        planName: data.planName || null,
                    });
                    setStatus('success');
                    return;
                }

                navigate('/payment-failed', {
                    replace: true,
                    state: {
                        errorMessage: 'Payment could not be confirmed. Please try again or contact support.',
                        transactionId: orderIdFromUrl,
                        serviceId: data.serviceId || null,
                        planName: data.planName || null,
                    },
                });
            } catch (err) {
                console.error('Payment confirmation error:', err);
                navigate('/payment-failed', {
                    replace: true,
                    state: {
                        errorMessage:
                            err.response?.data?.message ||
                            'Payment was not completed. Please try again.',
                        transactionId: orderIdFromUrl,
                        serviceId: err.response?.data?.serviceId || null,
                        planName: err.response?.data?.planName || null,
                    },
                });
            }
        };

        verifyPayment();
    }, [orderIdFromUrl, location.state, navigate]);

    const { transactionId, serviceId, purchaseId, planName } = paymentState;

    const targetUrl =
        serviceId && purchaseId
            ? `/services/userform?service=${serviceId}&purchaseId=${purchaseId}`
            : '/dashboard';

    useEffect(() => {
        if (status !== 'success' || !purchaseId) return;

        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    navigate(targetUrl, { replace: true });
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [navigate, targetUrl, status, purchaseId]);

    if (status === 'verifying') {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-600 font-medium">Verifying your payment...</p>
                    <p className="text-slate-400 text-sm mt-1">Please do not close this page.</p>
                </div>
            </div>
        );
    }

    if (status !== 'success' || !purchaseId) {
        return null;
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-slate-100 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                </div>

                <h2 className="text-3xl font-bold text-slate-900 mb-2">Payment Successful!</h2>
                <p className="text-slate-600 mb-6">
                    Thank you for your payment. You can now proceed to file your
                    <span className="font-semibold text-slate-800"> {planName || 'ITR'}</span>.
                </p>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-8 inline-block w-full">
                    <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-1">
                        Transaction ID
                    </p>
                    <p className="text-slate-800 font-mono font-medium truncate">{transactionId}</p>
                </div>

                <div className="space-y-3">
                    <button
                        onClick={() => navigate(targetUrl, { replace: true })}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                    >
                        <FileText size={18} />
                        Start Filing Now
                    </button>

                    <button
                        onClick={() => navigate('/dashboard', { replace: true })}
                        className="w-full flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 py-3 px-6 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
                    >
                        <LayoutDashboard size={18} />
                        Go to Dashboard
                    </button>

                    <p className="text-sm text-slate-500 mt-4">
                        Redirecting in <span className="font-bold text-blue-600">{countdown}</span> seconds...
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;
