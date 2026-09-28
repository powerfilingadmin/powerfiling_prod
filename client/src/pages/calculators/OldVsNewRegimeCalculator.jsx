import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Info } from "lucide-react";
import { Helmet } from "react-helmet-async";
import Navbar from "../frontend/Navbar";
import Footer from "../frontend/Footer";

// ── Tax engines (FY 2025-26) ────────────────────────────────────────────────

const STD_OLD = 50000;
const STD_NEW = 75000;

function oldTax(taxable) {
  if (taxable <= 250000) return 0;
  if (taxable <= 500000) return (taxable - 250000) * 0.05;
  if (taxable <= 1000000) return 12500 + (taxable - 500000) * 0.2;
  return 112500 + (taxable - 1000000) * 0.3;
}

function newTax(taxable) {
  if (taxable <= 400000) return 0;
  if (taxable <= 800000) return (taxable - 400000) * 0.05;
  if (taxable <= 1200000) return 20000 + (taxable - 800000) * 0.10;
  if (taxable <= 1600000) return 60000 + (taxable - 1200000) * 0.15;
  if (taxable <= 2000000) return 120000 + (taxable - 1600000) * 0.20;
  if (taxable <= 2400000) return 200000 + (taxable - 2000000) * 0.25;
  return 300000 + (taxable - 2400000) * 0.30;
}

function calcOld(gross, d) {
  const taxable = Math.max(0, gross - STD_OLD - d);
  let tax = oldTax(taxable);
  if (taxable <= 500000) tax = 0;
  const cess = tax * 0.04;
  return { taxable, tax, cess, total: Math.round(tax + cess) };
}

function calcNew(gross) {
  const taxable = Math.max(0, gross - STD_NEW);
  let tax = newTax(taxable);
  if (taxable <= 1200000) tax = 0;
  const cess = tax * 0.04;
  return { taxable, tax, cess, total: Math.round(tax + cess) };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n) => "₹" + Math.round(n).toLocaleString("en-IN");

function InfoTip({ text }) {
  const [show, setShow] = useState(false);
  return (
    <span className="relative inline-flex items-center">
      <button type="button" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}
        className="text-slate-400 hover:text-slate-600 transition-colors" aria-label="Info">
        <Info size={13} />
      </button>
      {show && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-30 w-56 bg-slate-800 text-white text-xs rounded-lg px-3 py-2 shadow-xl leading-relaxed whitespace-normal pointer-events-none">
          {text}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
        </span>
      )}
    </span>
  );
}

function RupeeInput({ label, value, onChange, info }) {
  return (
    <div className="mb-5">
      <label className="flex items-center gap-1.5 text-sm font-medium text-slate-600 mb-1.5">
        {label} {info && <InfoTip text={info} />}
      </label>
      <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-400 bg-white">
        <span className="px-3 text-slate-400 text-sm border-r border-slate-200 py-2.5 bg-slate-50">₹</span>
        <input type="text" inputMode="numeric"
          value={value === 0 ? "" : value.toLocaleString("en-IN")}
          onChange={(e) => { const r = e.target.value.replace(/[^0-9]/g, ""); onChange(r === "" ? 0 : Number(r)); }}
          placeholder="0"
          className="flex-1 px-3 py-2.5 text-sm text-slate-800 outline-none bg-white" />
      </div>
    </div>
  );
}

// Slab table data
const OLD_SLABS = [
  { range: "Up to ₹2.5L", rate: "Nil" },
  { range: "₹2.5L – ₹5L", rate: "5%" },
  { range: "₹5L – ₹10L", rate: "20%" },
  { range: "Above ₹10L", rate: "30%" },
];
const NEW_SLABS = [
  { range: "Up to ₹4L", rate: "Nil" },
  { range: "₹4L – ₹8L", rate: "5%" },
  { range: "₹8L – ₹12L", rate: "10%" },
  { range: "₹12L – ₹16L", rate: "15%" },
  { range: "₹16L – ₹20L", rate: "20%" },
  { range: "₹20L – ₹24L", rate: "25%" },
  { range: "Above ₹24L", rate: "30%" },
];

// ── Component ────────────────────────────────────────────────────────────────

export default function OldVsNewRegimeCalculator() {
  const [gross, setGross] = useState(0);
  const [deductions, setDeductions] = useState(0);

  const oldRes = useMemo(() => calcOld(gross, Math.min(deductions, 350000)), [gross, deductions]);
  const newRes = useMemo(() => calcNew(gross), [gross]);

  const saving = Math.abs(oldRes.total - newRes.total);
  const better = oldRes.total <= newRes.total ? "old" : "new";

  // Breakeven — income at which both regimes give equal tax
  // Approximate by stepping (simple, no solver needed for display purposes)
  const breakeven = useMemo(() => {
    for (let g = 0; g <= 5000000; g += 10000) {
      const o = calcOld(g, Math.min(deductions, 350000)).total;
      const n = calcNew(g).total;
      if (Math.abs(o - n) < 2000) return g;
    }
    return null;
  }, [deductions]);

  return (
    <>
      <Helmet>
        <title>Old vs New Regime Calculator FY 2025-26 | Tax Comparison | LedgerLine</title>
        <meta name="description" content="Compare old vs new tax regime for FY 2025-26. See which regime saves you more tax, breakeven income point, and updated Budget 2025 slab rates side by side." />
        <meta name="keywords" content="old vs new regime calculator, old regime new regime comparison, income tax regime comparison, new tax regime FY 2025-26, old tax regime deductions, ITR filing, income tax return filing, income tax filing online, which regime is better, tax savings India" />
        <meta property="og:title" content="Old vs New Tax Regime Calculator FY 2025-26 | LedgerLine" />
        <meta property="og:description" content="Compare old and new tax regime side by side. Find which saves you more for FY 2025-26." />
        <meta property="og:url" content="https://powerfiling.com/calculators/old-vs-new-regime" />
        <link rel="canonical" href="https://powerfiling.com/calculators/old-vs-new-regime" />
      </Helmet>
      <Navbar />
      <main className="bg-white min-h-screen">
        {/* Header */}
        <div className="border-b border-slate-100 bg-white px-4 py-4">
          <div className="max-w-6xl mx-auto">
            <Link to="/calculators" className="inline-flex items-center gap-1.5 text-blue-500 hover:text-blue-700 text-sm mb-3 transition-colors">
              <ArrowLeft size={14} /> Back to Calculators
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Old vs New Regime Calculator</h1>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-xs text-slate-400">FY 2025-26 (AY 2026-27)</span>
              <span className="text-[11px] font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Budget 2025</span>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
          {/* Input + Summary row */}
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* Inputs */}
            <div className="w-full lg:flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
              <h2 className="text-base font-bold text-slate-800 mb-6">Your Income Details</h2>
              <RupeeInput label="Annual Gross Income" value={gross} onChange={setGross}
                info="Total income from all sources before any deductions or standard deduction." />
              <RupeeInput label="Total Deductions (80C + 80D + HRA + Others)"
                value={deductions} onChange={setDeductions}
                info="Sum of all deductions you can claim under old regime — 80C (max ₹1.5L), 80D, HRA, NPS, home loan interest, etc. Capped at ₹3.5L for this comparison." />
              <p className="text-xs text-slate-400 mt-1">
                Standard deduction of ₹50,000 (Old) and ₹75,000 (New) is applied automatically.
              </p>
            </div>

            {/* Summary */}
            <div className="w-full lg:w-72 xl:w-80 shrink-0 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 pt-5 pb-4 border-b border-slate-100">
                  <h2 className="text-base font-bold text-slate-900 text-center">Regime Comparison</h2>
                </div>
                <div className="px-5 py-4 space-y-3 text-center">
                  <div>
                    <p className="text-xs font-semibold text-amber-600 mb-0.5">Old Regime</p>
                    <p className={`text-2xl font-bold ${better === "old" ? "text-green-600" : "text-slate-800"}`}>{fmt(oldRes.total)}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Taxable: {fmt(oldRes.taxable)}</p>
                  </div>
                  <p className="text-xs text-slate-400">vs</p>
                  <div>
                    <p className="text-xs font-semibold text-blue-600 mb-0.5">New Regime</p>
                    <p className={`text-2xl font-bold ${better === "new" ? "text-green-600" : "text-slate-800"}`}>{fmt(newRes.total)}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Taxable: {fmt(newRes.taxable)}</p>
                  </div>
                  <div className="bg-green-50 rounded-xl px-4 py-3 mt-1">
                    <p className="text-xs text-green-700 font-medium">You save</p>
                    <p className="text-xl font-bold text-green-600">{fmt(saving)}</p>
                    <p className="text-[11px] text-green-600 mt-0.5">with the {better === "old" ? "Old" : "New"} Regime</p>
                  </div>
                  {breakeven && (
                    <div className="bg-blue-50 rounded-xl px-4 py-2.5">
                      <p className="text-xs text-blue-700 font-medium">Breakeven income</p>
                      <p className="text-base font-bold text-blue-700">{fmt(breakeven)}</p>
                      <p className="text-[11px] text-blue-500">Both regimes give equal tax near this income</p>
                    </div>
                  )}
                </div>
                <div className="px-5 pb-5">
                  <Link to="/services/salary-basic-itr"
                    className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold text-center py-3 rounded-xl transition-colors">
                    File ITR Now
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Slab comparison tables */}
          <div className="grid sm:grid-cols-2 gap-6">
            {/* Old regime slabs */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 bg-amber-50">
                <h3 className="text-sm font-bold text-amber-800">Old Regime Slabs (Below 60)</h3>
                <p className="text-xs text-amber-600 mt-0.5">Std. deduction ₹50,000 + all Chapter VI-A deductions</p>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left px-5 py-2.5 text-xs font-semibold text-slate-500 uppercase">Income Range</th>
                    <th className="text-right px-5 py-2.5 text-xs font-semibold text-slate-500 uppercase">Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {OLD_SLABS.map((s, i) => (
                    <tr key={i} className={`border-b border-slate-50 ${i % 2 === 1 ? "bg-slate-50" : ""}`}>
                      <td className="px-5 py-2.5 text-slate-700">{s.range}</td>
                      <td className="px-5 py-2.5 text-right font-semibold text-slate-800">{s.rate}</td>
                    </tr>
                  ))}
                  <tr className="bg-amber-50">
                    <td className="px-5 py-2.5 text-amber-700 text-xs">87A Rebate</td>
                    <td className="px-5 py-2.5 text-right text-xs text-amber-700 font-medium">Nil tax if taxable ≤ ₹5L</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* New regime slabs */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 bg-blue-50">
                <h3 className="text-sm font-bold text-blue-800">New Regime Slabs – FY 2025-26</h3>
                <p className="text-xs text-blue-600 mt-0.5">Std. deduction ₹75,000 only. No other deductions allowed.</p>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left px-5 py-2.5 text-xs font-semibold text-slate-500 uppercase">Income Range</th>
                    <th className="text-right px-5 py-2.5 text-xs font-semibold text-slate-500 uppercase">Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {NEW_SLABS.map((s, i) => (
                    <tr key={i} className={`border-b border-slate-50 ${i % 2 === 1 ? "bg-slate-50" : ""}`}>
                      <td className="px-5 py-2.5 text-slate-700">{s.range}</td>
                      <td className="px-5 py-2.5 text-right font-semibold text-slate-800">{s.rate}</td>
                    </tr>
                  ))}
                  <tr className="bg-blue-50">
                    <td className="px-5 py-2.5 text-blue-700 text-xs">87A Rebate</td>
                    <td className="px-5 py-2.5 text-right text-xs text-blue-700 font-medium">Nil tax if taxable ≤ ₹12L</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
