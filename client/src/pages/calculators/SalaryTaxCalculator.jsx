import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Info } from "lucide-react";
import { Helmet } from "react-helmet-async";
import Navbar from "../frontend/Navbar";
import Footer from "../frontend/Footer";

// ── Tax engines ───────────────────────────────────────────────────────────────

function newRegimeTax(taxable) {
  if (taxable <= 400000) return 0;
  if (taxable <= 800000) return (taxable - 400000) * 0.05;
  if (taxable <= 1200000) return 20000 + (taxable - 800000) * 0.10;
  if (taxable <= 1600000) return 60000 + (taxable - 1200000) * 0.15;
  if (taxable <= 2000000) return 120000 + (taxable - 1600000) * 0.20;
  if (taxable <= 2400000) return 200000 + (taxable - 2000000) * 0.25;
  return 300000 + (taxable - 2400000) * 0.30;
}

function oldRegimeTax(taxable) {
  if (taxable <= 250000) return 0;
  if (taxable <= 500000) return (taxable - 250000) * 0.05;
  if (taxable <= 1000000) return 12500 + (taxable - 500000) * 0.2;
  return 112500 + (taxable - 1000000) * 0.3;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

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

function RupeeInput({ label, value, onChange, info, max = 99999999 }) {
  return (
    <div className="mb-5">
      <label className="flex items-center gap-1.5 text-sm font-medium text-slate-600 mb-1.5">
        {label} {info && <InfoTip text={info} />}
      </label>
      <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-400 bg-white">
        <span className="px-3 text-slate-400 text-sm border-r border-slate-200 py-2.5 bg-slate-50">₹</span>
        <input type="text" inputMode="numeric"
          value={value === 0 ? "" : value.toLocaleString("en-IN")}
          onChange={(e) => { const r = e.target.value.replace(/[^0-9]/g, ""); onChange(r === "" ? 0 : Math.min(Number(r), max)); }}
          placeholder="0"
          className="flex-1 px-3 py-2.5 text-sm text-slate-800 outline-none bg-white" />
      </div>
    </div>
  );
}

function Row({ label, value, highlight, sub }) {
  return (
    <div className={`flex justify-between items-center py-2.5 border-b border-slate-50 last:border-0 ${highlight ? "bg-blue-50 px-3 rounded-lg" : ""}`}>
      <div>
        <span className="text-sm text-slate-600">{label}</span>
        {sub && <p className="text-[11px] text-slate-400">{sub}</p>}
      </div>
      <span className={`font-bold text-sm ${highlight ? "text-blue-700" : "text-slate-800"}`}>{value}</span>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function SalaryTaxCalculator() {
  const [regime, setRegime] = useState("new");

  // Salary components
  const [basic, setBasic] = useState(0);
  const [hra, setHra] = useState(0);
  const [specialAllowance, setSpecialAllowance] = useState(0);
  const [lta, setLta] = useState(0);
  const [otherAllowances, setOtherAllowances] = useState(0);
  const [pf, setPf] = useState(0); // Employee PF contribution

  // Old regime deductions
  const [hraExemption, setHraExemption] = useState(0);
  const [sec80C, setSec80C] = useState(0);
  const [sec80D, setSec80D] = useState(0);
  const [nps, setNps] = useState(0);
  const [homeLoanInt, setHomeLoanInt] = useState(0);

  const grossSalary = useMemo(() =>
    basic + hra + specialAllowance + lta + otherAllowances,
    [basic, hra, specialAllowance, lta, otherAllowances]
  );

  const result = useMemo(() => {
    const STD = regime === "new" ? 75000 : 50000;

    if (regime === "new") {
      const taxable = Math.max(0, grossSalary - STD);
      let tax = newRegimeTax(taxable);
      if (taxable <= 1200000) tax = 0;
      const cess = tax * 0.04;
      const totalTax = Math.round(tax + cess);
      const inHand = Math.round(grossSalary - totalTax - pf);
      return { grossSalary, STD, taxable, tax, cess, totalTax, inHand, deductions: 0 };
    } else {
      const totalDeductions = Math.min(sec80C, 150000) + Math.min(sec80D, 100000) +
        hraExemption + Math.min(nps, 50000) + Math.min(homeLoanInt, 200000);
      const taxable = Math.max(0, grossSalary - STD - totalDeductions);
      let tax = oldRegimeTax(taxable);
      if (taxable <= 500000) tax = 0;
      const cess = tax * 0.04;
      const totalTax = Math.round(tax + cess);
      const inHand = Math.round(grossSalary - totalTax - pf);
      return { grossSalary, STD, taxable, tax, cess, totalTax, inHand, deductions: totalDeductions };
    }
  }, [regime, grossSalary, pf, hraExemption, sec80C, sec80D, nps, homeLoanInt]);

  const monthly = (n) => fmt(Math.round(n / 12));

  return (
    <>
      <Helmet>
        <title>Salary Tax Calculator FY 2025-26 | In-Hand Salary | LedgerLine</title>
        <meta name="description" content="Calculate income tax on your salary for FY 2025-26. Enter basic, HRA, allowances and deductions to get your exact tax liability and monthly in-hand salary under old and new regime." />
        <meta name="keywords" content="salary tax calculator, salary income tax calculator, in-hand salary calculator, ITR filing, income tax return filing, income tax filing online, new regime salary tax, old regime deductions, 80C 80D HRA tax saving, tax on salary India FY 2025-26" />
        <meta property="og:title" content="Salary Tax Calculator FY 2025-26 | LedgerLine" />
        <meta property="og:description" content="Calculate your exact salary tax and monthly in-hand amount under old and new regime for FY 2025-26." />
        <meta property="og:url" content="https://powerfiling.com/calculators/salary-tax" />
        <link rel="canonical" href="https://powerfiling.com/calculators/salary-tax" />
      </Helmet>
      <Navbar />
      <main className="bg-white min-h-screen">
        {/* Header */}
        <div className="border-b border-slate-100 bg-white px-4 py-4">
          <div className="max-w-6xl mx-auto">
            <Link to="/calculators" className="inline-flex items-center gap-1.5 text-blue-500 hover:text-blue-700 text-sm mb-3 transition-colors">
              <ArrowLeft size={14} /> Back to Calculators
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Salary Tax Calculator</h1>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-xs text-slate-400">FY 2025-26 (AY 2026-27)</span>
              <span className="text-[11px] font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Budget 2025</span>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col lg:flex-row gap-6 items-start">

            {/* Inputs */}
            <div className="w-full lg:flex-1 space-y-5">

              {/* Regime toggle */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-sm font-bold text-slate-700 mb-4">Tax Regime</h2>
                <div className="grid grid-cols-2 gap-3">
                  {[{ v: "new", l: "New Regime (Default)" }, { v: "old", l: "Old Regime" }].map(({ v, l }) => (
                    <button key={v} onClick={() => setRegime(v)}
                      className={`py-2.5 rounded-lg text-sm font-medium border transition-all ${regime === v ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:border-blue-300"}`}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Salary breakdown */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-sm font-bold text-slate-700 mb-4">Salary Components (Annual)</h2>
                <div className="grid sm:grid-cols-2 gap-x-6">
                  <RupeeInput label="Basic Salary" value={basic} onChange={setBasic} info="Your annual basic salary component." />
                  <RupeeInput label="HRA Received" value={hra} onChange={setHra} info="House Rent Allowance received from employer annually." />
                  <RupeeInput label="Special Allowance" value={specialAllowance} onChange={setSpecialAllowance} info="Any special or performance allowance from your employer." />
                  <RupeeInput label="LTA" value={lta} onChange={setLta} info="Leave Travel Allowance. Partially exempt under old regime for actual travel." />
                  <RupeeInput label="Other Allowances" value={otherAllowances} onChange={setOtherAllowances} info="Any other taxable allowances not listed above." />
                  <RupeeInput label="Employee PF Contribution" value={pf} onChange={setPf} info="Your annual PF contribution (12% of basic). Deducted from take-home." />
                </div>
              </div>

              {/* Old regime deductions */}
              {regime === "old" && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                  <h2 className="text-sm font-bold text-slate-700 mb-1">Deductions (Old Regime Only)</h2>
                  <p className="text-xs text-slate-400 mb-4">These are not available under the new regime.</p>
                  <div className="grid sm:grid-cols-2 gap-x-6">
                    <RupeeInput label="HRA Exemption" value={hraExemption} onChange={setHraExemption} info="HRA exemption calculated separately. Use our HRA Calculator for the exact amount." />
                    <RupeeInput label="Section 80C" value={sec80C} onChange={setSec80C} max={150000} info="PPF, ELSS, LIC, NSC, home loan principal. Max ₹1,50,000." />
                    <RupeeInput label="Section 80D" value={sec80D} onChange={setSec80D} max={100000} info="Health insurance premium. Max ₹25,000 self + ₹25,000 parents." />
                    <RupeeInput label="NPS 80CCD(1B)" value={nps} onChange={setNps} max={50000} info="Additional NPS over 80C limit. Max ₹50,000." />
                    <RupeeInput label="Home Loan Interest (Sec 24b)" value={homeLoanInt} onChange={setHomeLoanInt} max={200000} info="Interest on self-occupied home loan. Max ₹2,00,000." />
                  </div>
                </div>
              )}
            </div>

            {/* Results */}
            <div className="w-full lg:w-72 xl:w-80 shrink-0 sticky top-20 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 pt-5 pb-4 border-b border-slate-100 bg-gradient-to-r from-blue-600 to-indigo-600">
                  <h2 className="text-base font-bold text-white text-center">Tax Summary</h2>
                  <p className="text-blue-200 text-xs text-center mt-0.5">{regime === "new" ? "New Regime" : "Old Regime"} · FY 2025-26</p>
                </div>
                <div className="px-5 py-4 space-y-1">
                  <Row label="Gross Salary" value={fmt(result.grossSalary)} />
                  <Row label="Standard Deduction" value={`–${fmt(result.STD)}`} />
                  {regime === "old" && <Row label="Chapter VI-A Deductions" value={`–${fmt(result.deductions)}`} />}
                  <Row label="Taxable Income" value={fmt(result.taxable)} />
                  <Row label="Income Tax" value={fmt(result.tax)} />
                  <Row label="4% Health & Ed. Cess" value={fmt(result.cess)} />
                  <Row label="Total Tax Payable" value={fmt(result.totalTax)} highlight />
                </div>
                <div className="px-5 pb-5 space-y-3 border-t border-slate-100 pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Monthly in-hand</span>
                    <span className="font-bold text-green-600">{monthly(result.inHand)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Annual in-hand</span>
                    <span className="font-bold text-green-600">{fmt(result.inHand)}</span>
                  </div>
                  <Link to="/services/salary-basic-itr"
                    className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold text-center py-3 rounded-xl transition-colors mt-2">
                    File ITR Now
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
