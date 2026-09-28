import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Info } from "lucide-react";
import { Helmet } from "react-helmet-async";
import Navbar from "../frontend/Navbar";
import Footer from "../frontend/Footer";

// ── Capital Gain Tax Rates (Budget 2024 / FY 2024-25 onwards) ─────────────────
// Equity / Equity MF:
//   STCG (held < 12 months) : 20% flat (changed from 15% in Budget 2024)
//   LTCG (held ≥ 12 months) : 12.5% flat on gains above ₹1.25L exemption (changed from 10% / ₹1L)
// Debt MF / Bonds (purchased after 1 Apr 2023):
//   Both STCG and LTCG : taxed at slab rate (no indexation)
// Property / Gold / Other:
//   STCG (held < 24 months for property, < 36 months for gold/other) : slab rate
//   LTCG : 12.5% without indexation (Budget 2024 removed indexation benefit)

const CESS = 0.04;

function withCess(tax) { return Math.round(tax * (1 + CESS)); }

const ASSET_TYPES = [
  { id: "equity",    label: "Equity / Equity MF",    stcgHolding: "12",  ltcgHolding: "12",  unit: "months" },
  { id: "debt",      label: "Debt MF / Bonds",        stcgHolding: "any", ltcgHolding: "any", unit: "" },
  { id: "property",  label: "Property",               stcgHolding: "24",  ltcgHolding: "24",  unit: "months" },
  { id: "gold",      label: "Gold / Other Assets",    stcgHolding: "36",  ltcgHolding: "36",  unit: "months" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmt = (n) => "₹" + Math.round(n).toLocaleString("en-IN");
const pct = (n) => (n * 100).toFixed(1) + "%";

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

// ── Rate table reference ──────────────────────────────────────────────────────

const RATE_TABLE = [
  { asset: "Equity / Equity MF", stcg: "20% (held < 12 months)", ltcg: "12.5% on gains above ₹1.25L (held ≥ 12 months)" },
  { asset: "Debt MF / Bonds*", stcg: "Slab rate", ltcg: "Slab rate" },
  { asset: "Property", stcg: "Slab rate (held < 24 months)", ltcg: "12.5% without indexation (held ≥ 24 months)" },
  { asset: "Gold / Other", stcg: "Slab rate (held < 36 months)", ltcg: "12.5% without indexation (held ≥ 36 months)" },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function CapitalGainTaxCalculator() {
  const [asset, setAsset] = useState("equity");
  const [gainType, setGainType] = useState("ltcg"); // stcg | ltcg
  const [salePrice, setSalePrice] = useState(0);
  const [costPrice, setCostPrice] = useState(0);
  const [slabRate, setSlabRate] = useState(30); // user's slab for debt/slab-based gains

  const gain = useMemo(() => Math.max(0, salePrice - costPrice), [salePrice, costPrice]);

  const result = useMemo(() => {
    if (gain === 0) return { tax: 0, effectiveGain: 0, rate: 0, note: "" };

    if (asset === "equity") {
      if (gainType === "stcg") {
        // 20% flat
        return { tax: withCess(gain * 0.20), effectiveGain: gain, rate: 0.20, note: "Flat 20% + 4% cess (Budget 2024)" };
      } else {
        // 12.5% on gains above ₹1.25L
        const taxableGain = Math.max(0, gain - 125000);
        return { tax: withCess(taxableGain * 0.125), effectiveGain: taxableGain, rate: 0.125, note: "12.5% on gains above ₹1.25L exemption + 4% cess (Budget 2024)" };
      }
    }

    if (asset === "debt") {
      // Always slab rate
      const rate = slabRate / 100;
      return { tax: withCess(gain * rate), effectiveGain: gain, rate, note: `Taxed at your slab rate (${slabRate}%) + 4% cess. No indexation.` };
    }

    if (asset === "property" || asset === "gold") {
      if (gainType === "stcg") {
        const rate = slabRate / 100;
        return { tax: withCess(gain * rate), effectiveGain: gain, rate, note: `Short-term gains taxed at your slab rate (${slabRate}%) + 4% cess.` };
      } else {
        // 12.5% no indexation (Budget 2024)
        return { tax: withCess(gain * 0.125), effectiveGain: gain, rate: 0.125, note: "12.5% flat without indexation + 4% cess (Budget 2024)." };
      }
    }

    return { tax: 0, effectiveGain: gain, rate: 0, note: "" };
  }, [asset, gainType, gain, slabRate]);

  const netProfit = gain - result.tax;

  return (
    <>
      <Helmet>
        <title>Capital Gains Tax Calculator FY 2025-26 | STCG & LTCG | LedgerLine</title>
        <meta name="description" content="Calculate short-term and long-term capital gains tax on equity, mutual funds, property and gold for FY 2025-26. Updated with Budget 2024 rates — STCG 20%, LTCG 12.5%." />
        <meta name="keywords" content="capital gains tax calculator, capital gains tax India, capital gains tax filing, capital gain tax calculation, LTCG calculator, STCG calculator, capital gains ITR filing, tax on capital gains, capital gains return filing, capital gains tax filing online" />
        <meta property="og:title" content="Capital Gains Tax Calculator FY 2025-26 | LedgerLine" />
        <meta property="og:description" content="Calculate STCG & LTCG tax on equity, property, gold and mutual funds. Budget 2024 rates." />
        <meta property="og:url" content="https://powerfiling.com/calculators/capital-gain-tax" />
        <link rel="canonical" href="https://powerfiling.com/calculators/capital-gain-tax" />
      </Helmet>
      <Navbar />
      <main className="bg-white min-h-screen">
        {/* Header */}
        <div className="border-b border-slate-100 bg-white px-4 py-4">
          <div className="max-w-6xl mx-auto">
            <Link to="/calculators" className="inline-flex items-center gap-1.5 text-blue-500 hover:text-blue-700 text-sm mb-3 transition-colors">
              <ArrowLeft size={14} /> Back to Calculators
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Capital Gain Tax Calculator</h1>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-xs text-slate-400">FY 2025-26 · Budget 2024 rates</span>
              <span className="text-[11px] font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Updated</span>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
          <div className="flex flex-col lg:flex-row gap-6 items-start">

            {/* Inputs */}
            <div className="w-full lg:flex-1 space-y-5">

              {/* Asset type */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-sm font-bold text-slate-700 mb-4">Asset Type</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {ASSET_TYPES.map(({ id, label }) => (
                    <button key={id} onClick={() => setAsset(id)}
                      className={`py-2.5 px-2 rounded-lg text-xs font-medium border transition-all text-center ${asset === id ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:border-blue-300"}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gain type */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-sm font-bold text-slate-700 mb-4">Gain Type</h2>
                {asset === "debt" ? (
                  <p className="text-sm text-slate-500 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                    For Debt MF / Bonds purchased after 1 Apr 2023, both STCG and LTCG are taxed at your income slab rate. No differentiation.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { v: "stcg", l: "Short-Term (STCG)" },
                      { v: "ltcg", l: "Long-Term (LTCG)" },
                    ].map(({ v, l }) => (
                      <button key={v} onClick={() => setGainType(v)}
                        className={`py-2.5 rounded-lg text-sm font-medium border transition-all ${gainType === v ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:border-blue-300"}`}>
                        {l}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Prices */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-sm font-bold text-slate-700 mb-4">Sale & Cost Details</h2>
                <div className="grid sm:grid-cols-2 gap-x-6">
                  <RupeeInput label="Sale Price / Proceeds" value={salePrice} onChange={setSalePrice}
                    info="Total amount received on sale of the asset." />
                  <RupeeInput label="Cost of Acquisition" value={costPrice} onChange={setCostPrice}
                    info="Original purchase price. For property/gold under old regime, you could use indexed cost, but Budget 2024 removed indexation for new purchases." />
                </div>

                {/* Slab rate input for slab-taxed assets */}
                {(asset === "debt" || gainType === "stcg") && (
                  <div className="mb-5">
                    <label className="flex items-center gap-1.5 text-sm font-medium text-slate-600 mb-1.5">
                      Your Income Tax Slab Rate (%)
                      <InfoTip text="Your applicable income tax rate — 5%, 20%, or 30% depending on total income. Used for slab-rate gains." />
                    </label>
                    <div className="flex gap-3">
                      {[5, 20, 30].map((r) => (
                        <button key={r} onClick={() => setSlabRate(r)}
                          className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${slabRate === r ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:border-blue-300"}`}>
                          {r}%
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Result panel */}
            <div className="w-full lg:w-72 xl:w-80 shrink-0 sticky top-20 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 pt-5 pb-4 border-b border-slate-100 bg-gradient-to-r from-blue-600 to-indigo-600">
                  <h2 className="text-base font-bold text-white text-center">Capital Gain Summary</h2>
                </div>
                <div className="px-5 py-4 space-y-2.5">
                  {[
                    { label: "Sale Proceeds", value: fmt(salePrice) },
                    { label: "Cost of Acquisition", value: `–${fmt(costPrice)}` },
                    { label: "Capital Gain", value: fmt(gain) },
                    ...(asset === "equity" && gainType === "ltcg" ? [{ label: "LTCG Exemption", value: `–${fmt(Math.min(gain, 125000))}` }] : []),
                    { label: "Taxable Gain", value: fmt(result.effectiveGain) },
                    { label: `Tax Rate`, value: `${(result.rate * 100).toFixed(1)}% + 4% cess` },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between items-center py-1.5 border-b border-slate-50 last:border-0">
                      <span className="text-sm text-slate-500">{row.label}</span>
                      <span className="font-semibold text-slate-800 text-sm">{row.value}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center py-2 bg-red-50 rounded-lg px-3 mt-1">
                    <span className="text-sm font-semibold text-slate-700">Tax Payable</span>
                    <span className="font-bold text-red-600 text-lg">{fmt(result.tax)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 bg-green-50 rounded-lg px-3">
                    <span className="text-sm font-semibold text-slate-700">Net Profit</span>
                    <span className="font-bold text-green-600 text-lg">{fmt(netProfit)}</span>
                  </div>
                  {result.note && (
                    <p className="text-[11px] text-slate-400 pt-1 leading-relaxed">{result.note}</p>
                  )}
                </div>
                <div className="px-5 pb-5">
                  <Link to="/services/capital-gain-itr"
                    className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold text-center py-3 rounded-xl transition-colors">
                    File Capital Gain ITR
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Rate reference table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800">Capital Gain Tax Rates Reference – FY 2025-26 (Budget 2024)</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Asset</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">STCG</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">LTCG</th>
                  </tr>
                </thead>
                <tbody>
                  {RATE_TABLE.map((r, i) => (
                    <tr key={i} className={`border-b border-slate-50 ${i % 2 === 1 ? "bg-slate-50" : ""}`}>
                      <td className="px-5 py-3 font-medium text-slate-700">{r.asset}</td>
                      <td className="px-5 py-3 text-slate-600">{r.stcg}</td>
                      <td className="px-5 py-3 text-slate-600">{r.ltcg}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="px-5 py-3 text-[11px] text-slate-400">
              * Debt MF purchased before 1 Apr 2023 follows old rules (LTCG at 20% with indexation after 3 years). + 4% health & education cess applies on all tax amounts. Surcharge applies for income above ₹50L.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
