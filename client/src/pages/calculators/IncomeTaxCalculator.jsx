import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Info, Share2, Check } from "lucide-react";
import { Helmet } from "react-helmet-async";
import Navbar from "../frontend/Navbar";
import Footer from "../frontend/Footer";

// ─── Tax engine ───────────────────────────────────────────────────────────────

const STD_DEDUCTION_OLD = 50000;
const STD_DEDUCTION_NEW = 75000; // Budget 2025

// Old regime — age-aware basic exemption limits
function calcOldRegime(gross, d, ageGroup) {
  const basicExemption =
    ageGroup === "above80" ? 500000 :
    ageGroup === "60to80"  ? 300000 : 250000;

  const taxable = Math.max(
    0,
    gross -
      STD_DEDUCTION_OLD -
      (d.sec80C || 0) -
      (d.sec80D || 0) -
      (d.hra || 0) -
      (d.homeLoanSelf || 0) -
      (d.nps || 0) -
      (d.otherDeductions || 0)
  );

  let tax = 0;
  if (taxable <= basicExemption) {
    tax = 0;
  } else if (ageGroup === "above80") {
    // Super senior: 0 up to 5L, 20% 5L–10L, 30% above 10L
    if (taxable <= 1000000) tax = (taxable - 500000) * 0.2;
    else tax = 100000 + (taxable - 1000000) * 0.3;
  } else if (ageGroup === "60to80") {
    // Senior: 0 up to 3L, 5% 3L–5L, 20% 5L–10L, 30% above 10L
    if (taxable <= 500000)       tax = (taxable - 300000) * 0.05;
    else if (taxable <= 1000000) tax = 10000 + (taxable - 500000) * 0.2;
    else                         tax = 110000 + (taxable - 1000000) * 0.3;
  } else {
    // Below 60: 0 up to 2.5L, 5% 2.5L–5L, 20% 5L–10L, 30% above 10L
    if (taxable <= 500000)       tax = (taxable - 250000) * 0.05;
    else if (taxable <= 1000000) tax = 12500 + (taxable - 500000) * 0.2;
    else                         tax = 112500 + (taxable - 1000000) * 0.3;
  }

  // 87A rebate — old regime: taxable ≤ 5L → full rebate (max ₹12,500)
  // Super senior (above80) has no 5% slab, so no rebate scenario applies
  let rebate87A = 0;
  if (ageGroup !== "above80" && taxable <= 500000) {
    rebate87A = tax;
    tax = 0;
  }

  const cess = tax * 0.04;
  return { taxable, tax, rebate87A, cess, total: Math.round(tax + cess) };
}

// New regime — FY 2025-26 (Budget 2025) 7-slab structure, same for all ages
function calcNewRegime(gross) {
  const taxable = Math.max(0, gross - STD_DEDUCTION_NEW);

  let tax = 0;
  if      (taxable <= 400000)  tax = 0;
  else if (taxable <= 800000)  tax = (taxable - 400000) * 0.05;
  else if (taxable <= 1200000) tax = 20000  + (taxable - 800000)  * 0.10;
  else if (taxable <= 1600000) tax = 60000  + (taxable - 1200000) * 0.15;
  else if (taxable <= 2000000) tax = 120000 + (taxable - 1600000) * 0.20;
  else if (taxable <= 2400000) tax = 200000 + (taxable - 2000000) * 0.25;
  else                         tax = 300000 + (taxable - 2400000) * 0.30;

  // 87A rebate — new regime: taxable ≤ 12L → rebate up to ₹60,000 (effectively ₹0 tax)
  let rebate87A = 0;
  if (taxable <= 1200000) {
    rebate87A = tax;
    tax = 0;
  }

  const cess = tax * 0.04;
  return { taxable, tax, rebate87A, cess, total: Math.round(tax + cess) };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n) =>
  "₹" +
  Math.round(n).toLocaleString("en-IN", { maximumFractionDigits: 0 });

function InfoTip({ text }) {
  const [show, setShow] = useState(false);
  return (
    <span className="relative inline-flex items-center">
      <button
        type="button"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onFocus={() => setShow(true)}
        onBlur={() => setShow(false)}
        className="text-slate-400 hover:text-slate-600 transition-colors"
        aria-label="Info"
      >
        <Info size={13} />
      </button>
      {show && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-30 w-56 bg-slate-800 text-white text-xs rounded-lg px-3 py-2 shadow-xl leading-relaxed whitespace-normal pointer-events-none">
          {text}
          {/* arrow */}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
        </span>
      )}
    </span>
  );
}

function RupeeInput({ label, value, onChange, max = 2000000, info, placeholder = "0" }) {
  return (
    <div className="mb-5">
      <label className="flex items-center gap-1.5 text-sm font-medium text-slate-600 mb-1.5">
        {label}
        {info && <InfoTip text={info} />}
      </label>
      <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-400 focus-within:border-blue-400 bg-white transition-all">
        <span className="px-3 text-slate-400 text-sm border-r border-slate-200 py-2.5 bg-slate-50">₹</span>
        <input
          type="text"
          inputMode="numeric"
          value={value === 0 ? "" : value.toLocaleString("en-IN")}
          onChange={(e) => {
            const raw = e.target.value.replace(/[^0-9]/g, "");
            onChange(raw === "" ? 0 : Math.min(Number(raw), max * 10));
          }}
          placeholder={placeholder}
          className="flex-1 px-3 py-2.5 text-sm text-slate-800 outline-none bg-white"
        />
      </div>
    </div>
  );
}

// ─── Tab definitions ──────────────────────────────────────────────────────────

const TABS = ["Basic details", "Income details", "Deduction"];

// ─── Main Component ───────────────────────────────────────────────────────────

const IncomeTaxCalculator = () => {
  const [tab, setTab] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    const shareData = {
      title: "Income Tax Calculator – FY 2025-26 | LedgerLine",
      text: "Calculate your income tax under Old & New Regime for FY 2025-26. Free online calculator.",
      url,
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch (_) { /* user cancelled */ }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (_) {
        prompt("Copy this link:", url);
      }
    }
  };

  // Basic details
  const [ageGroup, setAgeGroup] = useState("below60"); // below60 | 60to80 | above80
  const [assessmentYear, setAssessmentYear] = useState("2026-27");

  // Income details
  const [salary, setSalary] = useState(0);
  const [exemptAllowances, setExemptAllowances] = useState(0);
  const [interestIncome, setInterestIncome] = useState(0);
  const [rentalIncome, setRentalIncome] = useState(0);
  const [digitalAssets, setDigitalAssets] = useState(0);
  const [homeLoanSelfOccupied, setHomeLoanSelfOccupied] = useState(0);
  const [homeLoanLetOut, setHomeLoanLetOut] = useState(0);
  const [otherIncome, setOtherIncome] = useState(0);

  // Deductions
  const [sec80C, setSec80C] = useState(0);
  const [sec80D, setSec80D] = useState(0);
  const [hra, setHra] = useState(0);
  const [nps, setNps] = useState(0);
  const [otherDeductions, setOtherDeductions] = useState(0);

  // Gross income computation
  const grossIncome = useMemo(() => {
    const base =
      salary -
      exemptAllowances +
      interestIncome +
      rentalIncome +
      digitalAssets -
      homeLoanSelfOccupied -
      homeLoanLetOut +
      otherIncome;
    return Math.max(0, base);
  }, [
    salary, exemptAllowances, interestIncome, rentalIncome,
    digitalAssets, homeLoanSelfOccupied, homeLoanLetOut, otherIncome,
  ]);

  const deductionsObj = { sec80C, sec80D, hra, homeLoanSelf: homeLoanSelfOccupied, nps, otherDeductions };

  const oldResult = useMemo(() => calcOldRegime(grossIncome, deductionsObj, ageGroup), [
    grossIncome, sec80C, sec80D, hra, homeLoanSelfOccupied, nps, otherDeductions, ageGroup,
  ]);
  const newResult = useMemo(() => calcNewRegime(grossIncome), [grossIncome]);

  const saving = Math.abs(oldResult.total - newResult.total);
  const betterRegime = oldResult.total <= newResult.total ? "old" : "new";

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <Helmet>
        <title>Income Tax Calculator FY 2025-26 | Old vs New Regime | LedgerLine</title>
        <meta name="description" content="Free online income tax calculator for FY 2025-26. Compare old vs new regime, calculate tax liability, 87A rebate, and standard deduction instantly." />
        <meta name="keywords" content="income tax calculator, ITR filing, income tax return filing, income tax filing online, file ITR online, ITR filing services, income tax return filing online, tax calculation FY 2025-26, old regime new regime calculator, salary tax calculator India" />
        <meta property="og:title" content="Income Tax Calculator FY 2025-26 | LedgerLine" />
        <meta property="og:description" content="Calculate your income tax under Old & New Regime for FY 2025-26. Free, instant, accurate." />
        <meta property="og:url" content="https://powerfiling.com/calculators/income-tax" />
        <link rel="canonical" href="https://powerfiling.com/calculators/income-tax" />
      </Helmet>
      <Navbar />

      <main className="bg-white min-h-screen">
        {/* Top bar */}
        <div className="border-b border-slate-100 bg-white px-4 py-4">
          <div className="max-w-6xl mx-auto">
            <Link
              to="/calculators"
              className="inline-flex items-center gap-1.5 text-blue-500 hover:text-blue-700 text-sm mb-3 transition-colors"
            >
              <ArrowLeft size={14} />
              Back to Calculators
            </Link>
            <div className="flex items-start justify-between flex-wrap gap-2">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Income Tax Calculator – FY {assessmentYear === "2026-27" ? "2026-2027" : "2025-2026"}
                </h1>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-xs text-slate-400">Last updated on 1 Feb 2025</span>
                  <span className="text-[11px] font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                    Budget 2025 · FY 2025-26
                  </span>
                </div>
              </div>
              <button className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 border border-slate-200 rounded-lg px-3 py-1.5 transition-colors" onClick={handleShare}>
                {copied ? <Check size={13} className="text-green-500" /> : <Share2 size={13} />}
                {copied ? "COPIED!" : "SHARE"}
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col lg:flex-row gap-6 items-start">

            {/* ── Left: wizard panel ────────────────────────────────── */}
            <div className="w-full lg:flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

              {/* Tabs */}
              <div className="flex border-b border-slate-200">
                {TABS.map((t, i) => (
                  <button
                    key={t}
                    onClick={() => setTab(i)}
                    className={`flex-1 py-3.5 text-sm font-medium transition-all border-b-2 ${
                      tab === i
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="p-6 sm:p-8">

                {/* ── TAB 0: Basic Details ── */}
                {tab === 0 && (
                  <div>
                    <div className="mb-6">
                      <label className="flex items-center gap-1.5 text-sm font-medium text-slate-600 mb-2">
                        Assessment Year
                        <InfoTip text="The year for which you are filing your taxes. FY 2026-27 means income earned April 2026 – March 2027." />
                      </label>
                      <select
                        value={assessmentYear}
                        onChange={(e) => setAssessmentYear(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                      >
                        <option value="2026-27">AY 2026-27 (FY 2025-26)</option>
                        <option value="2025-26">AY 2025-26 (FY 2024-25)</option>
                      </select>
                    </div>

                    <div className="mb-6">
                      <label className="flex items-center gap-1.5 text-sm font-medium text-slate-600 mb-2">
                        Age Group
                        <InfoTip text="Tax slabs differ by age. Senior citizens (60–80) and super senior citizens (80+) have higher basic exemption limits under the old regime." />
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { val: "below60", label: "Below 60" },
                          { val: "60to80", label: "60 – 80" },
                          { val: "above80", label: "Above 80" },
                        ].map((opt) => (
                          <button
                            key={opt.val}
                            type="button"
                            onClick={() => setAgeGroup(opt.val)}
                            className={`py-2.5 rounded-lg text-sm font-medium border transition-all ${
                              ageGroup === opt.val
                                ? "border-blue-600 bg-blue-50 text-blue-700"
                                : "border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end mt-8">
                      <button
                        onClick={() => setTab(1)}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-8 py-2.5 rounded-lg transition-colors"
                      >
                        Continue
                      </button>
                    </div>
                  </div>
                )}

                {/* ── TAB 1: Income Details ── */}
                {tab === 1 && (
                  <div>
                    <div className="grid sm:grid-cols-2 gap-x-6">
                      <RupeeInput
                        label="Income from Salary"
                        value={salary}
                        onChange={setSalary}
                        info="Your gross CTC / total salary before any deductions. Include all components: basic, HRA, special allowance, etc."
                      />
                      <RupeeInput
                        label="Exempt allowances"
                        value={exemptAllowances}
                        onChange={setExemptAllowances}
                        info="Allowances exempt under Section 10 — LTA, children's education allowance, uniform allowance, etc."
                      />
                      <RupeeInput
                        label="Income from interest"
                        value={interestIncome}
                        onChange={setInterestIncome}
                        info="Interest earned from savings accounts, FDs, RDs, bonds, or any other source."
                      />
                      <RupeeInput
                        label="Interest on home loan – Self occupied"
                        value={homeLoanSelfOccupied}
                        onChange={setHomeLoanSelfOccupied}
                        max={200000}
                        info="Interest paid on home loan for a self-occupied property. Deductible up to ₹2,00,000 under Section 24(b)."
                      />
                      <RupeeInput
                        label="Rental income received"
                        value={rentalIncome}
                        onChange={setRentalIncome}
                        info="Annual rent received from any let-out property before standard deduction."
                      />
                      <RupeeInput
                        label="Interest on Home Loan – Let Out"
                        value={homeLoanLetOut}
                        onChange={setHomeLoanLetOut}
                        info="Interest paid on home loan for a let-out property. Full interest is deductible under Section 24(b)."
                      />
                      <RupeeInput
                        label="Income from digital assets"
                        value={digitalAssets}
                        onChange={setDigitalAssets}
                        info="Gains from crypto, NFTs or any virtual digital asset (VDA). Taxed at flat 30% + 4% cess."
                      />
                      <RupeeInput
                        label="Other income"
                        value={otherIncome}
                        onChange={setOtherIncome}
                        info="Any other income not covered above — gifts, freelance earnings, dividend, etc."
                      />
                    </div>

                    <div className="flex justify-between mt-6">
                      <button
                        onClick={() => setTab(0)}
                        className="text-sm text-slate-500 hover:text-slate-700 px-5 py-2.5 rounded-lg border border-slate-200 transition-colors"
                      >
                        Back
                      </button>
                      <button
                        onClick={() => setTab(2)}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-8 py-2.5 rounded-lg transition-colors"
                      >
                        Continue
                      </button>
                    </div>
                  </div>
                )}

                {/* ── TAB 2: Deductions ── */}
                {tab === 2 && (
                  <div>
                    <p className="text-xs text-slate-400 mb-5">
                      Deductions below apply only to the <strong className="text-slate-600">Old Regime</strong>. They are not available under the New Regime.
                    </p>
                    <div className="grid sm:grid-cols-2 gap-x-6">
                      <RupeeInput
                        label="Section 80C"
                        value={sec80C}
                        onChange={setSec80C}
                        max={150000}
                        info="Investments in PPF, ELSS, LIC premium, NSC, EPF, tuition fees, home loan principal. Max ₹1,50,000."
                      />
                      <RupeeInput
                        label="Section 80D – Medical Insurance"
                        value={sec80D}
                        onChange={setSec80D}
                        max={100000}
                        info="Health insurance premium for self, spouse, children (₹25,000) and parents (₹25,000). Senior citizen limits are higher."
                      />
                      <RupeeInput
                        label="HRA Exemption"
                        value={hra}
                        onChange={setHra}
                        info="House Rent Allowance exemption under Section 10(13A). Calculated based on actual HRA, rent paid and city."
                      />
                      <RupeeInput
                        label="NPS (Section 80CCD(1B))"
                        value={nps}
                        onChange={setNps}
                        max={50000}
                        info="Additional NPS contribution under Section 80CCD(1B) — over and above the ₹1.5L 80C limit. Max ₹50,000."
                      />
                      <RupeeInput
                        label="Other deductions"
                        value={otherDeductions}
                        onChange={setOtherDeductions}
                        info="80E (education loan), 80G (donations), 80TTA (savings interest), 80EEA (affordable housing), etc."
                      />
                    </div>

                    <div className="flex justify-between mt-6">
                      <button
                        onClick={() => setTab(1)}
                        className="text-sm text-slate-500 hover:text-slate-700 px-5 py-2.5 rounded-lg border border-slate-200 transition-colors"
                      >
                        Back
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* ── Right: Tax Liability Summary ─────────────────────── */}
            <div className="w-full lg:w-72 xl:w-80 shrink-0 sticky top-20 space-y-4">

              {/* Summary card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 pt-5 pb-4 border-b border-slate-100">
                  <h2 className="text-base font-bold text-slate-900 text-center">Tax Liability Summary</h2>
                </div>

                <div className="px-5 py-4 space-y-3 text-center">
                  {/* Old regime */}
                  <div>
                    <p className="text-xs font-semibold text-amber-600 mb-0.5">Old Regime</p>
                    <p className={`text-2xl font-bold ${betterRegime === "old" ? "text-green-600" : "text-slate-800"}`}>
                      {fmt(oldResult.total)}
                    </p>
                  </div>

                  <p className="text-xs text-slate-400">vs</p>

                  {/* New regime */}
                  <div>
                    <p className="text-xs font-semibold text-blue-600 mb-0.5">New Regime</p>
                    <p className={`text-2xl font-bold ${betterRegime === "new" ? "text-green-600" : "text-slate-800"}`}>
                      {fmt(newResult.total)}
                    </p>
                  </div>

                  {/* Savings banner */}
                  <div className="bg-green-50 rounded-xl px-4 py-3 mt-1">
                    <p className="text-xs text-green-700 font-medium">
                      You save
                    </p>
                    <p className="text-xl font-bold text-green-600">{fmt(saving)}</p>
                    <p className="text-[11px] text-green-600 mt-0.5">
                      with the {betterRegime === "old" ? "Old" : "New"} Regime
                    </p>
                  </div>
                </div>

                <div className="px-5 pb-5">
                  <Link
                    to="/services/salary-basic-itr"
                    className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold text-center py-3 rounded-xl transition-colors"
                  >
                    File Now
                  </Link>
                </div>
              </div>

              {/* Breakdown card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <h3 className="text-sm font-bold text-slate-700 mb-3">Detailed Breakdown</h3>
                <div className="space-y-0.5 text-sm">
                  {[
                    { label: "Gross Income", value: fmt(grossIncome) },
                    { label: "Std. Deduction (Old)", value: `–${fmt(STD_DEDUCTION_OLD)}` },
                    { label: "Std. Deduction (New)", value: `–${fmt(STD_DEDUCTION_NEW)}` },
                    { label: "Taxable Income (Old)", value: fmt(oldResult.taxable) },
                    { label: "Taxable Income (New)", value: fmt(newResult.taxable) },
                    { label: "Tax Before Rebate (Old)", value: fmt(oldResult.tax + oldResult.rebate87A) },
                    { label: "Tax Before Rebate (New)", value: fmt(newResult.tax + newResult.rebate87A) },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between items-center py-1.5 border-b border-slate-50 last:border-0">
                      <span className="text-slate-500 text-xs">{row.label}</span>
                      <span className="font-semibold text-slate-700 text-xs">{row.value}</span>
                    </div>
                  ))}

                  {/* 87A Rebate rows — only shown when applicable */}
                  {oldResult.rebate87A > 0 && (
                    <div className="flex justify-between items-center py-1.5 border-b border-green-100 bg-green-50 px-2 rounded-lg">
                      <div>
                        <span className="text-green-700 text-xs font-semibold">Rebate u/s 87A (Old)</span>
                        <p className="text-[10px] text-green-500">Taxable ≤ ₹5L → full rebate</p>
                      </div>
                      <span className="font-bold text-green-700 text-xs">–{fmt(oldResult.rebate87A)}</span>
                    </div>
                  )}
                  {newResult.rebate87A > 0 && (
                    <div className="flex justify-between items-center py-1.5 border-b border-green-100 bg-green-50 px-2 rounded-lg">
                      <div>
                        <span className="text-green-700 text-xs font-semibold">Rebate u/s 87A (New)</span>
                        <p className="text-[10px] text-green-500">Taxable ≤ ₹12L → full rebate</p>
                      </div>
                      <span className="font-bold text-green-700 text-xs">–{fmt(newResult.rebate87A)}</span>
                    </div>
                  )}

                  {[
                    { label: "Tax After Rebate (Old)", value: fmt(oldResult.tax) },
                    { label: "Tax After Rebate (New)", value: fmt(newResult.tax) },
                    { label: "4% Cess (Old)", value: fmt(oldResult.cess) },
                    { label: "4% Cess (New)", value: fmt(newResult.cess) },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between items-center py-1.5 border-b border-slate-50 last:border-0">
                      <span className="text-slate-500 text-xs">{row.label}</span>
                      <span className="font-semibold text-slate-700 text-xs">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default IncomeTaxCalculator;
