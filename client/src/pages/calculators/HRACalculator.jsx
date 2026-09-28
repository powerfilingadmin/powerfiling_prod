import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Info } from "lucide-react";
import { Helmet } from "react-helmet-async";
import Navbar from "../frontend/Navbar";
import Footer from "../frontend/Footer";

// ── HRA Exemption Formula ─────────────────────────────────────────────────────
// Exempt = LEAST of:
//   1. Actual HRA received from employer
//   2. 50% of basic salary (metro) OR 40% of basic salary (non-metro)
//   3. Actual rent paid − 10% of basic salary
// Only available under Old Regime. Not allowed under New Regime.

const fmt = (n) => "₹" + Math.round(Math.max(0, n)).toLocaleString("en-IN");

function InfoTip({ text }) {
  const [show, setShow] = useState(false);
  return (
    <span className="relative inline-flex items-center">
      <button type="button" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}
        className="text-slate-400 hover:text-slate-600 transition-colors" aria-label="Info">
        <Info size={13} />
      </button>
      {show && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-30 w-60 bg-slate-800 text-white text-xs rounded-lg px-3 py-2 shadow-xl leading-relaxed whitespace-normal pointer-events-none">
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

export default function HRACalculator() {
  const [basic, setBasic] = useState(0);       // Annual basic salary
  const [hraReceived, setHraReceived] = useState(0); // Annual HRA from employer
  const [rentPaid, setRentPaid] = useState(0);  // Annual rent paid
  const [isMetro, setIsMetro] = useState(true); // Metro or non-metro

  const result = useMemo(() => {
    const condition1 = hraReceived;
    const condition2 = isMetro ? basic * 0.5 : basic * 0.4;
    const condition3 = Math.max(0, rentPaid - basic * 0.1);

    const exemption = Math.min(condition1, condition2, condition3);
    const taxableHra = Math.max(0, hraReceived - exemption);

    return { condition1, condition2, condition3, exemption, taxableHra };
  }, [basic, hraReceived, rentPaid, isMetro]);

  const limiting = (() => {
    const { condition1, condition2, condition3 } = result;
    const min = Math.min(condition1, condition2, condition3);
    if (min === condition1) return 1;
    if (min === condition2) return 2;
    return 3;
  })();

  return (
    <>
      <Helmet>
        <title>HRA Exemption Calculator FY 2025-26 | Section 10(13A) | LedgerLine</title>
        <meta name="description" content="Calculate your HRA (House Rent Allowance) exemption under Section 10(13A) for FY 2025-26. Find the minimum of 3 conditions instantly. Old regime only." />
        <meta name="keywords" content="HRA calculator, HRA exemption calculator, house rent allowance exemption, Section 10(13A), HRA exemption old regime, ITR filing, income tax return filing, income tax filing online, salary tax deductions India" />
        <meta property="og:title" content="HRA Exemption Calculator FY 2025-26 | LedgerLine" />
        <meta property="og:description" content="Calculate your HRA exemption under Section 10(13A). Old regime only. Instant result." />
        <meta property="og:url" content="https://powerfiling.com/calculators/hra" />
        <link rel="canonical" href="https://powerfiling.com/calculators/hra" />
      </Helmet>
      <Navbar />
      <main className="bg-white min-h-screen">
        {/* Header */}
        <div className="border-b border-slate-100 bg-white px-4 py-4">
          <div className="max-w-6xl mx-auto">
            <Link to="/calculators" className="inline-flex items-center gap-1.5 text-blue-500 hover:text-blue-700 text-sm mb-3 transition-colors">
              <ArrowLeft size={14} /> Back to Calculators
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">HRA Exemption Calculator</h1>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-xs text-slate-400">Section 10(13A) · Old Regime only</span>
              <span className="text-[11px] font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">FY 2025-26</span>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col lg:flex-row gap-6 items-start">

            {/* Inputs */}
            <div className="w-full lg:flex-1 space-y-5">

              {/* City type */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-sm font-bold text-slate-700 mb-1">City Type</h2>
                <p className="text-xs text-slate-400 mb-4">Metro cities (Delhi, Mumbai, Chennai, Kolkata) get 50% of basic; others get 40%.</p>
                <div className="grid grid-cols-2 gap-3">
                  {[{ v: true, l: "Metro City (50%)" }, { v: false, l: "Non-Metro (40%)" }].map(({ v, l }) => (
                    <button key={String(v)} onClick={() => setIsMetro(v)}
                      className={`py-2.5 rounded-lg text-sm font-medium border transition-all ${isMetro === v ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:border-blue-300"}`}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Salary & rent inputs */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-sm font-bold text-slate-700 mb-5">Annual Figures</h2>
                <RupeeInput label="Basic Salary (Annual)" value={basic} onChange={setBasic}
                  info="Your annual basic salary. Do NOT include HRA or other allowances here." />
                <RupeeInput label="HRA Received from Employer (Annual)" value={hraReceived} onChange={setHraReceived}
                  info="Total HRA component received from your employer annually." />
                <RupeeInput label="Actual Rent Paid (Annual)" value={rentPaid} onChange={setRentPaid}
                  info="Total rent you actually paid during the year. If rent > ₹1L/year, PAN of landlord is required." />
              </div>

              {/* Formula explanation */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6">
                <h2 className="text-sm font-bold text-slate-700 mb-3">How HRA Exemption is Calculated</h2>
                <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                  The HRA exemption is the <strong className="text-slate-700">minimum</strong> of these three conditions:
                </p>
                <div className="space-y-3">
                  {[
                    { n: 1, label: "Actual HRA received", value: result.condition1 },
                    { n: 2, label: `${isMetro ? "50%" : "40%"} of Basic Salary (${isMetro ? "metro" : "non-metro"})`, value: result.condition2 },
                    { n: 3, label: "Rent paid − 10% of Basic Salary", value: result.condition3 },
                  ].map(({ n, label, value }) => (
                    <div key={n} className={`flex items-center justify-between rounded-xl px-4 py-3 border ${limiting === n ? "border-blue-400 bg-blue-50" : "border-slate-200 bg-white"}`}>
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${limiting === n ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"}`}>{n}</span>
                        <span className="text-sm text-slate-600">{label}</span>
                      </div>
                      <div className="text-right">
                        <span className={`font-bold text-sm ${limiting === n ? "text-blue-700" : "text-slate-700"}`}>{fmt(value)}</span>
                        {limiting === n && <p className="text-[10px] text-blue-500 font-medium">← Limiting factor</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Result panel */}
            <div className="w-full lg:w-72 xl:w-80 shrink-0 sticky top-20 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 pt-5 pb-4 bg-gradient-to-r from-blue-600 to-indigo-600 border-b border-slate-100">
                  <h2 className="text-base font-bold text-white text-center">HRA Exemption Result</h2>
                  <p className="text-blue-200 text-xs text-center mt-0.5">Section 10(13A) · Old Regime</p>
                </div>
                <div className="px-5 py-4 space-y-2.5">
                  {[
                    { label: "HRA Received", value: fmt(hraReceived) },
                    { label: "HRA Exempt", value: fmt(result.exemption), green: true },
                    { label: "Taxable HRA", value: fmt(result.taxableHra), red: true },
                  ].map(({ label, value, green, red }) => (
                    <div key={label} className={`flex justify-between items-center py-2.5 border-b border-slate-50 last:border-0 ${green ? "bg-green-50 px-3 rounded-lg" : red ? "bg-red-50 px-3 rounded-lg" : ""}`}>
                      <span className="text-sm text-slate-600">{label}</span>
                      <span className={`font-bold text-sm ${green ? "text-green-700" : red ? "text-red-600" : "text-slate-800"}`}>{value}</span>
                    </div>
                  ))}
                </div>
                <div className="px-5 pb-4 text-center border-t border-slate-100 pt-4">
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    Add <strong className="text-slate-600">{fmt(result.exemption)}</strong> as HRA Exemption in your deductions when filing ITR under the Old Regime.
                  </p>
                  <Link to="/services/salary-basic-itr"
                    className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold text-center py-3 rounded-xl transition-colors">
                    File ITR with HRA
                  </Link>
                </div>
              </div>

              {/* Note */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <p className="text-xs text-amber-800 leading-relaxed font-medium mb-1">Important Notes</p>
                <ul className="text-xs text-amber-700 space-y-1.5 list-disc list-inside">
                  <li>HRA exemption is only available under the <strong>Old Regime</strong>.</li>
                  <li>You must be paying rent to claim this exemption.</li>
                  <li>If annual rent &gt; ₹1,00,000, landlord's PAN is mandatory.</li>
                  <li>If paying to a relative, exemption may be disallowed.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
