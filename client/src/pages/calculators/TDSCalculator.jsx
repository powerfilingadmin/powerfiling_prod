import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Info } from "lucide-react";
import { Helmet } from "react-helmet-async";
import Navbar from "../frontend/Navbar";
import Footer from "../frontend/Footer";

// ── TDS Rate Table (FY 2025-26 / AY 2026-27) ─────────────────────────────────
// Sources: Income Tax Act 1961 as amended by Finance Act 2025 (Budget 2025)
// Key Budget 2025 changes effective 1 Apr 2025:
//   • 194A — bank interest threshold: ₹40,000 → ₹50,000 (non-senior); ₹50,000 → ₹1,00,000 (senior citizen); others ₹5,000 → ₹10,000
//   • 194-I — annual rent threshold: ₹2,40,000 → ₹6,00,000 (i.e. ₹50,000/month)
//   • 194-IB — individual/HUF rent rate: 5% → 2% (effective 1 Oct 2024)
//   • 194H — commission/brokerage threshold: ₹15,000 (unchanged), rate reduced from 5% → 2% (effective 1 Oct 2024) — but officially 5% as per Act; Budget 2025 kept 5%
//   • 194T — NEW section: salary/commission/remuneration to firm partners, 10% above ₹20,000
//   • 194O — e-commerce: rate reduced 1% → 0.1% (effective 1 Oct 2024)
//   • 194DA — insurance maturity proceeds: 5% → 2% (effective 1 Oct 2024)

const TDS_SECTIONS = [
  // ── Salary ──────────────────────────────────────────────────────────────────
  {
    section: "192",
    nature: "Salary",
    category: "salary",
    threshold: 0,
    rate: null,
    notes: "TDS on salary is calculated at the applicable income tax slab rate on estimated annual income. No fixed flat rate.",
    isSlab: true,
  },
  // ── Interest ────────────────────────────────────────────────────────────────
  {
    section: "194A",
    nature: "Interest on FD / Savings — Bank / Post Office (Non-Senior)",
    category: "interest",
    threshold: 50000,
    rate: 0.10,
    notes: "Threshold ₹50,000/year (Budget 2025, raised from ₹40,000). For senior citizens the threshold is ₹1,00,000. PAN mandatory to avoid 20% TDS (Sec 206AA).",
  },
  {
    section: "194A",
    nature: "Interest on FD / Savings — Bank / Post Office (Senior Citizen)",
    category: "interest",
    threshold: 100000,
    rate: 0.10,
    notes: "Threshold ₹1,00,000/year for senior citizens (Budget 2025, raised from ₹50,000). PAN mandatory to avoid 20% TDS.",
  },
  {
    section: "194A",
    nature: "Interest from Other Sources (Company Deposits, Loans etc.)",
    category: "interest",
    threshold: 10000,
    rate: 0.10,
    notes: "Threshold ₹10,000/year (Budget 2025, raised from ₹5,000). Covers deposits with companies, co-operative societies other than banks, etc.",
  },
  {
    section: "193",
    nature: "Interest on Securities (Debentures / Bonds)",
    category: "interest",
    threshold: 10000,
    rate: 0.10,
    notes: "10% TDS on interest above ₹10,000/year on listed debentures and bonds. Govt. securities and RBI bonds are generally exempt.",
  },
  // ── Contractor ──────────────────────────────────────────────────────────────
  {
    section: "194C",
    nature: "Payment to Contractor",
    category: "contractor",
    threshold: 30000,
    rate: 0.01,
    notes: "1% for Individual/HUF payees; 2% for companies/firms. Threshold: single payment > ₹30,000 OR aggregate > ₹1,00,000 in a year.",
    hasVariant: true,
    variantLabel: "Payee Type",
    variants: [
      { label: "Individual / HUF", rate: 0.01 },
      { label: "Company / Firm", rate: 0.02 },
    ],
  },
  // ── Commission / Brokerage ──────────────────────────────────────────────────
  {
    section: "194H",
    nature: "Commission / Brokerage",
    category: "commission",
    threshold: 15000,
    rate: 0.05,
    notes: "5% TDS on commission or brokerage above ₹15,000/year. Covers insurance agents, brokers, etc. (Excludes securities transactions.)",
  },
  // ── Rent ────────────────────────────────────────────────────────────────────
  {
    section: "194I",
    nature: "Rent — by Business / Entity (Tax Audit applicable)",
    category: "rent",
    threshold: 600000,
    rate: 0.10,
    notes: "Threshold raised to ₹6,00,000/year (₹50,000/month) by Budget 2025, up from ₹2,40,000. 10% for land/building/furniture; 2% for plant & machinery.",
    hasVariant: true,
    variantLabel: "Asset Type",
    variants: [
      { label: "Land / Building / Furniture", rate: 0.10 },
      { label: "Plant & Machinery / Equipment", rate: 0.02 },
    ],
  },
  {
    section: "194IB",
    nature: "Rent — by Individual / HUF (> ₹50,000/month)",
    category: "rent",
    threshold: 50000,
    rate: 0.02,
    notes: "2% TDS (reduced from 5% effective 1 Oct 2024) when monthly rent exceeds ₹50,000. Deducted once at year-end or on vacation of property. Filed via Form 26QC.",
  },
  // ── Professional / Technical ────────────────────────────────────────────────
  {
    section: "194J",
    nature: "Professional / Technical Services Fees",
    category: "professional",
    threshold: 30000,
    rate: 0.10,
    notes: "10% for professional services (doctors, lawyers, CAs, architects, consultants). 2% for technical services, software, call centres. Threshold ₹30,000/year.",
    hasVariant: true,
    variantLabel: "Service Type",
    variants: [
      { label: "Professional Services (lawyers, CAs, doctors…)", rate: 0.10 },
      { label: "Technical Services / Software / Call Centre", rate: 0.02 },
    ],
  },
  // ── Dividends ───────────────────────────────────────────────────────────────
  {
    section: "194",
    nature: "Dividend from Domestic Company",
    category: "dividend",
    threshold: 5000,
    rate: 0.10,
    notes: "10% TDS on dividend above ₹5,000 per company per year. Submit Form 15G/15H if income is below taxable limit.",
  },
  {
    section: "194K",
    nature: "Dividend / Income from Mutual Fund Units",
    category: "dividend",
    threshold: 5000,
    rate: 0.10,
    notes: "10% TDS on dividend (IDCW) from MF units above ₹5,000 per fund house per year. Submit Form 15G/15H if eligible.",
  },
  // ── Property ─────────────────────────────────────────────────────────────────
  {
    section: "194IA",
    nature: "Purchase of Immovable Property (Buyer Deducts)",
    category: "property",
    threshold: 5000000,
    rate: 0.01,
    notes: "1% TDS deducted by buyer on purchase price of property ≥ ₹50 lakh. Filed via Form 26QB within 30 days. Applies on every installment, not just after aggregate crosses ₹50L.",
  },
  // ── Cash Withdrawals ─────────────────────────────────────────────────────────
  {
    section: "194N",
    nature: "Cash Withdrawal from Bank — ITR Filer",
    category: "cash",
    threshold: 10000000,
    rate: 0.02,
    notes: "2% on cash withdrawal above ₹1 crore in a year (for persons who have filed ITR in at least one of the last 3 years). Threshold is per bank, per FY.",
  },
  {
    section: "194N",
    nature: "Cash Withdrawal from Bank — ITR Non-Filer",
    category: "cash",
    threshold: 2000000,
    rate: 0.02,
    notes: "For non-filers: 2% on ₹20L–₹1Cr; 5% above ₹1Cr. If you haven't filed ITR for the last 3 years with TDS/TCS > ₹50,000 per year.",
    hasVariant: true,
    variantLabel: "Withdrawal Amount",
    variants: [
      { label: "₹20L – ₹1 Crore", rate: 0.02 },
      { label: "Above ₹1 Crore", rate: 0.05 },
    ],
  },
  // ── VDA / Crypto ─────────────────────────────────────────────────────────────
  {
    section: "194S",
    nature: "VDA / Crypto Transfer (Virtual Digital Assets)",
    category: "vda",
    threshold: 10000,
    rate: 0.01,
    notes: "1% TDS on transfer of VDA (Bitcoin, Ethereum, NFTs etc.) above ₹10,000 per transaction (₹50,000 for specified persons). Exchange deducts automatically — check Form 26AS / AIS.",
  },
  // ── Purchase of Goods ───────────────────────────────────────────────────────
  {
    section: "194Q",
    nature: "Purchase of Goods (Buyer Turnover > ₹10 Crore)",
    category: "goods",
    threshold: 5000000,
    rate: 0.001,
    notes: "0.1% TDS by buyer on purchase of goods exceeding ₹50 lakh in a year. Applies when buyer's turnover exceeds ₹10 crore. Does not apply if TCS already collected under 206C(1H).",
  },
  // ── E-Commerce ───────────────────────────────────────────────────────────────
  {
    section: "194O",
    nature: "E-Commerce — Payment to Participants",
    category: "ecommerce",
    threshold: 500000,
    rate: 0.001,
    notes: "0.1% TDS by e-commerce operator on gross sale value above ₹5,00,000/year to individual/HUF participants (reduced from 1% effective 1 Oct 2024).",
  },
  // ── Partner Remuneration (NEW) ───────────────────────────────────────────────
  {
    section: "194T",
    nature: "Salary / Commission / Remuneration to Partners of Firm",
    category: "partner",
    threshold: 20000,
    rate: 0.10,
    notes: "NEW section effective 1 Apr 2025 (Budget 2025). 10% TDS on salary, remuneration, commission, bonus, or interest paid by a firm to its partners above ₹20,000/year.",
  },
  // ── Lottery / Games ──────────────────────────────────────────────────────────
  {
    section: "194B",
    nature: "Lottery / Crossword / Game Show Winnings",
    category: "lottery",
    threshold: 10000,
    rate: 0.30,
    notes: "30% TDS on winnings above ₹10,000 per transaction. No deduction of expenses allowed. Applies to lottery tickets, game shows, online games (non-skill), etc.",
  },
  {
    section: "194BA",
    nature: "Winnings from Online Games",
    category: "lottery",
    threshold: 0,
    rate: 0.30,
    notes: "30% TDS on net winnings from online games (effective 1 Apr 2023). No threshold — applies on any net winning at year-end or on withdrawal. Platform deducts automatically.",
  },
];

const CATEGORIES = [
  "All", "salary", "interest", "contractor", "commission", "rent",
  "professional", "dividend", "property", "cash", "vda", "goods", "ecommerce", "partner", "lottery",
];
const CATEGORY_LABELS = {
  All: "All",
  salary: "Salary",
  interest: "Interest",
  contractor: "Contractor",
  commission: "Commission",
  rent: "Rent",
  professional: "Professional",
  dividend: "Dividend",
  property: "Property",
  cash: "Cash",
  vda: "VDA/Crypto",
  goods: "Goods",
  ecommerce: "E-Commerce",
  partner: "Partner",
  lottery: "Lottery",
};

const fmt = (n) => "₹" + Math.round(n).toLocaleString("en-IN");
const fmtPct = (r) => {
  const p = r * 100;
  return (p % 1 === 0 ? p.toFixed(0) : p.toFixed(1)) + "%";
};

function InfoTip({ text }) {
  const [show, setShow] = useState(false);
  return (
    <span className="relative inline-flex items-center">
      <button type="button" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}
        className="text-slate-400 hover:text-slate-600 transition-colors" aria-label="Info">
        <Info size={13} />
      </button>
      {show && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-30 w-64 bg-slate-800 text-white text-xs rounded-lg px-3 py-2 shadow-xl leading-relaxed whitespace-normal pointer-events-none">
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

// ── Component ─────────────────────────────────────────────────────────────────

export default function TDSCalculator() {
  const [selectedSection, setSelectedSection] = useState(TDS_SECTIONS[1]); // default: FD interest (non-senior)
  const [amount, setAmount] = useState(0);
  const [variantIdx, setVariantIdx] = useState(0);
  const [hasPAN, setHasPAN] = useState(true);
  const [filterCat, setFilterCat] = useState("All");

  const activeRate = useMemo(() => {
    if (selectedSection.isSlab) return null;
    if (!hasPAN) return Math.max(0.20, (selectedSection.hasVariant ? selectedSection.variants[variantIdx].rate : selectedSection.rate) * 2);
    if (selectedSection.hasVariant) return selectedSection.variants[variantIdx].rate;
    return selectedSection.rate;
  }, [selectedSection, hasPAN, variantIdx]);

  const result = useMemo(() => {
    if (!amount || selectedSection.isSlab) return null;
    const rate = activeRate;
    const tds = Math.round(amount * rate);
    const netAmount = amount - tds;
    return { tds, netAmount, rate };
  }, [amount, activeRate, selectedSection]);

  const filteredSections = useMemo(() =>
    filterCat === "All" ? TDS_SECTIONS : TDS_SECTIONS.filter((s) => s.category === filterCat),
    [filterCat]
  );

  return (
    <>
      <Helmet>
        <title>TDS Calculator FY 2025-26 | All Sections & Rates | LedgerLine</title>
        <meta name="description" content="Calculate TDS for FY 2025-26 across all sections — 194A, 194C, 194I, 194J, 194IB, 194T and more. Updated with Budget 2025 threshold and rate changes." />
        <meta name="keywords" content="TDS calculator, TDS rates FY 2025-26, tax deducted at source, TDS on salary, TDS on rent, TDS on interest, TDS on professional fees, ITR filing, income tax return filing online, TDS refund filing" />
        <meta property="og:title" content="TDS Calculator FY 2025-26 | LedgerLine" />
        <meta property="og:description" content="Calculate TDS across all sections with Budget 2025 updated rates and thresholds." />
        <meta property="og:url" content="https://powerfiling.com/calculators/tds" />
        <link rel="canonical" href="https://powerfiling.com/calculators/tds" />
      </Helmet>
      <Navbar />
      <main className="bg-white min-h-screen">
        {/* Header */}
        <div className="border-b border-slate-100 bg-white px-4 py-4">
          <div className="max-w-6xl mx-auto">
            <Link to="/calculators" className="inline-flex items-center gap-1.5 text-blue-500 hover:text-blue-700 text-sm mb-3 transition-colors">
              <ArrowLeft size={14} /> Back to Calculators
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">TDS Calculator</h1>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-xs text-slate-400">Tax Deducted at Source · FY 2025-26 (AY 2026-27)</span>
              <span className="text-[11px] font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Budget 2025 Updated</span>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
          <div className="flex flex-col lg:flex-row gap-6 items-start">

            {/* Left — selector + inputs */}
            <div className="w-full lg:flex-1 space-y-5">

              {/* Category filter */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <h2 className="text-sm font-bold text-slate-700 mb-3">Payment Category</h2>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button key={cat} onClick={() => setFilterCat(cat)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${filterCat === cat ? "bg-blue-600 text-white border-blue-600" : "border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600"}`}>
                      {CATEGORY_LABELS[cat]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Section picker */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <h2 className="text-sm font-bold text-slate-700 mb-3">Select Payment Type</h2>
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {filteredSections.map((s, i) => (
                    <button key={i} onClick={() => { setSelectedSection(s); setVariantIdx(0); }}
                      className={`w-full text-left rounded-xl px-4 py-3 border transition-all ${selectedSection === s ? "border-blue-500 bg-blue-50" : "border-slate-100 hover:border-blue-300 hover:bg-slate-50"}`}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-800">{s.nature}</span>
                        <span className="text-[11px] font-bold text-slate-400 shrink-0 ml-2">Sec {s.section}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {s.isSlab ? "Slab rate" : `${fmtPct(s.rate)} · Threshold: ${fmt(s.threshold)}${s.category === "rent" && s.section === "194IB" ? "/mo" : "/yr"}`}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Inputs */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-sm font-bold text-slate-700 mb-4">Calculate TDS</h2>

                {/* Variant selector */}
                {selectedSection.hasVariant && (
                  <div className="mb-5">
                    <label className="text-sm font-medium text-slate-600 mb-2 block">{selectedSection.variantLabel}</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedSection.variants.map((v, i) => (
                        <button key={i} onClick={() => setVariantIdx(i)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${variantIdx === i ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:border-blue-300"}`}>
                          {v.label} ({fmtPct(v.rate)})
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <RupeeInput label="Payment Amount" value={amount} onChange={setAmount}
                  info="Enter the gross payment amount before TDS deduction." />

                {/* PAN toggle */}
                {!selectedSection.isSlab && (
                  <div className="mb-4">
                    <label className="text-sm font-medium text-slate-600 mb-2 flex items-center gap-1.5">
                      PAN Available?
                      <InfoTip text="If payee's PAN is not provided, TDS is deducted at 20% or double the applicable rate, whichever is higher, as per Section 206AA." />
                    </label>
                    <div className="flex gap-3">
                      {[{ v: true, l: "Yes — PAN provided" }, { v: false, l: "No — PAN not provided" }].map(({ v, l }) => (
                        <button key={String(v)} onClick={() => setHasPAN(v)}
                          className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${hasPAN === v ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:border-blue-300"}`}>
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {selectedSection.isSlab && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-xs text-blue-800 leading-relaxed">
                    <strong>Salary TDS (Section 192)</strong> is computed based on your estimated annual income and applicable tax slab. Use the{" "}
                    <Link to="/calculators/income-tax" className="underline font-semibold">Income Tax Calculator</Link> to estimate your salary TDS.
                  </div>
                )}
              </div>

              {/* Budget 2025 changes callout */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                <p className="text-xs font-bold text-amber-800 mb-2">Budget 2025 Changes (Effective 1 Apr 2025)</p>
                <ul className="text-xs text-amber-700 space-y-1.5 list-disc list-inside leading-relaxed">
                  <li><strong>194A Interest (Bank/Post Office):</strong> Threshold raised ₹40,000 → <strong>₹50,000</strong>; Senior Citizens ₹50,000 → <strong>₹1,00,000</strong></li>
                  <li><strong>194A Interest (Others):</strong> Threshold raised ₹5,000 → <strong>₹10,000</strong></li>
                  <li><strong>194-I Rent (Business):</strong> Annual threshold raised ₹2,40,000 → <strong>₹6,00,000</strong> (₹50,000/month)</li>
                  <li><strong>194-IB Rent (Individual/HUF):</strong> Rate reduced 5% → <strong>2%</strong></li>
                  <li><strong>194T (NEW):</strong> 10% TDS on salary/commission to firm partners above ₹20,000/year</li>
                  <li><strong>194O E-Commerce:</strong> Rate reduced 1% → <strong>0.1%</strong></li>
                </ul>
              </div>
            </div>

            {/* Right — result */}
            <div className="w-full lg:w-72 xl:w-80 shrink-0 sticky top-20 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 pt-5 pb-4 bg-gradient-to-r from-blue-600 to-indigo-600 border-b border-slate-100">
                  <h2 className="text-base font-bold text-white text-center">TDS Summary</h2>
                  <p className="text-blue-200 text-xs text-center mt-0.5">Section {selectedSection.section}</p>
                </div>
                <div className="px-5 py-5">
                  {selectedSection.isSlab ? (
                    <div className="text-center py-4">
                      <p className="text-slate-500 text-sm">Salary TDS is slab-based.</p>
                      <Link to="/calculators/income-tax" className="inline-block mt-3 text-sm font-semibold text-blue-600 underline">
                        Use Income Tax Calculator →
                      </Link>
                    </div>
                  ) : result ? (
                    <div className="space-y-2.5">
                      {[
                        { label: "Gross Payment", value: fmt(amount) },
                        { label: "TDS Rate", value: fmtPct(result.rate) + (!hasPAN ? " (No PAN — Sec 206AA)" : "") },
                        { label: "TDS Amount", value: fmt(result.tds), red: true },
                        { label: "Net Amount Payable", value: fmt(result.netAmount), green: true },
                      ].map(({ label, value, red, green }) => (
                        <div key={label} className={`flex justify-between items-center py-2.5 border-b border-slate-50 last:border-0 ${red ? "bg-red-50 px-3 rounded-lg" : green ? "bg-green-50 px-3 rounded-lg" : ""}`}>
                          <span className="text-sm text-slate-600">{label}</span>
                          <span className={`font-bold text-sm ${red ? "text-red-600" : green ? "text-green-700" : "text-slate-800"}`}>{value}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-slate-400 text-sm">Enter a payment amount to calculate TDS.</p>
                    </div>
                  )}
                </div>
                {!selectedSection.isSlab && (
                  <div className="px-5 pb-5 border-t border-slate-100 pt-4">
                    <p className="text-[11px] text-slate-400 leading-relaxed mb-4">{selectedSection.notes}</p>
                    <Link to="/services/salary-basic-itr"
                      className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold text-center py-3 rounded-xl transition-colors">
                      File ITR &amp; Claim TDS Refund
                    </Link>
                  </div>
                )}
              </div>

              {/* No PAN warning */}
              {!hasPAN && !selectedSection.isSlab && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                  <p className="text-xs text-red-800 font-semibold mb-1">Section 206AA — No PAN</p>
                  <p className="text-xs text-red-700 leading-relaxed">
                    Without PAN, TDS is deducted at <strong>20%</strong> or double the normal rate, whichever is higher.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Full rate reference table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-sm font-bold text-slate-800">TDS Rate Reference Table — FY 2025-26 (AY 2026-27)</h3>
              <span className="text-[11px] font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Finance Act 2025</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    {["Section", "Nature of Payment", "Threshold", "TDS Rate", "Budget 2025"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { sec: "192",   nature: "Salary",                                          threshold: "As per slab",     rate: "Slab rate",   changed: false },
                    { sec: "193",   nature: "Interest on Securities (Debentures/Bonds)",       threshold: "₹10,000",         rate: "10%",         changed: false },
                    { sec: "194",   nature: "Dividend from Domestic Company",                  threshold: "₹5,000",          rate: "10%",         changed: false },
                    { sec: "194A",  nature: "Interest — Bank/Post Office (Non-Senior)",        threshold: "₹50,000 ★",       rate: "10%",         changed: true },
                    { sec: "194A",  nature: "Interest — Bank/Post Office (Senior Citizen)",    threshold: "₹1,00,000 ★",     rate: "10%",         changed: true },
                    { sec: "194A",  nature: "Interest — Others (Company deposits etc.)",       threshold: "₹10,000 ★",       rate: "10%",         changed: true },
                    { sec: "194B",  nature: "Lottery / Crossword / Game Show Winnings",        threshold: "₹10,000/txn",     rate: "30%",         changed: false },
                    { sec: "194BA", nature: "Online Game Winnings",                            threshold: "Nil",             rate: "30%",         changed: false },
                    { sec: "194C",  nature: "Contractor — Individual/HUF",                    threshold: "₹30,000 / ₹1L",  rate: "1%",          changed: false },
                    { sec: "194C",  nature: "Contractor — Company/Firm",                      threshold: "₹30,000 / ₹1L",  rate: "2%",          changed: false },
                    { sec: "194H",  nature: "Commission / Brokerage",                         threshold: "₹15,000",         rate: "5%",          changed: false },
                    { sec: "194I(a)",nature: "Rent — Plant & Machinery",                      threshold: "₹6,00,000/yr ★",  rate: "2%",          changed: true },
                    { sec: "194I(b)",nature: "Rent — Land / Building / Furniture",            threshold: "₹6,00,000/yr ★",  rate: "10%",         changed: true },
                    { sec: "194IA", nature: "Purchase of Immovable Property",                 threshold: "₹50,00,000",      rate: "1%",          changed: false },
                    { sec: "194IB", nature: "Rent by Individual/HUF (> ₹50K/month)",          threshold: "₹50,000/mo",      rate: "2% ★",        changed: true },
                    { sec: "194J(a)",nature: "Technical Services / Software / Call Centre",   threshold: "₹30,000",         rate: "2%",          changed: false },
                    { sec: "194J(b)",nature: "Professional Fees (CA, Doctor, Lawyer…)",       threshold: "₹30,000",         rate: "10%",         changed: false },
                    { sec: "194K",  nature: "MF Dividend (IDCW)",                             threshold: "₹5,000",          rate: "10%",         changed: false },
                    { sec: "194N",  nature: "Cash Withdrawal — ITR Filer",                    threshold: "₹1 Crore",        rate: "2%",          changed: false },
                    { sec: "194N",  nature: "Cash Withdrawal — Non-Filer (₹20L–₹1Cr)",       threshold: "₹20 Lakh",        rate: "2%",          changed: false },
                    { sec: "194N",  nature: "Cash Withdrawal — Non-Filer (above ₹1Cr)",      threshold: "₹1 Crore",        rate: "5%",          changed: false },
                    { sec: "194O",  nature: "E-Commerce Participant Payment",                  threshold: "₹5,00,000",       rate: "0.1% ★",      changed: true },
                    { sec: "194Q",  nature: "Purchase of Goods (Buyer turnover > ₹10Cr)",     threshold: "₹50 Lakh",        rate: "0.1%",        changed: false },
                    { sec: "194S",  nature: "VDA / Crypto Transfer",                          threshold: "₹10,000/txn",     rate: "1%",          changed: false },
                    { sec: "194T",  nature: "Partner Salary / Commission / Remuneration",     threshold: "₹20,000 ★ NEW",   rate: "10%",         changed: true },
                  ].map((r, i) => (
                    <tr key={i} className={`border-b border-slate-50 hover:bg-blue-50/40 transition-colors ${i % 2 === 1 ? "bg-slate-50/60" : ""}`}>
                      <td className="px-4 py-3 font-semibold text-blue-700 whitespace-nowrap">{r.sec}</td>
                      <td className="px-4 py-3 text-slate-700">{r.nature}</td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{r.threshold}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">{r.rate}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {r.changed
                          ? <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Changed</span>
                          : <span className="text-[10px] text-slate-300">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="px-5 py-3 text-[11px] text-slate-400 leading-relaxed">
              ★ Changed by Budget 2025 / Finance Act 2025 (effective 1 Apr 2025). Without valid PAN, TDS is deducted at 20% or double the normal rate, whichever is higher (Section 206AA). For non-residents, surcharge and 4% health &amp; education cess apply additionally. Section 206AB applies higher rates for persons who have not filed ITR in preceding 2 years with TDS/TCS &gt; ₹50,000 per year.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
