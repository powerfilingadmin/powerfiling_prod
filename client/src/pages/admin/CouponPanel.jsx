// client/src/pages/admin/CouponPanel.jsx
import { useEffect, useState } from 'react';
import { Plus, Trash2, Edit2, Check, X, RefreshCw, Copy, ToggleLeft, ToggleRight } from 'lucide-react';
import api from '../../api/axios';

const EMPTY_FORM = {
    code: '', description: '', discountType: 'fixed',
    discountAmount: '', discountPercent: '', maxPercentDiscount: '',
    expiresAt: '', isActive: true, applicablePlans: []
};

const CouponPanel = () => {
    const [coupons, setCoupons] = useState([]);
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [copied, setCopied] = useState('');
    const [selectedCoupon, setSelectedCoupon] = useState(null);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [couponsRes, plansRes] = await Promise.all([
                api.get('/coupons'),
                api.get('/plans') // adjust if your plans endpoint differs
            ]);
            if (couponsRes.data.success) setCoupons(couponsRes.data.data);
            console.log('Fetched coupons:', couponsRes.data.data);
            if (plansRes.data.success) setPlans(plansRes.data.data);
        } catch (err) {
            console.error('[CouponPanel] fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAll(); }, []);

    const handleGenerateCode = async () => {
        const { data } = await api.get('/coupons/generate-code');
        if (data.success) setForm(prev => ({ ...prev, code: data.code }));
    };

    const handleCopy = (code) => {
        navigator.clipboard.writeText(code);
        setCopied(code);
        setTimeout(() => setCopied(''), 2000);
    };

    const togglePlan = (planId) => {
        setForm(prev => ({
            ...prev,
            applicablePlans: prev.applicablePlans.includes(planId)
                ? prev.applicablePlans.filter(p => p !== planId)
                : [...prev.applicablePlans, planId]
        }));
    };

    const handleSubmit = async () => {
        setError('');
        if (!form.code.trim()) return setError('Coupon code is required');
        if (form.discountType === 'fixed' && (!form.discountAmount || form.discountAmount <= 0))
            return setError('Discount amount must be greater than 0');
        if (form.discountType === 'percentage' && (!form.discountPercent || form.discountPercent <= 0 || form.discountPercent > 100))
            return setError('Discount percent must be between 1 and 100');

        setSubmitting(true);
        try {
            const payload = {
                description: form.description,
                discountType: form.discountType,
                discountAmount: form.discountType === 'fixed' ? Number(form.discountAmount) : undefined,
                discountPercent: form.discountType === 'percentage' ? Number(form.discountPercent) : undefined,
                maxPercentDiscount: form.maxPercentDiscount ? Number(form.maxPercentDiscount) : null,
                expiresAt: form.expiresAt || null,
                isActive: form.isActive,
                applicablePlans: form.applicablePlans
            };

            if (editingId) {
                await api.put(`/coupons/${editingId}`, payload);
                setSuccessMsg('Coupon updated successfully');
            } else {
                await api.post('/coupons', { code: form.code, ...payload });
                setSuccessMsg('Coupon created successfully');
            }
            setShowForm(false);
            setEditingId(null);
            setForm(EMPTY_FORM);
            fetchAll();
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (coupon) => {
        setEditingId(coupon._id);
        setForm({
            code: coupon.code,
            description: coupon.description || '',
            discountType: coupon.discountType,
            discountAmount: coupon.discountAmount || '',
            discountPercent: coupon.discountPercent || '',
            maxPercentDiscount: coupon.maxPercentDiscount || '',
            expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().split('T')[0] : '',
            isActive: coupon.isActive,
            applicablePlans: (coupon.applicablePlans || []).map(p => p._id || p)
        });
        setShowForm(true);
        setError('');
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this coupon?')) return;
        await api.delete(`/coupons/${id}`);
        fetchAll();
    };

    const handleToggle = async (coupon) => {
        await api.put(`/coupons/${coupon._id}`, { isActive: !coupon.isActive });
        fetchAll();
    };

    const isExpired = (d) => d && new Date() > new Date(d);

    if (loading) return <div className="flex items-center justify-center min-h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"/></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-white">Coupon Manager</h2>
                    <p className="text-zinc-400 text-sm mt-1">Fixed or percentage discounts · plan targeting · single use per user</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={fetchAll} className="p-2 text-zinc-400 hover:text-white border border-zinc-700 rounded-lg"><RefreshCw size={16}/></button>
                    <button onClick={() => { setShowForm(true); setEditingId(null); setForm(EMPTY_FORM); setError(''); }}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700">
                        <Plus size={16}/> New Coupon
                    </button>
                </div>
            </div>

            {successMsg && <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-xl"><Check size={16} className="text-green-400"/><p className="text-sm text-green-400 font-medium">{successMsg}</p></div>}

            {showForm && (
                <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-5">
                    <h3 className="text-white font-bold mb-4">{editingId ? 'Edit Coupon' : 'Create New Coupon'}</h3>
                    {error && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl mb-4"><p className="text-sm text-red-400">{error}</p></div>}

                    {/* Type toggle */}
                    <div className="flex gap-2 mb-4">
                        {['fixed', 'percentage'].map(t => (
                            <button key={t} type="button"
                                onClick={() => setForm(prev => ({ ...prev, discountType: t }))}
                                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                                    form.discountType === t ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                                }`}>
                                {t === 'fixed' ? '₹ Fixed Amount' : '% Percentage'}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase">Coupon Code *</label>
                            <div className="flex gap-2">
                                <input type="text" value={form.code} disabled={!!editingId}
                                    onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                                    placeholder="SAVE200"
                                    className="flex-1 px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 uppercase"/>
                                {!editingId && <button type="button" onClick={handleGenerateCode} className="px-3 py-2.5 bg-zinc-700 text-zinc-300 text-xs rounded-xl hover:bg-zinc-600">Auto</button>}
                            </div>
                        </div>

                        {form.discountType === 'fixed' ? (
                            <div>
                                <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase">Discount Amount (₹) *</label>
                                <input type="number" min="1" value={form.discountAmount}
                                    onChange={e => setForm(p => ({ ...p, discountAmount: e.target.value }))}
                                    placeholder="200"
                                    className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm outline-none focus:ring-2 focus:ring-blue-500"/>
                            </div>
                        ) : (
                            <div>
                                <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase">Discount Percent (%) *</label>
                                <input type="number" min="1" max="100" value={form.discountPercent}
                                    onChange={e => setForm(p => ({ ...p, discountPercent: e.target.value }))}
                                    placeholder="10"
                                    className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm outline-none focus:ring-2 focus:ring-blue-500"/>
                            </div>
                        )}

                        {form.discountType === 'percentage' && (
                            <div>
                                <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase">Max Discount Cap (₹) <span className="text-zinc-500 normal-case font-normal">(optional)</span></label>
                                <input type="number" min="1" value={form.maxPercentDiscount}
                                    onChange={e => setForm(p => ({ ...p, maxPercentDiscount: e.target.value }))}
                                    placeholder="e.g. 500"
                                    className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm outline-none focus:ring-2 focus:ring-blue-500"/>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase">Description</label>
                            <input type="text" value={form.description}
                                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                                placeholder="Diwali Special"
                                className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm outline-none focus:ring-2 focus:ring-blue-500"/>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase">Expiry Date <span className="text-zinc-500 normal-case font-normal">(empty = never)</span></label>
                            <input type="date" value={form.expiresAt} min={new Date().toISOString().split('T')[0]}
                                onChange={e => setForm(p => ({ ...p, expiresAt: e.target.value }))}
                                className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm outline-none focus:ring-2 focus:ring-blue-500"/>
                        </div>
                    </div>

                    {/* Plan targeting */}
                    <div className="mt-4">
                        <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase">
                            Applicable Plans <span className="text-zinc-500 normal-case font-normal">(none selected = all plans)</span>
                        </label>
                        <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-3 bg-zinc-800 border border-zinc-700 rounded-xl">
                            {plans.map(p => (
                                <button key={p._id} type="button" onClick={() => togglePlan(p._id)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                        form.applicablePlans.includes(p._id)
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                                    }`}>
                                    {p.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-3 mt-4">
                        <button type="button" onClick={() => setForm(p => ({ ...p, isActive: !p.isActive }))}
                            className={`relative w-10 h-6 rounded-full transition-colors ${form.isActive ? 'bg-green-500' : 'bg-zinc-600'}`}>
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${form.isActive ? 'translate-x-5' : 'translate-x-1'}`}/>
                        </button>
                        <span className="text-sm text-zinc-300">{form.isActive ? 'Active' : 'Inactive'}</span>
                    </div>

                    <div className="flex gap-3 mt-5">
                        <button onClick={handleSubmit} disabled={submitting}
                            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50">
                            <Check size={15}/> {submitting ? 'Saving...' : editingId ? 'Update Coupon' : 'Create Coupon'}
                        </button>
                        <button onClick={() => { setShowForm(false); setEditingId(null); setForm(EMPTY_FORM); setError(''); }}
                            className="flex items-center gap-2 px-5 py-2.5 border border-zinc-700 text-zinc-400 text-sm font-semibold rounded-xl hover:bg-zinc-800">
                            <X size={15}/> Cancel
                        </button>
                    </div>
                </div>
            )}

            {coupons.length === 0 ? (
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center"><p className="text-zinc-400">No coupons yet.</p></div>
            ) : (
                <div className="space-y-3">
                    {coupons.map(c => (
                        <div key={c._id} className={`bg-zinc-900 border rounded-2xl p-4 flex items-center justify-between gap-4 ${
                            !c.isActive || isExpired(c.expiresAt) ? 'border-zinc-800 opacity-60' : 'border-zinc-700'
                        }`}>
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 bg-zinc-800 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-zinc-700" onClick={() => handleCopy(c.code)}>
                                    <span className="font-mono font-bold text-white text-sm">{c.code}</span>
                                    {copied === c.code ? <Check size={13} className="text-green-400"/> : <Copy size={13} className="text-zinc-400"/>}
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-sm font-bold text-green-400">
                                            {c.discountType === 'percentage' ? `${c.discountPercent}% off${c.maxPercentDiscount ? ` (max ₹${c.maxPercentDiscount})` : ''}` : `₹${c.discountAmount} off`}
                                        </span>
                                        {c.description && <span className="text-xs text-zinc-400 truncate">{c.description}</span>}
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                                            !c.isActive ? 'bg-zinc-700 text-zinc-400' : isExpired(c.expiresAt) ? 'bg-red-900/40 text-red-400' : 'bg-green-900/40 text-green-400'
                                        }`}>{!c.isActive ? 'Inactive' : isExpired(c.expiresAt) ? 'Expired' : 'Active'}</span>
                                       

                                    {c.usedBy?.length > 0 && (
                                        <button
                                            onClick={() => setSelectedCoupon(c)}
                                            className="text-xs text-blue-400 font-medium"
                                        >
                                            <span className="text-xs hover:text-blue-300">
                                        {c.totalUses} uses
                                    </span>
                                        </button>
                                    )}
                                        <span className="text-xs text-zinc-500 mt-1">| {c.applicablePlans?.length ? `${c.applicablePlans.length} plan(s)` : 'All plans'}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                                <button onClick={() => handleToggle(c)} className="p-2 rounded-lg hover:bg-zinc-800">
                                    {c.isActive ? <ToggleRight size={18} className="text-green-400"/> : <ToggleLeft size={18} className="text-zinc-500"/>}
                                </button>
                                <button onClick={() => handleEdit(c)} className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white"><Edit2 size={16}/></button>
                                <button onClick={() => handleDelete(c._id)} className="p-2 rounded-lg hover:bg-red-900/30 text-zinc-400 hover:text-red-400"><Trash2 size={16}/></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {selectedCoupon && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="w-full max-w-lg rounded-2xl bg-zinc-900 border border-zinc-700 shadow-2xl">

            <div className="flex items-center justify-between p-5 border-b border-zinc-800">
                <div>
                    <h3 className="text-lg font-bold text-white">
                        Coupon Users
                    </h3>
                    <p className="text-sm text-zinc-400">
                        {selectedCoupon.code}
                    </p>
                </div>

                <button
                    onClick={() => setSelectedCoupon(null)}
                    className="text-zinc-400 hover:text-white text-xl"
                >
                    ✕
                </button>
            </div>
            <div className="max-h-80 overflow-y-auto p-5 space-y-2">
                {selectedCoupon.usedBy.map((u, index) => (
                    <div
                        key={index}
                        className="flex items-center justify-between rounded-xl bg-zinc-800 px-4 py-3"
                    >
                        <span className="font-mono text-sm text-zinc-300">
                            {u.userId}
                        </span>
                        <p className="text-xs text-zinc-500 ">
                    Used on{" "}
                    {new Date(u.usedAt).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                    })}
                </p>

                        <button
                            onClick={() => handleCopy(u.userId)}
                            className="text-zinc-400 hover:text-white"
                        >
                            {copied === u.userId ? (
                                <Check size={15} className="text-green-400" />
                            ) : (
                                <Copy size={15} />
                            )}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    </div>
)}
        </div>
    );
};

export default CouponPanel;