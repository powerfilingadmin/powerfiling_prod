import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  User,
  ShoppingBag,
  LogOut,
  HelpCircle,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Mail,
  Phone,
  Edit2,
  Package,
  Clock,
  CheckCircle,
  ArrowRight,
  Handshake,
} from "lucide-react";
import { Copy, Check, Coins, Gift, Users, ArrowDownToLine, CheckCircle2, XCircle } from 'lucide-react';
import Navbar from "../frontend/Navbar";
import Footer from "../frontend/Footer";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") || "profile",
  );
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const [referralData, setReferralData] = useState(null);
  const [referralLoading, setReferralLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [upiId, setUpiId] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawMsg, setWithdrawMsg] = useState({ text: '', type: '' });
  const [showRewardTable, setShowRewardTable] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };
  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const { data } = await api.get("/payments/my-orders");
      if (data.success) {
        // Map API data to dashboard format
        const mappedOrders = data.data.map((order) => ({
          id: order._id,
          service: order.serviceName || order.planId?.name || "Tax Service",
          date: order.createdAt,
          status: order.itrStatus || "Pending",
          amount: order.planId?.price ? `₹${order.planId.price}` : "Paid",
          originalData: order,
          statusDate: order.itrUpdatedAt || order.updatedAt,
          canFile: order.itrStatus === "Pending Filing",
          serviceSlug: order.planId?.slug || "salary-basic-itr", // Fallback or handle error
        }));
        setOrders(mappedOrders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoadingOrders(false);
    }
  };
 
  const fetchReferral = async () => {
    // console.log('[Referral] called, activeTab:', activeTab);
    // console.log('[Referral] api baseURL:', api.defaults.baseURL);
    try {
        setReferralLoading(true);
        const { data } = await api.get(`/referral/me`);
        console.log('[Referral] response:', data);
        if (data.success) setReferralData(data.data);
    } catch (err) {
        console.error('[Referral] fetch error:', err.response?.data || err.message);
        console.error('Referral fetch error:', err);
        setReferralLoading(false)
    } finally {
        setReferralLoading(false);
    }
};

  useEffect(() => {
    if (activeTab === 'orders') fetchOrders();
    if (activeTab === 'Refer') fetchReferral(); // ← is this line there?
}, [activeTab]);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["profile", "orders", "help"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const menuItems = [
    { id: "profile", label: "Profile", icon: User },
    { id: "orders", label: "My Orders", icon: ShoppingBag },
    { id: "Refer", label: "Refer & Cashbacks", icon: Handshake },
    { id: "help", label: "Need Help", icon: HelpCircle },
    { id: "logout", label: "Log Out", icon: LogOut },
  ];

  const handleMenuClick = (id) => {
    if (id === "logout") {
      handleLogout();
    } else {
      setActiveTab(id);
      if (id === 'Refer') fetchReferral();
    }
  };

  const renderProfile = () => (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900">
          Profile Information
        </h2>
        {/* <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold">
          <Edit2 size={18} />
          Edit Profile
        </button> */}
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-200">
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold font-['Outfit']">
            {user?.name?.charAt(0) || "U"}
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              {user?.name || "User Name"}
            </h3>
            <p className="text-slate-600">
              {user?.email || "user@example.com"}
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-blue-600 mt-1" />
            <div>
              <p className="text-sm text-slate-600 mb-1">Email Address</p>
              <p className="font-semibold text-slate-900">
                {user?.email || "user@example.com"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Phone className="w-5 h-5 text-blue-600 mt-1" />
            <div>
              <p className="text-sm text-slate-600 mb-1">Phone Number</p>
              <p className="font-semibold text-slate-900">
                {user?.mobile && !user.mobile.startsWith('G-') ? user.mobile : "Not provided"}
              </p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200">
          <h4 className="font-bold text-slate-900 mb-4">Account Details</h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-sm text-slate-600 mb-1">PAN Number</p>
              <p className="font-semibold text-slate-900">
                {user?.pan || "Not provided"}
              </p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-sm text-slate-600 mb-1">Role</p>
              <p className="font-semibold text-slate-900 capitalize">
                {user?.role || "User"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
 console.log('[UserDashboard] referralData:', referralData);

  const renderRefer = () => {
    const hasPendingWithdrawal = referralData?.withdrawalRequests?.some(r => r.status === 'pending');

    const handleCopy = () => {
        if (!referralData?.referralLink) return;
        navigator.clipboard.writeText(referralData.referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleWithdraw = async () => {
      if (!upiId.trim()) {
        setWithdrawMsg({ text: 'Please enter your UPI ID before withdrawing.', type: 'error' });
        return;
    }
    if (!upiId.includes('@')) {
        setWithdrawMsg({ text: 'Please enter a valid UPI ID (e.g. name@upi)', type: 'error' });
        return;
    }
        if (!upiId.includes('@')) return;
        if (!referralData || referralData.coins < 50) return;
        setWithdrawing(true);
        setWithdrawMsg({ text: '', type: '' });
        try {
            const { data } = await api.post('/referral/withdraw',{upiId});
            if (data.success) {
                setWithdrawMsg({ text: data.message, type: 'success' });
                fetchReferral();
            } else {
                setWithdrawMsg({ text: data.error || 'Withdrawal failed', type: 'error' });
            }
        } catch (err) {
            setWithdrawMsg({ text: err.response?.data?.error || 'Request failed', type: 'error' });
        } finally {
            setWithdrawing(false);
        }
    };

    if (referralLoading) return (
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading referral data...</p>
        </div>
    );

    return (
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 md:p-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Refer a Friend</h2>
                    <p className="text-sm sm:text-base text-slate-600 mt-1">Invite friends and earn coins · 1 coin = ₹1</p>
                </div>
                <div className="self-start sm:self-auto flex items-center gap-2 flex-wrap">
                <div className="flex flex-wrap gap-3 items-stretch">
    <div className="bg-blue-100 text-blue-700 px-4 py-2 min-h-[64px] rounded-xl font-bold text-sm flex items-center gap-2">
        <Coins size={16} />
        {referralData?.coins ?? 0} Referral
    </div>
    {/* Cashback coins badge */}
{(referralData?.cashbackCoins ?? 0) > 0 && (
    <div className="bg-green-100 min-h-[64px] text-green-700 px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2">
        <Coins size={16} />
        <div>
            <p>{referralData.cashbackCoins} Cashback</p>
            {referralData.cashbackCoinsExpiresAt && (
                <p className="text-xs font-normal text-green-600">
                    Expires {new Date(referralData.cashbackCoinsExpiresAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                    })}
                </p>
            )}
        </div>
    </div>
)}
    <div className={`px-4 py-2 flex items-center min-h-[64px] rounded-xl font-bold text-m ${
        referralData?.referralTier === 'partner' ? 'bg-purple-100 text-purple-700' :
        referralData?.referralTier === 'gold'    ? 'bg-yellow-100 text-yellow-700' :
        referralData?.referralTier === 'silver'  ? 'bg-gray-200 text-gray-700' :
                                                   'bg-slate-100 text-slate-600'
    }`}>
        {referralData?.referralTier === 'partner' ? '💎 Premium Partner' :
         referralData?.referralTier === 'gold'    ? '🥇 Gold' :
         referralData?.referralTier === 'silver'  ? '🥈 Silver' : '⭐ Standard'}
    </div>
    </div>
</div>
            </div>
          {/* Cashback expiry warning */}
          {referralData?.cashbackCoins > 0 && referralData?.cashbackCoinsExpiresAt && 
          new Date(referralData.cashbackCoinsExpiresAt) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) && (
              <div className="flex items-center gap-2 p-3 mb-2 bg-amber-50 border border-amber-200 rounded-xl">
                  <span>⚠️</span>
                  <p className="text-xs text-amber-700 font-medium">
                      Your <strong>{referralData.cashbackCoins} cashback coins</strong> expire on{' '}
                      <strong>{new Date(referralData.cashbackCoinsExpiresAt).toLocaleDateString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric'
                      })}</strong>. Use them before they're gone!
                  </p>
              </div>
          )}
            <div className="space-y-5 sm:space-y-6">
                {/* Referral Card */}
                <div className="bg-blue-600 rounded-2xl p-4 sm:p-6 text-white shadow-lg shadow-blue-500/10">
                    <h3 className="text-lg sm:text-xl font-bold mb-2">Earn rewards by referring your friends 🎉</h3>
                    <p className="text-sm sm:text-base text-blue-100 mb-5 leading-relaxed">
                        Share your referral link. When your friend makes their first purchase, you earn coins instantly.
                    </p>
                    <div className="bg-white/10 border border-white/20 rounded-xl p-3 sm:p-4">
                        <p className="text-xs sm:text-sm text-blue-100 mb-2">Your Referral Link</p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="flex-1 bg-white rounded-lg px-3 sm:px-4 py-3 text-slate-700 text-xs sm:text-sm font-medium truncate">
                                {referralData?.referralLink || 'Loading...'}
                            </div>
                            <button
                                onClick={handleCopy}
                                className="w-full sm:w-auto bg-white text-blue-600 px-5 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                            >
                                {copied ? <><Check size={16} /> Copied!</> : <><Copy size={16} /> Copy</>}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
        <p className="text-sm text-slate-500 mb-1">Referral Coins</p>
        <h4 className="text-xl sm:text-2xl font-bold text-blue-600">{referralData?.coins ?? 0}</h4>
        <p className="text-xs text-slate-400 mt-1">Withdrawable + discount</p>
    </div>
    <div className="bg-green-50 rounded-xl p-4 border border-green-200">
    <p className="text-sm text-slate-500 mb-1">Cashback Coins</p>
    <div className="flex justify-between items-center">
    <h4 className="text-xl font-bold text-green-600">{referralData?.cashbackCoins ?? 0}</h4>
    {referralData?.cashbackCoinsExpiresAt && (referralData?.cashbackCoins ?? 0) > 0 && (
        <div className={`text-xs mt-2 font-semibold px-2 py-1 rounded-full inline-block ${
            new Date(referralData.cashbackCoinsExpiresAt) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                ? 'bg-red-100 text-red-600'   // expiring within 30 days — red warning
                : 'bg-green-100 text-green-700' // more than 30 days — green
        }`}>
            ⏳ Expires {new Date(referralData.cashbackCoinsExpiresAt).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            })}
        </div>
    )}
    </div>
    <p className="text-xs text-slate-400 mt-1">Discount only</p>
    
</div>
    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
        <p className="text-sm text-slate-500 mb-1">Total Referrals</p>
        <h4 className="text-xl sm:text-2xl font-bold text-slate-900">{referralData?.totalReferrals ?? 0}</h4>
        <p className="text-xs text-slate-400 mt-1">Successful referrals</p>
    </div>
</div>

                {/* Milestones */}
                <div className="border border-slate-200 rounded-xl p-4">
                    <h4 className="font-bold text-slate-900 mb-3">Milestone Rewards</h4>
                    <div className="space-y-2">
                        {[
                            { count: 5,  bonus: '₹500 bonus',    tier: 'silver'  },
                            { count: 10, bonus: '₹1,500 bonus',  tier: 'gold'    },
                            { count: 25, bonus: 'Partner status', tier: 'partner' }
                        ].map(m => {
                            const reached = (referralData?.totalReferrals ?? 0) >= m.count;
                            return (
                                <div key={m.count} className={`flex items-center justify-between p-3 rounded-xl ${reached ? 'bg-green-50 border border-green-200' : 'bg-slate-50'}`}>
                                    <div className="flex items-center gap-2">
                                        {reached
                                            ? <CheckCircle2 size={16} className="text-green-500" />
                                            : <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                                        }
                                        <span className="text-sm text-slate-700">{m.count} referrals</span>
                                    </div>
                                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                                          reached && m.tier === 'partner' ? 'bg-purple-100 text-purple-700' :
                                          reached && m.tier === 'gold'    ? 'bg-yellow-100 text-yellow-700' :
                                          reached && m.tier === 'silver'  ? 'bg-gray-200 text-gray-700' :
                                                                            'bg-slate-200 text-slate-500'
                                      }`}>
                                          {m.bonus}
                                      </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Withdraw */}
                <div className="border border-slate-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <p className="font-semibold text-slate-800">Withdraw Referral Coins</p>
                            <p className="text-xs text-slate-400 mt-0.5">Min 50 coins · Processed within 7 days</p>
                        </div>
                        <span className="text-lg font-bold text-slate-800">₹{referralData?.coins ?? 0}</span>
                    </div>

                    {hasPendingWithdrawal && (
                        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl mb-3">
                            <Clock size={14} className="text-amber-600" />
                            <p className="text-xs text-amber-700 font-medium">Pending withdrawal request — processing within 7 days.</p>
                        </div>
                    )}

                    {withdrawMsg.text && (
                        <div className={`p-3 rounded-xl mb-3 text-xs font-medium ${withdrawMsg.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-600'}`}>
                            {withdrawMsg.text}
                        </div>
                    )}
                    <div className="mb-3">
    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
        UPI ID <span className="text-red-400">*</span>
    </label>
    <input
        type="text"
        value={upiId}
        disabled={withdrawing || (referralData?.coins ?? 0) < 50 || hasPendingWithdrawal}
        onChange={e => setUpiId(e.target.value)}
        placeholder="yourname@upi / yourname@okaxis"
        className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
    />
    <p className="text-xs text-slate-400 mt-1">Payment will be sent to this UPI ID within 7 days</p>
</div>

                    <button
                        onClick={handleWithdraw}
                        disabled={withdrawing || (referralData?.coins ?? 0) < 50 || hasPendingWithdrawal}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-slate-800 text-white font-semibold rounded-xl hover:bg-slate-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed text-sm"
                    >
                        <ArrowDownToLine size={16} />
                        {withdrawing ? 'Submitting...' : `Withdraw ₹${referralData?.coins ?? 0}`}
                    </button>
                    {(referralData?.coins ?? 0) < 50 && !hasPendingWithdrawal && (
                        <p className="text-xs text-slate-400 text-center mt-2">{50 - (referralData?.coins ?? 0)} more coins needed to withdraw</p>
                    )}
                </div>

                {/* Withdrawal History */}
{referralData?.withdrawalRequests?.length > 0 && (
    <div className="border border-slate-200 rounded-xl p-4">
        <h4 className="font-bold text-slate-900 mb-3">Withdrawal History</h4>
        <div className="space-y-2">
            {referralData.withdrawalRequests.map((r, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-3">
                        {r.status === 'approved' && <CheckCircle2 size={15} className="text-green-500" />}
                        {r.status === 'pending'  && <Clock size={15} className="text-amber-500" />}
                        {r.status === 'rejected' && <XCircle size={15} className="text-red-400" />}
                        <div>
                            <p className="text-sm font-semibold text-slate-700">₹{r.amount}</p>
                            <p className="text-xs text-slate-400">UPI: {r.upiId}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                            r.status === 'approved' ? 'bg-green-100 text-green-700' :
                            r.status === 'pending'  ? 'bg-amber-100 text-amber-700' :
                                                       'bg-red-100 text-red-600'
                        }`}>
                            {r.status === 'approved' ? '✓ Paid' :
                             r.status === 'pending'  ? '⏳ Processing' : '✗ Rejected'}
                        </span>
                        <p className="text-xs text-slate-400 mt-1">
                            {new Date(r.requestedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                        {r.adminNote && (
                            <p className="text-xs text-slate-400 mt-0.5">Note: {r.adminNote}</p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    </div>
)}

                {/* Earning History */}
                {referralData?.referralHistory?.length > 0 && (
                    <div className="border border-slate-200 rounded-xl p-4">
                        <h4 className="font-bold text-slate-900 mb-3">Earning History</h4>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-xs text-slate-400 uppercase border-b border-slate-100">
                                        <th className="text-left pb-2 font-semibold">Friend</th>
                                        <th className="text-left pb-2 font-semibold">Plan</th>
                                        <th className="text-right pb-2 font-semibold">Coins</th>
                                        <th className="text-right pb-2 font-semibold">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {referralData.referralHistory.map((item, i) => (
                                        <tr key={i}>
                                            <td className="py-2.5 text-slate-700 font-medium">
                                                {item.isBonus ? <span className="text-purple-600">🎁 Milestone Bonus</span> : item.referredUserName || 'Friend'}
                                            </td>
                                            <td className="py-2.5 text-slate-500 text-xs">{item.planName}</td>
                                            <td className="py-2.5 text-right font-bold text-green-600">+{item.coinsEarned}</td>
                                            <td className="py-2.5 text-right text-xs text-slate-400">
                                                {new Date(item.earnedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* How It Works */}
                <div className="pt-5 sm:pt-6 border-t border-slate-200">
                    <h4 className="font-bold text-slate-900 mb-4">How it Works</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                            { step: 1, title: 'Share Link', desc: 'Send your referral link to friends.' },
                            { step: 2, title: 'Friend Joins', desc: 'Your friend signs up and makes their first purchase.' },
                            { step: 3, title: 'Earn Coins', desc: 'Coins are credited to your account instantly.' }
                        ].map(s => (
                            <div key={s.step} className="bg-slate-50 rounded-xl p-4">
                                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mb-3">{s.step}</div>
                                <h5 className="font-semibold text-slate-900 mb-1">{s.title}</h5>
                                <p className="text-sm text-slate-600">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

{/* Reward Table - Collapsible */}
<div className="border border-slate-200 rounded-xl overflow-hidden">
    <button
        onClick={() => setShowRewardTable(!showRewardTable)}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
    >
        <div className="flex items-center gap-2">
            <h4 className="font-bold text-slate-900">Reward Structure</h4>
            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-semibold">16 plans</span>
        </div>
        {showRewardTable
            ? <ChevronUp size={18} className="text-slate-400" />
            : <ChevronDown size={18} className="text-slate-400" />
        }
    </button>

    {showRewardTable && (
        <div className="px-4 pb-4 border-t border-slate-100">
            <p className="text-xs text-slate-400 my-3">Coins earned when your friend makes their first purchase:</p>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-slate-50 text-xs text-slate-500 uppercase">
                            <th className="text-left px-3 py-2 rounded-l-lg font-semibold">Service</th>
                            <th className="text-right px-3 py-2 rounded-r-lg font-semibold">You Earn</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {[
                            { service: 'Salary ITR (Basic)',       amount: 50   },
                            { service: 'Salary ITR (Premium)',     amount: 100  },
                            { service: 'Capital Gain',             amount: 200  },
                            { service: 'Foreign / NRI Income',     amount: 300  },
                            { service: 'F&O Trading',              amount: 300  },
                            { service: 'Crypto Trading',           amount: 300  },
                            { service: 'Business & Profession',    amount: 200  },
                            { service: 'House Property',           amount: 100  },
                            { service: 'GST Registration',         amount: 200  },
                            { service: 'GST Filing',               amount: 100  },
                            { service: 'HUF Filing',               amount: 150  },
                            { service: 'HUF Registration',         amount: 200  },
                            { service: 'LLP Registration',         amount: 500  },
                            { service: 'Company Registration',     amount: 1000 },
                            { service: 'TDS Filing',               amount: 150  },
                            { service: 'PF & ESIC',                amount: 150  },
                        ].map((row, i) => (
                            <tr key={i} className="hover:bg-slate-50 transition-colors">
                                <td className="px-3 py-2.5 text-slate-700">{row.service}</td>
                                <td className="px-3 py-2.5 text-right">
                                    <span className={`font-bold ${
                                        row.amount >= 500 ? 'text-green-600' :
                                        row.amount >= 200 ? 'text-blue-600' :
                                                            'text-slate-600'
                                    }`}>
                                        +{row.amount} coins
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <p className="text-xs text-slate-400 mt-3">1 coin = ₹1 · Minimum withdrawal: 50 coins</p>
        </div>
    )}
</div>

                {/* Terms */}
                <div className="text-xs text-slate-400 space-y-1 pt-2 border-t border-slate-100">
                    <p className="font-semibold text-slate-500">Terms & Conditions</p>
                    <p>• Reward applicable only after successful payment and service completion.</p>
                    <p>• Self-referrals are not allowed. First purchase only.</p>
                    <p>• Cancelled or refunded orders do not qualify.</p>
                    <p>• Powerfiling reserves the right to modify this program at any time.</p>
                </div>
            </div>
        </div>
    );
};

  const renderOrders = () => (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">My Orders</h2>

      {loadingOrders ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600 mb-4">No orders yet</p>
          <button
            onClick={() => navigate("/")}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all"
          >
            Browse Services
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-shadow bg-gradient-to-br from-slate-50 to-white"
            >
              {/* Top section */}
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900 text-lg">
                    {order.service}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Order ID: <span className="font-mono text-slate-700">{order.id.substring(0, 16)}</span>
                  </p>
                </div>
                <div className="flex flex-col items-start md:items-end gap-2">
                  <p className="font-extrabold text-slate-900 text-xl">
                    ₹{order.originalData.finalAmountPaid}
                  </p>
                  <div
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
                      ["completed", "submitted"].includes(
                        order.status.toLowerCase(),
                      )
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {["completed", "submitted"].includes(
                      order.status.toLowerCase(),
                    ) ? (
                      <CheckCircle size={14} />
                    ) : (
                      <Clock size={14} />
                    )}
                    <span className="capitalize font-semibold">{order.status}</span>
                  </div>
                </div>
              </div>

              {/* Details section */}
              <div className="mb-4 pb-4 border-t border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm mt-3">
                  <p className="text-slate-600">
                    <span className="font-semibold">Order Date:</span> {new Date(order.date).toLocaleDateString()}
                  </p>
                  {order.statusDate && (
                    <p className="text-slate-500 flex items-center gap-1">
                      <Clock size={13} />
                      {new Date(order.statusDate).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </p>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                {order.canFile && (
                  <button
                    onClick={() =>
                      navigate(
                        `/services/userform?service=${order.serviceSlug}&purchaseId=${order.id}`,
                      )
                    }
                    className="flex items-center justify-center gap-2 text-white bg-blue-600 hover:bg-blue-700 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm"
                  >
                    Complete Filing
                    <ArrowRight size={16} />
                  </button>
                )}
                <button
                  onClick={() => navigate(`/order/${order.id}`)}
                  className="flex items-center justify-center gap-2 text-blue-600 bg-blue-50 hover:bg-blue-100 px-6 py-2.5 rounded-xl font-semibold text-sm border border-blue-200 transition-all"
                >
                  View Details
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderHelp = () => (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Need Help?</h2>

      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-bold text-slate-900 mb-4">Contact Support</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-blue-600" />
              <a
                href="mailto:support@powerfiling.com"
                className="text-blue-600 hover:underline"
              >
                support@powerfiling.com
              </a>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-blue-600" />
              <a
                href="tel:+911234567890"
                className="text-blue-600 hover:underline"
              >
                +91 98765 43210
              </a>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-bold text-slate-900 mb-4">
            Frequently Asked Questions
          </h3>
          <div className="space-y-3">
            {[
              "How do I track my order?",
              "What documents do I need for ITR filing?",
              "How long does the filing process take?",
              "Can I get a refund?",
            ].map((question, index) => (
              <button
                key={index}
                className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors text-left"
              >
                <span className="font-medium text-slate-900">{question}</span>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </button>
            ))}
          </div>
        </div>

        <div className="bg-blue-600 rounded-xl p-6 text-white shadow-lg shadow-blue-500/10">
          <h3 className="font-bold mb-2">Need Immediate Assistance?</h3>
          <p className="text-purple-100 mb-4">Chat with our support team</p>
          <button className="bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors">
            Start Live Chat
          </button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return renderProfile();
      case "orders":
        return renderOrders();
      case "Refer":
        return renderRefer();
      case "help":
        return renderHelp();
      default:
        return renderProfile();
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <main className="py-12 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              My Dashboard
            </h1>
            <p className="text-slate-600">
              Manage your account and track your services
            </p>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-4 sticky top-4">
                <nav className="space-y-2">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    const isLogout = item.id === "logout";

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleMenuClick(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                          isLogout
                            ? "text-red-600 hover:bg-red-50"
                            : isActive
                              ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                              : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <Icon size={20} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 min-w-0">{renderContent()}</div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default UserDashboard;
