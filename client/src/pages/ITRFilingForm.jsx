import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getData } from "country-list";
import {
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  User,
  MapPin,
  CreditCard,
  Briefcase,
  Home,
  TrendingUp,
  PiggyBank,
  Calculator,
  ArrowRight,
  ArrowLeft,
  Info,
  Check,
  X,
  UserCircle2,
  RefreshCw,
  Building2,
  Plus,
  Pencil,
  Trash2,
  Upload,
} from "lucide-react";
import Navbar from "./frontend/Navbar";
import Footer from "./frontend/Footer";
import { useAuth } from "../context/AuthContext";

/* ─── Geo data (module-level, computed once) ─── */
const COUNTRIES = getData(); // [{ code, name }]
const STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka",
  "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram",
  "Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "Andaman and Nicobar Islands","Chandigarh","Dadra and Nagar Haveli and Daman and Diu",
  "Delhi","Jammu and Kashmir","Ladakh","Lakshadweep","Puducherry",
];
const STATE_OPTIONS = STATES.map((s) => ({ value: s.toUpperCase(), label: s }));
const COUNTRY_OPTIONS = COUNTRIES.map((c) => ({ value: c.name, label: c.name.toUpperCase() }));

/* ─── Validation regexes (module-level) ─── */
const PINCODE_RE  = /^\d{6}$/;
const AADHAAR_RE  = /^\d{12}$/;
const PAN_RE      = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const MOBILE_RE   = /^\d{10}$/;
const EMAIL_RE    = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ─── Pure helpers (module-level, no closure) ─── */
const toNum  = (v) => Math.max(0, parseFloat(v) || 0);
const fmt    = (n) => `₹${Math.abs(n).toLocaleString("en-IN")}`;
const fullName = (p) => [p.firstName, p.middleName, p.lastName].filter(Boolean).join(" ");
const isSeniorForTaxYear = (dob) => {
  if (!dob) return false;
  const birthDate = new Date(`${dob}T00:00:00`);
  if (Number.isNaN(birthDate.getTime())) return false;
  const yearEnd = new Date(2027, 2, 31);
  const birthdayThisYear = new Date(2027, birthDate.getMonth(), birthDate.getDate());
  const ageOnYearEnd = yearEnd.getFullYear() - birthDate.getFullYear() - (yearEnd < birthdayThisYear ? 1 : 0);
  return ageOnYearEnd >= 60;
};

/* ─── Tax rules for Tax Year 2026-27 (module-level) ─── */
const STD_DEDUCTION_NEW = 75_000;
const STD_DEDUCTION_OLD = 50_000;

const calcTax = (taxableIncome, regime, rebateEligible, totalIncome = taxableIncome) => {
  let tax = 0;
  if (regime === "old") {
    if (taxableIncome <= 250_000)       tax = 0;
    else if (taxableIncome <= 500_000)  tax = (taxableIncome - 250_000) * 0.05;
    else if (taxableIncome <= 1_000_000) tax = 12_500 + (taxableIncome - 500_000) * 0.2;
    else                                tax = 112_500 + (taxableIncome - 1_000_000) * 0.3;
    // Section 156(1): resident individuals get a rebate capped at ₹12,500 up to ₹5L.
    if (rebateEligible && totalIncome <= 500_000) tax = Math.max(0, tax - Math.min(tax, 12_500));
  } else {
    if (taxableIncome <= 400_000)       tax = 0;
    else if (taxableIncome <= 800_000)  tax = (taxableIncome - 400_000) * 0.05;
    else if (taxableIncome <= 1_200_000) tax = 20_000 + (taxableIncome - 800_000) * 0.1;
    else if (taxableIncome <= 1_600_000) tax = 60_000 + (taxableIncome - 1_200_000) * 0.15;
    else if (taxableIncome <= 2_000_000) tax = 120_000 + (taxableIncome - 1_600_000) * 0.2;
    else if (taxableIncome <= 2_400_000) tax = 200_000 + (taxableIncome - 2_000_000) * 0.25;
    else                                tax = 300_000 + (taxableIncome - 2_400_000) * 0.3;
    // Section 156(2): resident individuals can claim a rebate up to ₹60,000 through ₹12L;
    // marginal relief limits tax just above ₹12L to the amount over that threshold.
    if (rebateEligible && totalIncome <= 1_200_000) tax = Math.max(0, tax - Math.min(tax, 60_000));
    else if (rebateEligible && totalIncome > 1_200_000) tax = Math.min(tax, totalIncome - 1_200_000);
  }
  return Math.round(tax * 1.04); // +4% health & education cess
};

/* ─── Salary entry factory (module-level) ─── */
let nextSalaryEntryId = 0;
const newSalaryEntry = () => ({
  id: ++nextSalaryEntryId,
  employerName: "", employerTAN: "",
  grossSalary17: "",        // single-amount 17(1) input
  basicPay: "", hra17: "", lta17: "", others17: "", // 17(1) breakup
  perquisites: "",          // 17(2)
  profitsInLieu: "",        // 17(3)
  hraExemption: "", ltaExemption: "", rentPaid: "", metroCity: false,
});

/* ─── Salary total (module-level, pure) ─── */
const getSalaryTotal = (entry, applyExemptions = true) => {
  const breakupFilled = entry.basicPay || entry.hra17 || entry.lta17 || entry.others17;
  const s171 = breakupFilled
    ? toNum(entry.basicPay) + toNum(entry.hra17) + toNum(entry.lta17) + toNum(entry.others17)
    : toNum(entry.grossSalary17);
  const s172 = toNum(entry.perquisites);
  const s173 = toNum(entry.profitsInLieu);
  const exemptions = applyExemptions ? toNum(entry.hraExemption) + toNum(entry.ltaExemption) : 0;
  return s171 + s172 + s173 - exemptions;
};

/* ─── Step definitions ─── */
const STEPS = [
  { id: 0, label: "Personal Info" },
  { id: 1, label: "Income Sources" },
  { id: 2, label: "Deductions & Relief" },
  { id: 3, label: "Tax Summary" },
];

/* ─── Field helper components ─── */
const FloatingInput = ({ label, name, value, onChange, type = "text", placeholder, hint, error, required, readOnly }) => (
  <div className="flex flex-col gap-1">
    <div className="relative">
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        placeholder=" "
        className={`peer w-full border rounded-lg px-4 pt-5 pb-2 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 transition-all
          ${error ? "border-red-400 focus:ring-red-200" : "border-slate-300 focus:ring-blue-200 focus:border-blue-500"}
          ${readOnly ? "bg-slate-50 cursor-not-allowed" : ""}
        `}
      />
      <label className="absolute left-4 top-3.5 text-xs text-slate-400 transition-all pointer-events-none
        peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-xs
        peer-focus:top-1 peer-focus:text-[10px] peer-focus:text-blue-500
        peer-[&:not(:placeholder-shown)]:top-1 peer-[&:not(:placeholder-shown)]:text-[10px]">
        {label}{required && " *"}
      </label>
    </div>
    {hint && !error && <p className="text-[11px] text-slate-400 flex items-center gap-1"><Info size={10} />{hint}</p>}
    {error && <p className="text-[11px] text-red-500 flex items-center gap-1"><AlertCircle size={10} />{error}</p>}
  </div>
);

const FloatingSelect = ({ label, name, value, onChange, options, error, required }) => (
  <div className="flex flex-col gap-1">
    <div className="relative">
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`peer w-full border rounded-lg px-4 pt-5 pb-2 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 transition-all appearance-none
          ${error ? "border-red-400 focus:ring-red-200" : "border-slate-300 focus:ring-blue-200 focus:border-blue-500"}
        `}
      >
        <option value="" disabled> </option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <label className={`absolute left-4 pointer-events-none transition-all
        ${value ? "top-1 text-[10px] text-blue-500" : "top-3.5 text-xs text-slate-400"}
      `}>
        {label}{required && " *"}
      </label>
      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
    </div>
    {error && <p className="text-[11px] text-red-500 flex items-center gap-1"><AlertCircle size={10} />{error}</p>}
  </div>
);

/* ─── Inline ₹ currency input ─── */
const CurrencyInput = ({ value, onChange, placeholder = "0", width = "w-44", className = "" }) => (
  <div className={`flex items-center gap-1 border border-slate-300 rounded-lg px-3 py-2 bg-white flex-shrink-0 ${width} ${className}`}>
    <span className="text-slate-400 text-sm flex-shrink-0">₹</span>
    <input
      type="number"
      value={value ?? ""}
      onChange={onChange}
      placeholder={placeholder}
      className="flex-1 text-sm font-semibold text-slate-800 outline-none bg-transparent text-right min-w-0"
    />
  </div>
);

/* ─── Collapsible card section ─── */
const FormSection = ({ icon, title, subtitle, badge, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-slate-200 rounded-2xl mb-5 overflow-hidden shadow-sm">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 bg-white hover:bg-slate-50/60 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
            {icon}
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm">{title}</span>
              {badge && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                  <Check size={9} /> {badge}
                </span>
              )}
            </div>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {open ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
      </button>
      {open && <div className="px-6 pb-6 pt-1 bg-white border-t border-slate-100">{children}</div>}
    </div>
  );
};

/* ─── Residential Status Modal ─── */

const ResidentialStatusModal = ({ onClose, onConfirm, initialData }) => {
  const [phase, setPhase] = useState(initialData?.status ? "result" : "form");
  const [result, setResult] = useState(initialData?.status || null);
  const [daysCurrentFY, setDaysCurrentFY] = useState(initialData?.daysCurrentFY || "");
  const [daysPrev4FY, setDaysPrev4FY] = useState(initialData?.daysPrev4FY || "");
  const [jurisdictions, setJurisdictions] = useState(
    initialData?.jurisdictions?.length ? initialData.jurisdictions : [{ country: "", tin: "" }]
  );

  // RNOR: Indian Resident but was NRI for ≥ 9 of last 10 years, OR < 730 days in last 7 years
  const computeStatus = () => {
    const curr = parseInt(daysCurrentFY) || 0;
    const prev = parseInt(daysPrev4FY) || 0;
    if (curr < 182) return "Non Resident Indian";
    // Simplified RNOR heuristic: if prev 4-year days < 365 (less than ~1 yr in 4 yrs)
    if (prev < 365) return "Resident but Not Ordinarily Resident (RNOR)";
    return "Indian Resident";
  };

  const handleCalculate = () => {
    if (!daysCurrentFY) return;
    setResult(computeStatus());
    setPhase("result");
  };

  const addJurisdiction = () =>
    setJurisdictions((j) => [...j, { country: "", tin: "" }]);

  const removeJurisdiction = (i) =>
    setJurisdictions((j) => j.filter((_, idx) => idx !== i));

  const updateJurisdiction = (i, field, val) =>
    setJurisdictions((j) => j.map((item, idx) => idx === i ? { ...item, [field]: val } : item));

  const handleStartOver = () => {
    setDaysCurrentFY("");
    setDaysPrev4FY("");
    setJurisdictions([{ country: "", tin: "" }]);
    setResult(null);
    setPhase("form");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-slate-100">
          <div>
            <h2 className="font-extrabold text-slate-900 text-base">Residential Status</h2>
            <p className="text-xs text-slate-500 mt-0.5">Residential Status is crucial to calculate the correct taxation.</p>
            <p className="text-xs text-slate-500">Just answer a few questions and <strong className="text-slate-700">we will auto-select</strong> the correct Residential Status for you!</p>
          </div>
          <button type="button" onClick={onClose} className="ml-4 mt-0.5 text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {phase === "form" && (
            <div className="px-5 py-5 space-y-6">
              {/* Duration of stay */}
              <div>
                <p className="text-sm font-bold text-slate-800 mb-3">Enter your duration of stay in India</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Days stayed between 1 Apr 2026 to 31 Mar 2027 (in days)</label>
                    <input
                      type="number" min="0" max="366"
                      value={daysCurrentFY}
                      onChange={(e) => setDaysCurrentFY(e.target.value)}
                      placeholder=""
                      className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Days stayed between 1 Apr 2022 to 31 Mar 2026 (in days)</label>
                    <input
                      type="number" min="0" max="1461"
                      value={daysPrev4FY}
                      onChange={(e) => setDaysPrev4FY(e.target.value)}
                      placeholder=""
                      className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Jurisdiction details */}
              <div>
                <p className="text-sm font-bold text-slate-800 mb-3">Enter your jurisdiction details</p>
                {jurisdictions.map((j, i) => (
                  <div key={i} className="grid grid-cols-2 gap-3 mb-3 items-start">
                    <div>
                      <label className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                        Jurisdiction of Resident <Info size={11} className="text-slate-400" />
                      </label>
                      <div className="relative">
                        <select
                          value={j.country}
                          onChange={(e) => updateJurisdiction(i, "country", e.target.value)}
                          className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 appearance-none"
                        >
                          <option value="">Select Country</option>
                          {COUNTRY_OPTIONS.map((country) => (
                            <option key={country.value} value={country.value}>{country.label}</option>
                          ))}
                        </select>
                        <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                        Tax Identification number <Info size={11} className="text-slate-400" />
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={j.tin}
                          onChange={(e) => updateJurisdiction(i, "tin", e.target.value)}
                          placeholder="Enter TIN number"
                          className="flex-1 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                        />
                        {jurisdictions.length > 1 && (
                          <button type="button" onClick={() => removeJurisdiction(i)}
                            className="flex-shrink-0 p-2.5 border border-red-200 rounded-lg text-red-500 hover:bg-red-50 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <button type="button" onClick={addJurisdiction}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 mt-1">
                  + Add another jurisdiction
                </button>
              </div>
            </div>
          )}

          {phase === "result" && result && (
            <div className="px-5 py-6 flex flex-col items-center text-center">
              <div className="w-28 h-28 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                <UserCircle2 size={64} className="text-blue-400" strokeWidth={1.2} />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 mb-2">{result}</h3>
              <p className="text-sm text-slate-500">
                {result === "Indian Resident"
                  ? "You were an Indian Resident during Tax Year 2026-27 (April 2026 to March 2027)"
                  : result === "Non Resident Indian"
                  ? "You were a non-resident in Tax Year 2026-27 (Apr 2026 to Mar 2027)"
                  : "You were a Resident but Not Ordinarily Resident in Tax Year 2026-27"}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleStartOver}
            className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            <RefreshCw size={13} />
            Start Over
          </button>
          {phase === "result" && (
            <button
              type="button"
              onClick={() => onConfirm(result)}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-md"
            >
              Continue
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── Step progress bar ─── */
const StepBar = ({ current }) => (
  <div className="flex items-center gap-0 mb-8">
    {STEPS.map((step, i) => {
      const done = current > i;
      const active = current === i;
      return (
        <div key={step.id} className="flex items-center flex-1 last:flex-none">
          <div className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap
            ${active ? "bg-slate-900 text-white shadow-md" : done ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-white text-slate-400 border border-slate-200"}
          `}>
            {done ? <CheckCircle2 size={15} className="text-emerald-500 flex-shrink-0" /> : <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${active ? "bg-white text-slate-900" : "bg-slate-100 text-slate-400"}`}>{i + 1}</span>}
            <span className="hidden sm:inline">{step.label}</span>
            {!done && !active && <Info size={13} className="text-slate-400 flex-shrink-0" />}
          </div>
          {i < STEPS.length - 1 && (
            <div className={`flex-1 h-px mx-1 ${done ? "bg-emerald-300" : "bg-slate-200"}`} />
          )}
        </div>
      );
    })}
  </div>
);

/* ─── Tax Summary row ─── */
const SummaryRow = ({ label, value, highlight, bold }) => (
  <div className={`flex items-center justify-between py-3 border-b border-slate-100 last:border-0 ${highlight ? "bg-blue-50 -mx-5 px-5 rounded-xl" : ""}`}>
    <span className={`text-sm ${bold ? "font-bold text-slate-900" : "text-slate-600"}`}>{label}</span>
    <span className={`text-sm font-bold ${highlight ? "text-blue-700 text-base" : "text-slate-900"}`}>{value}</span>
  </div>
);

/* ─── Exempt Allowances section (HRA + LTA) ─── */
const ExemptAllowances = ({ entry, updateSalaryEntry, onOpenHRA }) => {
  const [open, setOpen] = useState(true);
  const hraExempt = toNum(entry.hraExemption);
  const ltaExempt = toNum(entry.ltaExemption);
  const total = hraExempt + ltaExempt;

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      {/* Section header */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
            <span className="text-blue-600 font-black text-xs">2</span>
          </div>
          <div className="text-left">
            <span className="text-sm font-bold text-slate-800">2. Exempt allowances like HRA, LTA etc.</span>
            <span className="text-xs text-blue-500 ml-2 cursor-pointer hover:underline">Read More</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-slate-800">
            ₹ {total.toLocaleString("en-IN")}
          </span>
          {open ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-slate-100 px-4 py-4 bg-white space-y-4">
          {/* HRA Exemption row */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-700">HRA Exemption</p>
                <p className="text-xs text-slate-400">
                  You can edit your HRA exemption here. We will auto-calculate your details.{" "}
                  <span className="text-blue-500 cursor-pointer hover:underline">View Details</span>
                </p>
              </div>
              <CurrencyInput value={entry.hraExemption} onChange={(e) => updateSalaryEntry(entry.id, "hraExemption", e.target.value)} width="w-44 ml-4" />
            </div>
            <button
              type="button"
              onClick={onOpenHRA}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <Plus size={11} className="border border-blue-600 rounded-full" />
              Add HRA Exemption
            </button>
          </div>

          <div className="border-t border-slate-100" />

          {/* LTA Exemption row */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-700">LTA Exemption</p>
              <p className="text-xs text-slate-400">Leave Travel Allowance exemption u/s 10(5)</p>
            </div>
            <CurrencyInput value={entry.ltaExemption} onChange={(e) => updateSalaryEntry(entry.id, "ltaExemption", e.target.value)} width="w-44 ml-4" />
          </div>

          {/* Add more items */}
          <button
            type="button"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 pt-1"
          >
            <Plus size={11} className="border border-blue-600 rounded-full" />
            Add more items
          </button>
        </div>
      )}
    </div>
  );
};

/* ─── HRA Exemption Modal ─── */
const HRAExemptionModal = ({ entry, onClose, onSave }) => {
  const [metroCity, setMetroCity] = useState(entry.metroCity || false);
  const [rentPaid, setRentPaid] = useState(entry.rentPaid || "");
  const [hraExemption, setHraExemption] = useState(entry.hraExemption || "");

  // Auto-calculate HRA exemption (simplified rule)
  // Exempt = min of: actual HRA received, rent paid - 10% basic, 50%(metro)/40%(non-metro) of basic
  const basicPay = parseFloat(entry.basicPay) || 0;
  const hraReceived = parseFloat(entry.hra17) || 0;
  const rent = parseFloat(rentPaid) || 0;
  const autoCalc = Math.max(0, Math.min(
    hraReceived,
    rent - 0.1 * basicPay,
    (metroCity ? 0.5 : 0.4) * basicPay
  ));

  const handleSave = () => {
    onSave({ rentPaid: rent.toString(), hraExemption: hraExemption || autoCalc.toString(), metroCity });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-100">
          <h2 className="font-extrabold text-slate-900 text-base">Add HRA exemption</h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          {/* Total HRA bar */}
          <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
            <span className="text-sm font-semibold text-slate-700">
              Total HRA Exemption:{" "}
              <span className="text-slate-900 font-bold">
                ₹ {(parseFloat(hraExemption) || autoCalc).toLocaleString("en-IN")}
              </span>
            </span>
            <button type="button" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View More Details <ArrowRight size={11} />
            </button>
          </div>

          {/* Metro toggle */}
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-800">
              Did you live in Delhi, Mumbai, Kolkata, or Chennai?
            </p>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-semibold ${!metroCity ? "text-slate-800" : "text-slate-400"}`}>No</span>
              <button
                type="button"
                onClick={() => setMetroCity((v) => !v)}
                className={`relative w-11 h-6 rounded-full transition-colors ${metroCity ? "bg-blue-600" : "bg-slate-300"}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${metroCity ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
              <span className={`text-xs font-semibold ${metroCity ? "text-slate-800" : "text-slate-400"}`}>Yes</span>
            </div>
          </div>

          {/* Employer card */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            {/* Employer header */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-50">
              <div>
                <p className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                  {entry.employerName || "Employer"}
                </p>
                <p className="text-xs text-slate-500">During this employment period</p>
              </div>
              <button type="button" className="text-xs font-semibold text-blue-600 hover:text-blue-700 border border-blue-200 rounded-lg px-3 py-1.5">
                Remove
              </button>
            </div>

            {/* Rent Paid */}
            <div className="px-4 py-4 border-t border-slate-100 space-y-1">
              <p className="text-sm font-semibold text-slate-700">Total Rent Paid</p>
              <p className="text-xs text-slate-400">During this employment period</p>
              <CurrencyInput value={rentPaid} onChange={(e) => setRentPaid(e.target.value)} width="w-full" className="mt-2" />
            </div>

            {/* HRA Exemption Amount */}
            <div className="px-4 py-4 border-t border-slate-100 space-y-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-slate-700">HRA Exemption Amount</p>
                <Info size={13} className="text-slate-400" />
              </div>
              <p className="text-xs text-slate-400">
                We auto-calculate your HRA exemption based on your rent and salary details.
              </p>
              <div className="flex items-center gap-3 mt-2">
              <CurrencyInput value={hraExemption || (autoCalc > 0 ? autoCalc : "")} onChange={(e) => setHraExemption(e.target.value)} placeholder={autoCalc > 0 ? String(autoCalc) : "0"} width="flex-1" />
              </div>
            </div>
          </div>

          {/* Footer links */}
          <div className="flex items-center gap-4 text-sm font-semibold text-blue-600">
            <button type="button" className="hover:text-blue-700">Add HRA Exemption</button>
            <span className="text-slate-300">|</span>
            <button type="button" className="hover:text-blue-700 flex items-center gap-1">
              View More Details <ArrowRight size={12} />
            </button>
          </div>
        </div>

        {/* Action buttons */}
        <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button type="button" onClick={onClose}
            className="px-5 py-2.5 border border-slate-300 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button type="button" onClick={handleSave}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-md">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Other Salary Components (collapsible) ─── */
const OtherSalaryComponents = ({ entry, updateSalaryEntry }) => {
  const [open, setOpen] = useState(true); // open by default to match screenshot

  const rows = [
    {
      label: "17(2) : Employer perks (car, ESOPs, etc.)",
      field: "perquisites",
      defaultVal: "0",
      hasChevron: true,
    },
    {
      label: "17(3) : Extra Salary Income (Settlement, Bonus, etc.)",
      field: "profitsInLieu",
      defaultVal: "0",
      hasChevron: true,
    },
  ];

  const total = rows.reduce((sum, r) => sum + toNum(entry[r.field]), 0);

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3.5 bg-white hover:bg-slate-50 transition-colors"
      >
        <div className="text-left">
          <p className="text-sm font-bold text-slate-800">Other Salary Components</p>
          <p className="text-xs text-slate-500 mt-0.5">
            Perks &amp; extra salary (ESOPs, settlement, etc.) – enter only if applicable
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-slate-700">
            ₹ {total.toLocaleString("en-IN")}
          </span>
          {open
            ? <ChevronUp size={16} className="text-slate-400" />
            : <ChevronDown size={16} className="text-slate-400" />}
        </div>
      </button>

      {/* Rows */}
      {open && (
        <div className="border-t border-slate-100 divide-y divide-slate-100 bg-white">
          {rows.map(({ label, field, defaultVal, hasChevron }) => (
            <div key={field} className="flex items-center justify-between px-4 py-3.5 gap-4">
              {/* Label + Read More */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-700">{label}</p>
                <span className="text-xs text-blue-500 cursor-pointer hover:underline">Read More</span>
              </div>
              {/* ₹ input */}
              <CurrencyInput value={entry[field] ?? ""} onChange={(e) => updateSalaryEntry(entry.id, field, e.target.value)} placeholder={defaultVal || ""} width="w-48" />
              {/* chevron icon for expandable rows */}
              {hasChevron
                ? <ChevronDown size={16} className="text-slate-400 flex-shrink-0" />
                : <div className="w-4 flex-shrink-0" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════ */
const ITRFilingForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [showResidentialModal, setShowResidentialModal] = useState(false);

  /* ── Personal Info state ── */
  const [personal, setPersonal] = useState({
    firstName: user?.name?.split(" ")[0] || "",
    middleName: "",
    lastName: user?.name?.split(" ").slice(1).join(" ") || "",
    dob: "",
    fatherName: "",
    gender: "",
    maritalStatus: "",
    // Address
    flatDoorNo: "",
    premiseName: "",
    roadStreet: "",
    areaLocality: "",
    pincode: "",
    country: "INDIA",
    state: "",
    city: "",
    // Residential Status
    residentialStatus: "",
    // Identification
    aadhaar: "",
    pan: "",
    mobileCountry: "+91",
    mobile: "",
    email: user?.email || "",
  });

  /* ── Bank Accounts state ── */
  const [bankAccounts, setBankAccounts] = useState([
    { accountNumber: "", ifsc: "", bankName: "", accountType: "" },
  ]);

  const addBankAccount = () =>
    setBankAccounts((b) => [...b, { accountNumber: "", ifsc: "", bankName: "", accountType: "" }]);

  const removeBankAccount = (i) =>
    setBankAccounts((b) => b.filter((_, idx) => idx !== i));

  const updateBankAccount = (i, field, val) =>
    setBankAccounts((b) => b.map((item, idx) => idx === i ? { ...item, [field]: val } : item));

  /* ── Salary Entries state ── */
  const [salaryEntries, setSalaryEntries] = useState([newSalaryEntry()]);
  const [editingSalaryId, setEditingSalaryId] = useState(null); // id of entry being edited

  const addSalaryEntry = () => {
    const entry = newSalaryEntry();
    setSalaryEntries((s) => [...s, entry]);
    setEditingSalaryId(entry.id);
  };

  const removeSalaryEntry = (id) => {
    setSalaryEntries((s) => s.filter((e) => e.id !== id));
    setEditingSalaryId((cur) => cur === id ? null : cur);
  };

  const updateSalaryEntry = (id, field, val) =>
    setSalaryEntries((s) => s.map((e) => e.id === id ? { ...e, [field]: val } : e));

  const [hraModalEntryId, setHraModalEntryId] = useState(null);

  /* ── Income Sources state ── */
  const [income, setIncome] = useState({
    hasSalary: false,
    grossSalary: "",
    hra: "",
    lta: "",
    otherAllowances: "",
    hasHouseProperty: false,
    rentReceived: "",
    municipalTax: "",
    homeLoanInterest: "",
    hasCapitalGains: false,
    stcgEquity: "",
    ltcgEquity: "",
    stcgOther: "",
    ltcgOther: "",
    hasOtherIncome: false,
    interestSavings: "",
    interestFD: "",
    dividends: "",
    otherIncome: "",
  });

  /* ── Tax Saving state ── */
  const [taxSaving, setTaxSaving] = useState({
    regime: "new",
    professionalTax: "",
    arrearsRelief: "",
    foreignRetirementRelief: "",
    sec80C: "",
    sec80D_self: "",
    sec80D_parents: "",
    sec80D_selfSenior: false,
    sec80D_parentsSenior: false,
    sec80E: "",
    sec80G: "",
    sec80TTA: "",
    sec80TTB: "",
    nps80CCD: "",
    employerNps: "",
    homeLoan80EEA: "",
  });

  const handlePersonal = (e) => {
    const { name, value } = e.target;
    setPersonal((p) => ({ ...p, [name]: value }));
    setErrors((e) => ({ ...e, [name]: "" }));
  };

  const handleIncome = (e) => {
    const { name, value, type, checked } = e.target;
    setIncome((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const handleTaxSaving = (e) => {
    const { name, value, type, checked } = e.target;
    setTaxSaving((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  /* ── Validations ── */
  const validatePersonal = () => {
    const e = {};
    if (!personal.firstName.trim()) e.firstName = "First name is required";
    if (!personal.dob) e.dob = "Date of birth is required";
    if (!personal.fatherName.trim()) e.fatherName = "Father's name is required";
    if (!personal.flatDoorNo.trim()) e.flatDoorNo = "Flat/Door No is required";
    if (!personal.areaLocality.trim()) e.areaLocality = "Area / Locality is required";
    if (!PINCODE_RE.test(personal.pincode)) e.pincode = "Enter a valid 6-digit pincode";
    if (!personal.state) e.state = "State is required";
    if (!personal.city.trim()) e.city = "City is required";
    if (!personal.residentialStatus) e.residentialStatus = "Determine your residential status to calculate resident rebates";
    if (!AADHAAR_RE.test(personal.aadhaar.replace(/\s/g, ""))) e.aadhaar = "Enter valid 12-digit Aadhaar";
    if (!PAN_RE.test(personal.pan.toUpperCase())) e.pan = "Enter valid PAN (e.g. ABCDE1234F)";
    if (!MOBILE_RE.test(personal.mobile)) e.mobile = "Enter valid 10-digit mobile number";
    if (!EMAIL_RE.test(personal.email)) e.email = "Enter valid email address";
    return e;
  };

  /* ── Tax computation ── */
  const tax = useMemo(() => {
    const isResident = personal.residentialStatus === "Indian Resident" || personal.residentialStatus === "Resident but Not Ordinarily Resident (RNOR)";
    const salaryOld = income.hasSalary ? salaryEntries.reduce((sum, e) => sum + getSalaryTotal(e, true), 0) : 0;
    const salaryNew = income.hasSalary ? salaryEntries.reduce((sum, e) => sum + getSalaryTotal(e, false), 0) : 0;
    const houseIncome = income.hasHouseProperty
      ? Math.max(0, toNum(income.rentReceived) - toNum(income.municipalTax) - toNum(income.homeLoanInterest))
      : 0;
    // Capital gains taxed at special flat rates (not in slab income)
    const stcgEquityTax  = income.hasCapitalGains ? Math.round(toNum(income.stcgEquity) * 0.20 * 1.04) : 0;
    const ltcgEquityTax  = income.hasCapitalGains ? Math.round(Math.max(0, toNum(income.ltcgEquity) - 125_000) * 0.125 * 1.04) : 0;
    const ltcgOtherTax   = income.hasCapitalGains ? Math.round(toNum(income.ltcgOther) * 0.125 * 1.04) : 0;
    const slabCapGains   = income.hasCapitalGains ? toNum(income.stcgOther) : 0;
    const other = income.hasOtherIncome
      ? toNum(income.interestSavings) + toNum(income.interestFD) + toNum(income.dividends) + toNum(income.otherIncome)
      : 0;
    const professionalTaxOld = Math.min(salaryOld, toNum(taxSaving.professionalTax));
    const professionalTaxNew = Math.min(salaryNew, toNum(taxSaving.professionalTax));
    const grossOld = salaryOld + houseIncome + slabCapGains + other;
    const grossNew = salaryNew + houseIncome + slabCapGains + other;
    const retirementReliefOld = Math.min(grossOld, toNum(taxSaving.foreignRetirementRelief));
    const retirementReliefNew = Math.min(grossNew, toNum(taxSaving.foreignRetirementRelief));

    // Old regime deductions
    const d80C   = Math.min(toNum(taxSaving.sec80C), 150_000);
    const d80D   = Math.min(toNum(taxSaving.sec80D_self), taxSaving.sec80D_selfSenior ? 50_000 : 25_000)
      + Math.min(toNum(taxSaving.sec80D_parents), taxSaving.sec80D_parentsSenior ? 50_000 : 25_000);
    const chapterVIA = d80C + d80D
      + toNum(taxSaving.sec80E) + toNum(taxSaving.sec80G)
      + Math.min(toNum(taxSaving.sec80TTA), income.hasOtherIncome ? toNum(income.interestSavings) : 0, 10_000)
      + (isResident && isSeniorForTaxYear(personal.dob)
        ? Math.min(toNum(taxSaving.sec80TTB), income.hasOtherIncome ? toNum(income.interestSavings) + toNum(income.interestFD) : 0, 50_000)
        : 0)
      + Math.min(toNum(taxSaving.nps80CCD), 50_000)
      + toNum(taxSaving.homeLoan80EEA);
    const employerNpsDeduction = toNum(taxSaving.employerNps);
    const totalDeductions = chapterVIA + employerNpsDeduction;

    const oldStandardDeduction = Math.min(salaryOld, STD_DEDUCTION_OLD);
    const newStandardDeduction = Math.min(salaryNew, STD_DEDUCTION_NEW);
    const taxableOld = Math.max(0, grossOld - oldStandardDeduction - professionalTaxOld - retirementReliefOld - totalDeductions);
    const newRegimeDeductions = toNum(taxSaving.employerNps);
    const taxableNew = Math.max(0, grossNew - newStandardDeduction - professionalTaxNew - retirementReliefNew - newRegimeDeductions);
    const specialRateIncome = income.hasCapitalGains
      ? toNum(income.stcgEquity) + toNum(income.ltcgEquity) + toNum(income.ltcgOther)
      : 0;

    const taxOld = calcTax(taxableOld, "old", isResident, taxableOld + specialRateIncome) + stcgEquityTax + ltcgEquityTax + ltcgOtherTax;
    const taxNew = calcTax(taxableNew, "new", isResident, taxableNew + specialRateIncome) + stcgEquityTax + ltcgEquityTax + ltcgOtherTax;
    const chosen = Math.max(0, (taxSaving.regime === "old" ? taxOld : taxNew) - toNum(taxSaving.arrearsRelief));
    const saving = Math.abs(taxOld - taxNew);
    const betterRegime = taxNew < taxOld ? "New" : "Old";

    const grossTotal = taxSaving.regime === "old" ? grossOld : grossNew;
    return { grossTotal, taxableOld, taxableNew, taxOld, taxNew, chosen, saving, betterRegime, totalDeductions: chapterVIA, employerNpsDeduction, arrearsRelief: Math.min(toNum(taxSaving.arrearsRelief), taxSaving.regime === "old" ? taxOld : taxNew), professionalTax: taxSaving.regime === "old" ? professionalTaxOld : professionalTaxNew, retirementIncomeRelief: taxSaving.regime === "old" ? retirementReliefOld : retirementReliefNew, stdDeduction: taxSaving.regime === "old" ? oldStandardDeduction : newStandardDeduction };
  }, [income, taxSaving, salaryEntries, personal.residentialStatus, personal.dob]);

  /* ── Navigation ── */
  const goNext = () => {
    // Allow checking later sections without completing every field first.
    // Clear any errors left by an earlier validation attempt so they don't
    // look like they are still blocking navigation.
    setErrors({});
    setStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const goBack = () => { setStep((s) => s - 1); window.scrollTo({ top: 0, behavior: "smooth" }); };

  /* ────────────────── RENDER ────────────────── */
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      <Navbar />

      <main className="flex-1 py-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">

          {/* Step bar */}
          <StepBar current={step} />

          {/* ── STEP 0 : PERSONAL INFO ── */}
          {step === 0 && (
            <div>
              {/* Permanent Information */}
              <FormSection
                icon={<User size={16} />}
                title="Permanent Information"
                subtitle="Please provide all info as per your government identity documents (PAN, Aadhaar etc.)"
                badge={personal.firstName && personal.dob && personal.fatherName ? "Details Added" : undefined}
              >
                <div className="mt-4 space-y-5">
                  {/* Name row */}
                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-3">
                      Name <span className="text-red-500">*</span>
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      <FloatingInput label="First Name" name="firstName" value={personal.firstName} onChange={handlePersonal} required error={errors.firstName} />
                      <FloatingInput label="Middle Name" name="middleName" value={personal.middleName} onChange={handlePersonal} />
                      <FloatingInput label="Last Name" name="lastName" value={personal.lastName} onChange={handlePersonal} />
                    </div>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-2">
                      <Info size={10} /> Name should be as per the PAN; 5th character of PAN no. is the first letter of the last name
                    </p>
                  </div>

                  {/* DOB */}
                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-2">Date of Birth <span className="text-red-500">*</span></p>
                    <FloatingInput label="DD/MM/YYYY" name="dob" type="date" value={personal.dob} onChange={handlePersonal} required hint="Specify date in a format like DD/MM/YYYY" error={errors.dob} />
                  </div>

                  {/* Father's name */}
                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-2">Father's Name <span className="text-red-500">*</span></p>
                    <FloatingInput label="Father's Name" name="fatherName" value={personal.fatherName} onChange={handlePersonal} required error={errors.fatherName} />
                  </div>

                  {/* Gender + Marital status */}
                  <div className="grid grid-cols-2 gap-4">
                    <FloatingSelect label="Gender" name="gender" value={personal.gender} onChange={handlePersonal}
                      options={[{ value: "M", label: "Male" }, { value: "F", label: "Female" }, { value: "O", label: "Other" }]} />
                    <FloatingSelect label="Marital Status" name="maritalStatus" value={personal.maritalStatus} onChange={handlePersonal}
                      options={[{ value: "single", label: "Single" }, { value: "married", label: "Married" }]} />
                  </div>
                </div>
              </FormSection>

                {/* Identification & Contact */}              
              <FormSection
                icon={<CreditCard size={16} className="text-rose-500" style={{ color: "#f87171" }} />}
                title="Identification & Contact details"
                subtitle="To e-file your returns, please provide your Aadhaar, PAN and contact details."
                badge={personal.aadhaar && personal.pan && personal.mobile && personal.email ? "Details Added" : undefined}
              >
                <div className="mt-4 space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-2">Aadhaar Details <span className="text-red-500">*</span></p>
                    <FloatingInput label="Aadhaar Number" name="aadhaar" value={personal.aadhaar} onChange={handlePersonal} required error={errors.aadhaar} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-2">PAN <span className="text-red-500">*</span></p>
                    <FloatingInput label="PAN" name="pan" value={personal.pan} onChange={(e) => handlePersonal({ target: { name: "pan", value: e.target.value.toUpperCase() } })} required error={errors.pan} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-2">Mobile No <span className="text-red-500">*</span></p>
                    <div className="flex gap-2">
                      <div className="w-24">
                        <FloatingSelect label="Code" name="mobileCountry" value={personal.mobileCountry} onChange={handlePersonal}
                          options={[{ value: "+91", label: "+91" }]} />
                      </div>
                      <div className="flex-1">
                        <FloatingInput label="Mobile Number" name="mobile" value={personal.mobile} onChange={handlePersonal} required error={errors.mobile} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-2">Email <span className="text-red-500">*</span></p>
                    <FloatingInput label="Email" name="email" type="email" value={personal.email} onChange={handlePersonal} required error={errors.email} />
                  </div>

                  {/* Optional: Additional info removed — bank details now in its own section below */}
                </div>
              </FormSection>

              {/* Bank Details */}
              <FormSection
                icon={<Building2 size={16} />}
                title="Bank Details"
                subtitle="Provide bank account details. In case of multiple accounts, First account will be selected as eligible for refund. Note: To receive your refund into an account it must be added and verified in the Income Tax portal."
                badge={bankAccounts[0]?.accountNumber && bankAccounts[0]?.ifsc ? "Details Added" : undefined}
              >
                <div className="mt-4">
                  <a
                    href="https://www.incometax.gov.in/iec/foportal/help/how-to-find-bank-account-details"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-blue-600 underline hover:text-blue-700 block mb-4"
                  >
                    How to find Bank account details
                  </a>

                  {/* Table header */}
                  <div className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-3 mb-2 px-1">
                    {["Account Number", "IFSC Code ⓘ", "Bank Name", "Account Type", ""].map((h) => (
                      <p key={h} className="text-xs font-bold text-slate-700">{h}</p>
                    ))}
                  </div>

                  {/* Account rows */}
                  <div className="space-y-3">
                    {bankAccounts.map((acc, i) => (
                      <div key={i} className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-3 items-start">
                        <input
                          type="text"
                          value={acc.accountNumber}
                          onChange={(e) => updateBankAccount(i, "accountNumber", e.target.value)}
                          placeholder="Account Number"
                          className="border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                        />
                        <input
                          type="text"
                          value={acc.ifsc}
                          onChange={(e) => updateBankAccount(i, "ifsc", e.target.value.toUpperCase())}
                          placeholder="e.g. SBIN0001234"
                          className="border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                        />
                        <input
                          type="text"
                          value={acc.bankName}
                          onChange={(e) => updateBankAccount(i, "bankName", e.target.value)}
                          placeholder="Bank Name"
                          className="border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                        />
                        <select
                          value={acc.accountType}
                          onChange={(e) => updateBankAccount(i, "accountType", e.target.value)}
                          className="border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 appearance-none"
                        >
                          <option value="">Select</option>
                          <option value="savings">Savings</option>
                          <option value="current">Current</option>
                          <option value="nro">NRO</option>
                          <option value="nre">NRE</option>
                        </select>
                        {bankAccounts.length > 1 ? (
                          <button
                            type="button"
                            onClick={() => removeBankAccount(i)}
                            className="mt-1 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        ) : <div className="w-8" />}
                      </div>
                    ))}
                  </div>

                  {/* Add more */}
                  <button
                    type="button"
                    onClick={addBankAccount}
                    className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <Plus size={15} className="border border-blue-600 rounded-full" />
                    Add More Bank Accounts
                  </button>
                </div>
              </FormSection>

              {/* Address */}
              <FormSection
                icon={<MapPin size={16} />}
                title="Your Address"
                subtitle="You can provide either your current address or permanent address of residence."
                badge={personal.flatDoorNo && personal.areaLocality && personal.pincode && personal.state && personal.city ? "Details Added" : undefined}
              >
                <div className="mt-4 space-y-4">
                  <FloatingInput label="Flat / Door No" name="flatDoorNo" value={personal.flatDoorNo} onChange={handlePersonal} required error={errors.flatDoorNo} />
                  <FloatingInput label="Premise Name" name="premiseName" value={personal.premiseName} onChange={handlePersonal} />
                  <FloatingInput label="Road / Street" name="roadStreet" value={personal.roadStreet} onChange={handlePersonal} />
                  <FloatingInput label="Area Locality" name="areaLocality" value={personal.areaLocality} onChange={handlePersonal} required error={errors.areaLocality} />
                  <FloatingInput label="Pincode / ZipCode" name="pincode" value={personal.pincode} onChange={handlePersonal} required error={errors.pincode} hint="6-digit pincode" />
                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-3">Country | State | City <span className="text-red-500">*</span></p>
                    <div className="grid grid-cols-3 gap-3">
                      <FloatingSelect label="Country" name="country" value={personal.country} onChange={handlePersonal}
                        options={[{ value: "INDIA", label: "INDIA" }]} />
                      <FloatingSelect label="State" name="state" value={personal.state} onChange={handlePersonal} required error={errors.state}
                        options={STATE_OPTIONS} />
                      <FloatingInput label="City" name="city" value={personal.city} onChange={handlePersonal} required error={errors.city} />
                    </div>
                  </div>
                </div>
              </FormSection>

              {/* Residential Status */}
              <FormSection
                icon={<UserCircle2 size={16} />}
                title="Residential Status"
                subtitle="The residential status depends on the number of days you stayed in India. Please follow the process to choose the correct residential status."
                badge={personal.residentialStatus ? "Details Added" : undefined}
              >
                <div className="mt-4">
                  {personal.residentialStatus ? (
                    <div>
                      <p className="text-xs text-slate-500 mb-2">Your residential status</p>
                      <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5">
                        <span className="font-bold text-slate-800 text-sm">{personal.residentialStatus}</span>
                        <button
                          type="button"
                          onClick={() => setShowResidentialModal(true)}
                          className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
                        >
                          Change Residential Status <ArrowRight size={13} />
                        </button>
                      </div>
                      <p className="text-xs text-slate-400 mt-2">Status selected for Tax Year 2026-27 (April 2026 to March 2027).</p>
                      {errors.residentialStatus && <p className="text-xs text-red-500 mt-2">{errors.residentialStatus}</p>}
                    </div>
                  ) : (
                    <div className="flex flex-col items-start gap-3">
                      <p className="text-sm text-slate-600">
                        Your residential status hasn't been set yet. Click below to determine it based on your days of stay in India.
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowResidentialModal(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-sm"
                      >
                        <UserCircle2 size={15} />
                        Determine Residential Status
                      </button>
                      {errors.residentialStatus && <p className="text-xs text-red-500">{errors.residentialStatus}</p>}
                    </div>
                  )}
                </div>
              </FormSection>

            
            </div>
          )}

          {/* ── STEP 1 : INCOME SOURCES ── */}
          {step === 1 && (
            <div>
              <p className="text-xs text-slate-500 mb-5 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-center gap-2">
                <Info size={14} className="text-blue-500 flex-shrink-0" />
                Select all income sources that apply. Only fill what's relevant — leave the rest blank.
              </p>

              {/* Salary */}
              <FormSection
                icon={<Briefcase size={16} />}
                title="Salary Income"
                subtitle="Add details manually or Upload Form 16 to auto-fill your salary details. You can add salary income from multiple jobs as well."
                badge={income.hasSalary && salaryEntries.some(e => e.employerName) ? "Details Added" : undefined}
                defaultOpen={true}
              >
                {/* Section-level action buttons */}
                <div className="flex items-center justify-end gap-3 mt-3 mb-4">
                  <label className="flex items-center gap-3 cursor-pointer mr-auto">
                    <input type="checkbox" name="hasSalary" checked={income.hasSalary} onChange={handleIncome}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                    <span className="text-sm font-semibold text-slate-700">I have salary / pension income</span>
                  </label>
                  {income.hasSalary && (
                    <>
                      <button
                        type="button"
                        onClick={addSalaryEntry}
                        className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        Add Another Salary
                      </button>
                      <button
                        type="button"
                        className="flex items-center gap-2 px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg text-sm font-bold hover:bg-blue-50 transition-colors"
                      >
                        <Upload size={14} />
                        Upload Form 16
                      </button>
                    </>
                  )}
                </div>

                {income.hasSalary && (
                  <div className="space-y-3">
                    {salaryEntries.map((entry) => {
                      const total = getSalaryTotal(entry, taxSaving.regime === "old");
                      const isEditing = editingSalaryId === entry.id;
                      const s171 = toNum(entry.basicPay) + toNum(entry.hra17) + toNum(entry.lta17) + toNum(entry.others17);
                      const s172 = toNum(entry.perquisites);
                      const s173 = toNum(entry.profitsInLieu);

                      return (
                        <div key={entry.id} className="border border-slate-200 rounded-xl overflow-hidden">
                          {/* Collapsed row */}
                          <div className="flex items-center justify-between px-4 py-3 bg-slate-50">
                            <span className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                              {entry.employerName || "New Employer"}
                            </span>
                            <div className="flex items-center gap-4">
                              {total > 0 && (
                                <span className="text-sm font-bold text-slate-800">
                                  ₹{total.toLocaleString("en-IN")}
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => setEditingSalaryId(isEditing ? null : entry.id)}
                                className="text-sm font-semibold text-blue-600 hover:text-blue-700 underline"
                              >
                                {isEditing ? "Done" : "Edit"}
                              </button>
                              {salaryEntries.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeSalaryEntry(entry.id)}
                                  className="text-sm font-semibold text-red-500 hover:text-red-600 underline"
                                >
                                  Remove
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => setEditingSalaryId(isEditing ? null : entry.id)}
                                className="text-slate-400 hover:text-slate-600"
                              >
                                {isEditing ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                              </button>
                            </div>
                          </div>

                          {/* Expanded edit form */}
                          {isEditing && (
                            <div className="px-4 pb-5 pt-4 bg-white border-t border-slate-100 space-y-5">

                              {/* Employer details */}
                              <div className="grid grid-cols-2 gap-4">
                                <FloatingInput
                                  label="Employer / Company Name"
                                  value={entry.employerName}
                                  onChange={(e) => updateSalaryEntry(entry.id, "employerName", e.target.value)}
                                />
                                <FloatingInput
                                  label="Employer TAN (optional)"
                                  value={entry.employerTAN}
                                  onChange={(e) => updateSalaryEntry(entry.id, "employerTAN", e.target.value.toUpperCase())}
                                  hint="10-digit TAN as per Form 16"
                                />
                              </div>

                              {/* Taxable Salary bar */}
                              <div className="flex items-center justify-between bg-slate-100 border border-slate-200 rounded-xl px-4 py-3">
                                <span className="text-sm font-bold text-slate-700">Taxable Salary</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-bold text-slate-900">
                                    {total > 0 ? `₹${total.toLocaleString("en-IN")}` : "—"}
                                  </span>
                                  <ChevronDown size={14} className="text-slate-400" />
                                </div>
                              </div>

                              {/* 1. Gross Salary — 17(1) */}
                              <div className="border border-slate-200 rounded-xl overflow-hidden">
                                {/* Section header */}
                                <div className="flex items-center justify-between px-4 py-3 bg-white">
                                  <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg bg-rose-50 flex items-center justify-center flex-shrink-0">
                                      <User size={13} className="text-rose-400" />
                                    </div>
                                    <span className="text-sm font-bold text-slate-800">1. Gross Salary</span>
                                    <span className="text-xs text-blue-500 cursor-pointer hover:underline">Read More</span>
                                  </div>
                                  <span className="text-sm font-bold text-slate-800">
                                    {s171 > 0 ? `₹${s171.toLocaleString("en-IN")}` : "—"}
                                  </span>
                                </div>

                                {/* 17(1) row — single total input + breakup toggle */}
                                <div className="border-t border-slate-100 px-4 py-3 bg-white space-y-3">
                                  <div className="flex items-center justify-between gap-4">
                                    <div className="min-w-0">
                                      <span className="text-xs text-slate-600 font-medium">17(1) : Basic, HRA, LTA &amp; other allowances</span>
                                      <span className="text-xs text-blue-500 ml-2 cursor-pointer hover:underline">Read More</span>
                                    </div>
                                    <CurrencyInput value={entry.grossSalary17 || ""} onChange={(e) => updateSalaryEntry(entry.id, "grossSalary17", e.target.value)} placeholder="Enter total" width="w-48" />
                                  </div>
                                  <p className="text-[11px] text-slate-400">Enter total or use the breakup below to split into components.</p>

                                  {/* Salary Breakup card */}
                                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                                    <div className="flex items-center justify-between mb-3">
                                      <div>
                                        <p className="text-sm font-bold text-slate-800">Salary Breakup</p>
                                        <p className="text-xs text-slate-500">You may edit the amounts or add other components if needed.</p>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          updateSalaryEntry(entry.id, "basicPay", "");
                                          updateSalaryEntry(entry.id, "hra17", "");
                                          updateSalaryEntry(entry.id, "lta17", "");
                                          updateSalaryEntry(entry.id, "others17", "");
                                          updateSalaryEntry(entry.id, "grossSalary17", "");
                                        }}
                                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex-shrink-0 ml-3"
                                      >
                                        Remove Breakup
                                      </button>
                                    </div>
                                    {/* Full-width rows instead of cramped grid */}
                                    <div className="space-y-0 divide-y divide-slate-200">
                                      {[
                                        { label: "Basic Pay", field: "basicPay" },
                                        { label: "House Rent Allowance", field: "hra17" },
                                        { label: "LTA Allowance", field: "lta17" },
                                        { label: "Others", field: "others17" },
                                      ].map(({ label, field }) => (
                                        <div key={field} className="flex items-center justify-between py-2.5 gap-4">
                                          <span className="text-xs text-slate-600 flex-1 min-w-0">{label}</span>
                                          <div className="flex items-center gap-1.5 border border-slate-300 rounded-lg px-3 py-1.5 bg-white w-44 flex-shrink-0">
                                            <span className="text-slate-400 text-xs flex-shrink-0">₹</span>
                                            <input
                                              type="number"
                                              value={entry[field]}
                                              onChange={(e) => updateSalaryEntry(entry.id, field, e.target.value)}
                                              placeholder="0"
                                              className="flex-1 text-sm font-semibold text-slate-800 bg-transparent border-none outline-none text-right min-w-0"
                                            />
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                    <button type="button" className="mt-3 text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                                      Edit Breakup <ArrowRight size={11} />
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* 2. Exempt Allowances — HRA, LTA */}
                              <ExemptAllowances
                                entry={entry}
                                updateSalaryEntry={updateSalaryEntry}
                                onOpenHRA={() => setHraModalEntryId(entry.id)}
                              />

                              {/* 3. Perquisites 17(2) */}
                              <div className="border border-slate-200 rounded-xl overflow-hidden">
                                <div className="flex items-center justify-between px-4 py-3 bg-white">
                                  <div>
                                    <span className="text-sm font-bold text-slate-800">2. Perquisites u/s 17(2)</span>
                                    <span className="text-xs text-blue-500 ml-2 cursor-pointer hover:underline">Read More</span>
                                  </div>
                                  <span className="text-sm font-bold text-slate-800">
                                    {s172 > 0 ? `₹${s172.toLocaleString("en-IN")}` : "—"}
                                  </span>
                                </div>
                                <div className="border-t border-slate-100 px-4 py-3 bg-white">
                                  <p className="text-xs text-slate-500 mb-3">Value of perquisites under section 17(2) — as per Form No. 12BA, wherever applicable</p>
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-slate-600">17(2) : Employer perks (car, ESOPs, etc.)</span>
                                    <CurrencyInput value={entry.perquisites} onChange={(e) => updateSalaryEntry(entry.id, "perquisites", e.target.value)} width="w-44" />
                                  </div>
                                </div>
                              </div>

                              {/* 3. Profits in lieu 17(3) */}
                              <div className="border border-slate-200 rounded-xl overflow-hidden">
                                <div className="flex items-center justify-between px-4 py-3 bg-white">
                                  <div>
                                    <span className="text-sm font-bold text-slate-800">3. Profits in lieu of salary u/s 17(3)</span>
                                    <span className="text-xs text-blue-500 ml-2 cursor-pointer hover:underline">Read More</span>
                                  </div>
                                  <span className="text-sm font-bold text-slate-800">
                                    {s173 > 0 ? `₹${s173.toLocaleString("en-IN")}` : "—"}
                                  </span>
                                </div>
                                <div className="border-t border-slate-100 px-4 py-3 bg-white">
                                  <p className="text-xs text-slate-500 mb-3">Profits in lieu of salary under section 17(3) — as per Form No. 12BA, wherever applicable</p>
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-slate-600">17(3) : Settlement, Bonus, extra salary, etc.</span>
                                    <CurrencyInput value={entry.profitsInLieu} onChange={(e) => updateSalaryEntry(entry.id, "profitsInLieu", e.target.value)} width="w-44" />
                                  </div>
                                </div>
                              </div>

                              {/* Other Salary Components */}
                              <OtherSalaryComponents entry={entry} updateSalaryEntry={updateSalaryEntry} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </FormSection>

              {/* HRA Exemption Modal — rendered outside the map */}
              {hraModalEntryId && (() => {
                const entry = salaryEntries.find(e => e.id === hraModalEntryId);
                return entry ? (
                  <HRAExemptionModal
                    entry={entry}
                    onClose={() => setHraModalEntryId(null)}
                    onSave={({ rentPaid, hraExemption, metroCity }) => {
                      updateSalaryEntry(entry.id, "rentPaid", rentPaid);
                      updateSalaryEntry(entry.id, "hraExemption", hraExemption);
                      updateSalaryEntry(entry.id, "metroCity", metroCity);
                    }}
                  />
                ) : null;
              })()}

              {/* House Property */}
              <FormSection icon={<Home size={16} />} title="House Property" subtitle="Rental income, self-occupied or let-out property">
                <div className="mt-3 mb-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" name="hasHouseProperty" checked={income.hasHouseProperty} onChange={handleIncome}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                    <span className="text-sm font-semibold text-slate-700">I have house property income / loss</span>
                  </label>
                </div>
                {income.hasHouseProperty && (
                  <div className="space-y-4 mt-4">
                    <FloatingInput label="Annual Rent Received (₹)" name="rentReceived" type="number" value={income.rentReceived} onChange={handleIncome} />
                    <div className="grid grid-cols-2 gap-4">
                      <FloatingInput label="Municipal Tax Paid (₹)" name="municipalTax" type="number" value={income.municipalTax} onChange={handleIncome} />
                      <FloatingInput label="Home Loan Interest (₹)" name="homeLoanInterest" type="number" value={income.homeLoanInterest} onChange={handleIncome} hint="Max ₹2L deduction for self-occupied" />
                    </div>
                  </div>
                )}
              </FormSection>

              {/* Capital Gains */}
              <FormSection icon={<TrendingUp size={16} />} title="Capital Gains" subtitle="Stocks, Mutual Funds, Property, F&O">
                <div className="mt-3 mb-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" name="hasCapitalGains" checked={income.hasCapitalGains} onChange={handleIncome}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                    <span className="text-sm font-semibold text-slate-700">I have capital gains / losses</span>
                  </label>
                </div>
                {income.hasCapitalGains && (
                  <div className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FloatingInput label="STCG — listed equity / equity MF (20%)" name="stcgEquity" type="number" value={income.stcgEquity} onChange={handleIncome} />
                      <FloatingInput label="LTCG — listed equity / equity MF (12.5%)" name="ltcgEquity" type="number" value={income.ltcgEquity} onChange={handleIncome} hint="Aggregate eligible gains above ₹1.25L taxable" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FloatingInput label="STCG — other assets (slab rate)" name="stcgOther" type="number" value={income.stcgOther} onChange={handleIncome} />
                      <FloatingInput label="LTCG — other assets (12.5%)*" name="ltcgOther" type="number" value={income.ltcgOther} onChange={handleIncome} hint="Rate and eligibility vary by asset and acquisition date" />
                    </div>
                  </div>
                )}
              </FormSection>

              {/* Other income */}
              <FormSection icon={<PiggyBank size={16} />} title="Other Income" subtitle="Interest, dividends, freelance, gifts etc.">
                <div className="mt-3 mb-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" name="hasOtherIncome" checked={income.hasOtherIncome} onChange={handleIncome}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                    <span className="text-sm font-semibold text-slate-700">I have other income</span>
                  </label>
                </div>
                {income.hasOtherIncome && (
                  <div className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FloatingInput label="Interest — Savings A/c (₹)" name="interestSavings" type="number" value={income.interestSavings} onChange={handleIncome} />
                      <FloatingInput label="Interest — FD / RD (₹)" name="interestFD" type="number" value={income.interestFD} onChange={handleIncome} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FloatingInput label="Dividends (₹)" name="dividends" type="number" value={income.dividends} onChange={handleIncome} />
                      <FloatingInput label="Any Other Income (₹)" name="otherIncome" type="number" value={income.otherIncome} onChange={handleIncome} />
                    </div>
                  </div>
                )}
              </FormSection>
            </div>
          )}

          {/* ── STEP 2 : TAX SAVING ── */}
          {step === 2 && (
            <div>
              {/* Regime selector */}
              <div className="mb-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <p className="text-sm font-bold text-slate-900 mb-3">Choose Tax Regime</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { val: "new", label: "New Regime", sub: "Default under the Income-tax Act, 2025; most personal deductions are not available." },
                    { val: "old", label: "Old Regime", sub: "Alternative regime with eligible savings, insurance and other deductions." },
                  ].map((r) => (
                    <label key={r.val}
                      className={`flex flex-col gap-1 p-4 rounded-xl border-2 cursor-pointer transition-all ${taxSaving.regime === r.val ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-slate-300"}`}>
                      <input type="radio" name="regime" value={r.val} checked={taxSaving.regime === r.val} onChange={handleTaxSaving} className="sr-only" />
                      <span className={`font-bold text-sm ${taxSaving.regime === r.val ? "text-blue-700" : "text-slate-700"}`}>{r.label}</span>
                      <span className="text-xs text-slate-500 leading-snug">{r.sub}</span>
                    </label>
                  ))}
                </div>
                {/* Recommendation chip */}
                <div className="mt-3 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-emerald-500 flex-shrink-0" />
                  {tax.betterRegime} Regime saves you <strong>{fmt(tax.saving)}</strong> based on your income
                </div>
              </div>

              <FormSection icon={<Calculator size={16} />} title="Deductions and Relief" subtitle="Salary deductions are calculated for Tax Year 2026-27; enter relief amounts only when eligible.">
                <div className="mt-4 space-y-5">
                  <section className="space-y-3">
                    <h3 className="text-sm font-bold text-slate-800">3A · Deduction under section 19</h3>
                    <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 px-4 py-3">
                      <div>
                        <p className="text-sm text-slate-700">Standard deduction</p>
                        <p className="text-xs text-slate-500">Auto-applied: up to ₹75,000 new regime or ₹50,000 old regime, limited to salary.</p>
                      </div>
                      <div className="flex items-center gap-2 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2">
                        <span className="text-slate-400">₹</span>
                        <span className="w-24 text-right text-sm font-semibold text-slate-700">{tax.stdDeduction.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                    <FloatingInput label="Professional tax paid during the tax year" name="professionalTax" type="number" value={taxSaving.professionalTax} onChange={handleTaxSaving} hint="Deductible under section 19 in either regime; limited to salary income." />
                  </section>

                  <section className="space-y-3 border-t border-slate-100 pt-4">
                    <h3 className="text-sm font-bold text-slate-800">3B · Relief under section 157 (formerly section 89)</h3>
                    <FloatingInput label="Relief for salary arrears / advance salary" name="arrearsRelief" type="number" value={taxSaving.arrearsRelief} onChange={handleTaxSaving} hint="Enter the eligible tax relief amount computed for Tax Year 2026-27. This reduces tax payable, not taxable income." />
                  </section>

                  <section className="space-y-3 border-t border-slate-100 pt-4">
                    <h3 className="text-sm font-bold text-slate-800">3C · Income claimed under section 158 (formerly section 89A)</h3>
                    <FloatingInput label="Eligible foreign retirement-account income" name="foreignRetirementRelief" type="number" value={taxSaving.foreignRetirementRelief} onChange={handleTaxSaving} hint="Enter qualifying income otherwise taxable this year that is deferred using the section 158 option in Form 40." />
                  </section>
                </div>
              </FormSection>

              <FormSection icon={<Info size={16} />} title="Tax rebate" subtitle="Resident individuals may qualify for a rebate after tax is calculated.">
                <div className="mt-4 space-y-2 text-sm text-slate-600">
                  <p><strong className="text-slate-800">New regime:</strong> rebate up to ₹60,000 where total income is up to ₹12 lakh; marginal relief may apply just above ₹12 lakh.</p>
                  <p><strong className="text-slate-800">Old regime:</strong> rebate up to ₹12,500 where total income is up to ₹5 lakh.</p>
                  <p className="text-xs text-slate-500">Rebate is for resident individuals. Tax on special-rate income such as capital gains is calculated separately. Tax Year 2026-27 rebate rules are in section 156 of the Income-tax Act, 2025.</p>
                </div>
              </FormSection>

              <FormSection icon={<Calculator size={16} />} title="Deductions available under both regimes"
                subtitle="Enter the eligible employer contribution shown in your salary or NPS records.">
                <div className="mt-4">
                  <FloatingInput label="Employer NPS contribution eligible for deduction" name="employerNps" type="number" value={taxSaving.employerNps} onChange={handleTaxSaving} hint="Section 124. Use the eligible amount from Form 16/payroll after the salary-based limit; do not enter your own NPS contribution here." />
                </div>
              </FormSection>

              <FormSection icon={<Calculator size={16} />} title="Other deductions (old regime)"
                subtitle="These deductions do not reduce taxable income under the new regime. Enter eligible amounts for Tax Year 2026-27.">
                <div className="mt-4 space-y-4">
                  <FloatingInput label="Eligible savings: LIC, PPF, ELSS, EPF, tuition fees (max ₹1.5L)" name="sec80C" type="number" value={taxSaving.sec80C} onChange={handleTaxSaving} hint="Section 123; equivalent to the familiar section 80C cap. Combined cap of ₹1,50,000." />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <FloatingInput label="Health cover / eligible medical costs (Self & Family)" name="sec80D_self" type="number" value={taxSaving.sec80D_self} onChange={handleTaxSaving} hint={`Section 126; limit: ₹${taxSaving.sec80D_selfSenior ? "50,000" : "25,000"}`} />
                      <label className="flex items-center gap-2 text-xs text-slate-600">
                        <input type="checkbox" name="sec80D_selfSenior" checked={taxSaving.sec80D_selfSenior} onChange={handleTaxSaving} />
                        Self, spouse or dependent child is 60 or older
                      </label>
                    </div>
                    <div className="space-y-2">
                      <FloatingInput label="Health cover / eligible medical costs (Parents)" name="sec80D_parents" type="number" value={taxSaving.sec80D_parents} onChange={handleTaxSaving} hint={`Section 126; limit: ₹${taxSaving.sec80D_parentsSenior ? "50,000" : "25,000"}`} />
                      <label className="flex items-center gap-2 text-xs text-slate-600">
                        <input type="checkbox" name="sec80D_parentsSenior" checked={taxSaving.sec80D_parentsSenior} onChange={handleTaxSaving} />
                        Parent is 60 or older
                      </label>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FloatingInput label="Sec 80E — Education Loan Interest" name="sec80E" type="number" value={taxSaving.sec80E} onChange={handleTaxSaving} />
                    <FloatingInput label="Eligible deduction for donations" name="sec80G" type="number" value={taxSaving.sec80G} onChange={handleTaxSaving} hint="Section 133. Enter the deductible amount from your donation records, not the full donation unless fully eligible." />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {isSeniorForTaxYear(personal.dob) && personal.residentialStatus !== "Non Resident Indian" ? (
                      <FloatingInput label="Senior citizen interest deduction" name="sec80TTB" type="number" value={taxSaving.sec80TTB} onChange={handleTaxSaving} hint={`Up to ₹50,000; limited to eligible savings and deposit interest (currently ₹${(toNum(income.interestSavings) + toNum(income.interestFD)).toLocaleString("en-IN")}).`} />
                    ) : (
                      <FloatingInput label="Savings account interest deduction" name="sec80TTA" type="number" value={taxSaving.sec80TTA} onChange={handleTaxSaving} hint={`Up to ₹10,000 and limited to savings interest (currently ₹${toNum(income.interestSavings).toLocaleString("en-IN")}).`} />
                    )}
                    <FloatingInput label="Own NPS contributions (max ₹50,000)" name="nps80CCD" type="number" value={taxSaving.nps80CCD} onChange={handleTaxSaving} hint="Old regime only; subject to the combined rules for NPS and other eligible savings." />
                  </div>
                  <FloatingInput label="Sec 80EEA — Home Loan (First-time buyers)" name="homeLoan80EEA" type="number" value={taxSaving.homeLoan80EEA} onChange={handleTaxSaving} hint="Max ₹1.5L, loan sanctioned between 1 Apr 2019 – 31 Mar 2022" />
                </div>
              </FormSection>
            </div>
          )}

          {/* ── STEP 3 : TAX SUMMARY ── */}
          {step === 3 && (
            <div>
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm mb-5">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 text-white">
                  <div className="flex items-center gap-3 mb-1">
                    <Calculator size={20} />
                    <h2 className="font-extrabold text-lg">Your Tax Computation Summary</h2>
                  </div>
                  <p className="text-blue-100 text-sm">
                    Tax Year 2026–27 · Income-tax Act, 2025 · {taxSaving.regime === "new" ? "New" : "Old"} Regime
                  </p>
                </div>

                {/* Body */}
                <div className="px-5 py-5">
                  <SummaryRow label="Gross Total Income" value={fmt(tax.grossTotal)} />
                  {tax.professionalTax > 0 && <SummaryRow label="Professional tax deduction" value={`- ${fmt(tax.professionalTax)}`} />}
                  <SummaryRow label="Standard Deduction" value={`- ${fmt(tax.stdDeduction)}`} />
                  {tax.retirementIncomeRelief > 0 && <SummaryRow label="Eligible retirement-account income relief" value={`- ${fmt(tax.retirementIncomeRelief)}`} />}
                  {taxSaving.regime === "old" && <SummaryRow label="Other eligible old-regime deductions" value={`- ${fmt(tax.totalDeductions)}`} />}
                  {tax.employerNpsDeduction > 0 && <SummaryRow label="Eligible employer NPS contribution" value={`- ${fmt(tax.employerNpsDeduction)}`} />}
                  <SummaryRow label="Taxable Income" value={fmt(taxSaving.regime === "new" ? tax.taxableNew : tax.taxableOld)} bold />
                  <div className="h-3" />
                  <SummaryRow label="Tax Payable (Old Regime)" value={fmt(tax.taxOld)} />
                  <SummaryRow label="Tax Payable (New Regime)" value={fmt(tax.taxNew)} />
                  {tax.arrearsRelief > 0 && <SummaryRow label="Relief under section 157 (selected regime)" value={`- ${fmt(tax.arrearsRelief)}`} />}
                  <div className="h-3" />
                  <SummaryRow
                    label={`✅ Tax under ${taxSaving.regime === "new" ? "New" : "Old"} Regime (Your Choice)`}
                    value={fmt(tax.chosen)}
                    highlight bold
                  />
                </div>
                <p className="px-5 pb-4 text-xs text-slate-500">
                  This is an estimate. Property income, age-based old-regime slabs, deduction eligibility, surcharge, and asset-specific capital-gains rules may change the final tax.
                </p>

                {/* Savings callout */}
                <div className="mx-5 mb-5 bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
                  <CheckCircle2 size={20} className="text-emerald-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-emerald-800">
                      {tax.betterRegime} Regime is more beneficial for you
                    </p>
                    <p className="text-xs text-emerald-700 mt-0.5">
                      Switching saves you <strong>{fmt(tax.saving)}</strong> in tax
                    </p>
                  </div>
                </div>
              </div>

              {/* Personal summary card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm mb-5">
                <h3 className="font-bold text-slate-900 text-sm mb-4">Filing Details</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {[
                    { l: "Name", v: fullName(personal) || "—" },
                    { l: "PAN", v: personal.pan || "—" },
                    { l: "Date of Birth", v: personal.dob || "—" },
                    { l: "Mobile", v: personal.mobile ? `${personal.mobileCountry} ${personal.mobile}` : "—" },
                    { l: "Email", v: personal.email || "—" },
                    { l: "City", v: personal.city || "—" },
                  ].map((item) => (
                    <div key={item.l} className="bg-slate-50 rounded-lg p-3">
                      <p className="text-xs text-slate-400 mb-1">{item.l}</p>
                      <p className="font-semibold text-slate-800 truncate">{item.v}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Proceed to service */}
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
                <p className="text-sm text-blue-900 font-bold mb-1">Ready to file your ITR?</p>
                <p className="text-xs text-blue-700 mb-4">
                  Your tax summary is ready. Choose a plan to have a CA review and e-file your return.
                </p>
                <button
                  onClick={() => navigate("/services/individual")}
                  className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  Proceed to Select Plan & File <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ── Navigation buttons ── */}
          <div className="flex items-center justify-between mt-6 pt-5 border-t border-slate-200">
            <button
              type="button"
              onClick={step === 0 ? () => navigate("/itr-filing") : goBack}
              className="flex items-center gap-2 px-6 py-3 border border-slate-300 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft size={16} />
              {step === 0 ? "Back to Home" : "Previous"}
            </button>

            {step < 3 && (
              <button
                type="button"
                onClick={goNext}
                className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
              >
                {step === 2 ? "View Tax Summary" : "Save & Continue"}
                <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>
      </main>

      <Footer />

      {/* Residential Status Modal */}
      {showResidentialModal && (
        <ResidentialStatusModal
            initialData={{ status: personal.residentialStatus }}
          onClose={() => setShowResidentialModal(false)}
          onConfirm={(status) => {
            setPersonal((p) => ({ ...p, residentialStatus: status }));
            setErrors((currentErrors) => ({ ...currentErrors, residentialStatus: "" }));
            setShowResidentialModal(false);
          }}
        />
      )}
    </div>
  );
};

export default ITRFilingForm;
