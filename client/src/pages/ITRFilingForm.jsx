import { useState, useMemo } from "react";

import { useNavigate } from "react-router-dom";

import { getData } from "country-list";
import { states as getStates, uts as getUTs } from "knowindia";

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

/* â”€â”€â”€ Geo data (module-level, computed once) â”€â”€â”€ */

const COUNTRIES = getData(); // [{ code, name }]

/* â”€â”€â”€ State + UT options from knowindia package â”€â”€â”€ */
const _statesData = getStates();
const _utsData    = getUTs();
// Combine states and UTs, sort alphabetically, build options
const STATE_OPTIONS = [
  ...Object.values(_statesData).map(s => s.name),
  ...Object.values(_utsData).map(u => u.name),
]
  .sort((a, b) => a.localeCompare(b))
  .map(name => ({ value: name.toUpperCase(), label: name }));

const COUNTRY_OPTIONS = COUNTRIES.map((c) => ({
  value: c.name,
  label: c.name.toUpperCase(),
}));

/* â”€â”€â”€ Validation regexes (module-level) â”€â”€â”€ */

const PINCODE_RE = /^\d{6}$/;

const AADHAAR_RE = /^\d{12}$/;

const PAN_RE = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

const MOBILE_RE = /^\d{10}$/;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* â”€â”€â”€ Pure helpers (module-level, no closure) â”€â”€â”€ */

const toNum = (v) => Math.max(0, parseFloat(v) || 0);

const fmt = (n) => `â‚¹${Math.abs(n).toLocaleString("en-IN")}`;

const fullName = (p) =>
  [p.firstName, p.middleName, p.lastName].filter(Boolean).join(" ");

const isSeniorForTaxYear = (dob) => {
  if (!dob) return false;

  const birthDate = new Date(`${dob}T00:00:00`);

  if (Number.isNaN(birthDate.getTime())) return false;

  const yearEnd = new Date(2027, 2, 31);

  const birthdayThisYear = new Date(
    2027,
    birthDate.getMonth(),
    birthDate.getDate(),
  );

  const ageOnYearEnd =
    yearEnd.getFullYear() -
    birthDate.getFullYear() -
    (yearEnd < birthdayThisYear ? 1 : 0);

  return ageOnYearEnd >= 60;
};

// Senior citizen (60-79): basic exemption Rs.3L under old regime

// Super senior citizen (80+): basic exemption Rs.5L under old regime

const isSuperSeniorForTaxYear = (dob) => {
  if (!dob) return false;

  const birthDate = new Date(`${dob}T00:00:00`);

  if (Number.isNaN(birthDate.getTime())) return false;

  const yearEnd = new Date(2027, 2, 31);

  const birthdayThisYear = new Date(
    2027,
    birthDate.getMonth(),
    birthDate.getDate(),
  );

  const ageOnYearEnd =
    yearEnd.getFullYear() -
    birthDate.getFullYear() -
    (yearEnd < birthdayThisYear ? 1 : 0);

  return ageOnYearEnd >= 80;
};

/* â”€â”€â”€ Tax rules for Tax Year 2026-27 (module-level) â”€â”€â”€ */

const STD_DEDUCTION_NEW = 75_000;

const STD_DEDUCTION_OLD = 50_000;

const calcTax = (
  taxableIncome,
  regime,
  rebateEligible,
  totalIncome = taxableIncome,
  isSenior = false,
  isSuperSenior = false,
) => {
  let tax = 0;

  if (regime === "old") {
    // Basic exemption thresholds: super-senior â‚¹5L, senior â‚¹3L, general â‚¹2.5L

    const exempt = isSuperSenior ? 500_000 : isSenior ? 300_000 : 250_000;

    if (taxableIncome <= exempt) tax = 0;
    else if (taxableIncome <= 500_000) tax = (taxableIncome - exempt) * 0.05;
    else if (taxableIncome <= 1_000_000)
      tax = (500_000 - exempt) * 0.05 + (taxableIncome - 500_000) * 0.2;
    else
      tax =
        (500_000 - exempt) * 0.05 + 100_000 + (taxableIncome - 1_000_000) * 0.3;

    // Section 156(1) / 87A: resident rebate up to â‚¹12,500 where total income â‰¤ â‚¹5L.

    // Super seniors (80+) have no rebate since their exemption already covers â‚¹5L.

    if (rebateEligible && !isSuperSenior && totalIncome <= 500_000)
      tax = Math.max(0, tax - Math.min(tax, 12_500));
  } else {
    if (taxableIncome <= 400_000) tax = 0;
    else if (taxableIncome <= 800_000) tax = (taxableIncome - 400_000) * 0.05;
    else if (taxableIncome <= 1_200_000)
      tax = 20_000 + (taxableIncome - 800_000) * 0.1;
    else if (taxableIncome <= 1_600_000)
      tax = 60_000 + (taxableIncome - 1_200_000) * 0.15;
    else if (taxableIncome <= 2_000_000)
      tax = 120_000 + (taxableIncome - 1_600_000) * 0.2;
    else if (taxableIncome <= 2_400_000)
      tax = 200_000 + (taxableIncome - 2_000_000) * 0.25;
    else tax = 300_000 + (taxableIncome - 2_400_000) * 0.3;

    // Section 156(2): rebate up to â‚¹60,000 for total income â‰¤ â‚¹12L; marginal relief above.

    if (rebateEligible && totalIncome <= 1_200_000)
      tax = Math.max(0, tax - Math.min(tax, 60_000));
    else if (rebateEligible && totalIncome > 1_200_000)
      tax = Math.min(tax, totalIncome - 1_200_000);
  }

  return Math.round(tax * 1.04); // +4% health & education cess
};

/* â”€â”€â”€ Salary entry factory (module-level) â”€â”€â”€ */

let nextSalaryEntryId = 0;

const newSalaryEntry = () => ({
  id: ++nextSalaryEntryId,

  employerName: "",
  employerTAN: "",

  grossSalary17: "", // single-amount 17(1) input

  basicPay: "",
  hra17: "",
  lta17: "",
  others17: "", // 17(1) breakup

  perquisites: "", // 17(2)

  profitsInLieu: "", // 17(3)

  hraExemption: "",
  ltaExemption: "",
  rentPaid: "",
  metroCity: false,

  foreignSalaryNotified: "",
  foreignSalaryNonNotified: "",
  salaryPastYears89A: "",
});

/* â”€â”€â”€ Salary total (module-level, pure) â”€â”€â”€ */

const getSalaryTotal = (entry, applyExemptions = true) => {
  const breakupFilled =
    entry.basicPay || entry.hra17 || entry.lta17 || entry.others17;

  const s171 = breakupFilled
    ? toNum(entry.basicPay) +
      toNum(entry.hra17) +
      toNum(entry.lta17) +
      toNum(entry.others17)
    : toNum(entry.grossSalary17);

  const s172 = toNum(entry.perquisites);

  const s173 = toNum(entry.profitsInLieu);

  const exemptions = applyExemptions
    ? toNum(entry.hraExemption) + toNum(entry.ltaExemption)
    : 0;

  return s171 + s172 + s173 - exemptions;
};

/* â”€â”€â”€ Step definitions â”€â”€â”€ */

const STEPS = [
  { id: 0, label: "Personal Info" },

  { id: 1, label: "Income Sources" },

  { id: 2, label: "Deductions & Relief" },

  { id: 3, label: "Tax Summary" },
];

/* â”€â”€â”€ Field helper components â”€â”€â”€ */

const FloatingInput = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  hint,
  error,
  required,
  readOnly,
}) => (
  <div className="flex flex-col gap-1">
    <div className="relative">
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onWheel={type === "number" ? (e) => e.target.blur() : undefined}
        readOnly={readOnly}
        placeholder=" "
        className={`peer w-full border rounded-lg px-4 pt-5 pb-2 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 transition-all

          ${error ? "border-red-400 focus:ring-red-200" : "border-slate-300 focus:ring-blue-200 focus:border-blue-500"}

          ${readOnly ? "bg-slate-50 cursor-not-allowed" : ""}

        `}
      />

      <label
        className="absolute left-4 top-3.5 text-xs text-slate-400 transition-all pointer-events-none

        peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-xs

        peer-focus:top-1 peer-focus:text-[10px] peer-focus:text-blue-500

        peer-[&:not(:placeholder-shown)]:top-1 peer-[&:not(:placeholder-shown)]:text-[10px]"
      >
        {label}
        {required && " *"}
      </label>
    </div>

    {hint && !error && (
      <p className="text-[11px] text-slate-400 flex items-center gap-1">
        <Info size={10} />
        {hint}
      </p>
    )}

    {error && (
      <p className="text-[11px] text-red-500 flex items-center gap-1">
        <AlertCircle size={10} />
        {error}
      </p>
    )}
  </div>
);

const FloatingSelect = ({
  label,
  name,
  value,
  onChange,
  options,
  error,
  required,
}) => (
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
        <option value="" disabled>
          {" "}
        </option>

        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <label
        className={`absolute left-4 pointer-events-none transition-all

        ${value ? "top-1 text-[10px] text-blue-500" : "top-3.5 text-xs text-slate-400"}

      `}
      >
        {label}
        {required && " *"}
      </label>

      <ChevronDown
        size={14}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
      />
    </div>

    {error && (
      <p className="text-[11px] text-red-500 flex items-center gap-1">
        <AlertCircle size={10} />
        {error}
      </p>
    )}
  </div>
);

/* â”€â”€â”€ Inline â‚¹ currency input â”€â”€â”€ */

const CurrencyInput = ({
  value,
  onChange,
  placeholder = "0",
  width = "w-44",
  className = "",
}) => (
  <div
    className={`flex items-center gap-1 border border-slate-300 rounded-lg px-3 py-2 bg-white flex-shrink-0 ${width} ${className}`}
  >
    <span className="text-slate-400 text-sm flex-shrink-0">â‚¹</span>

    <input
      type="number"
      onWheel={(e) => e.target.blur()}
      value={value ?? ""}
      onChange={onChange}
      onWheel={(e) => e.target.blur()}
      placeholder={placeholder}
      className="flex-1 text-sm font-semibold text-slate-800 outline-none bg-transparent text-right min-w-0"
    />
  </div>
);

/* â”€â”€â”€ Collapsible card section â”€â”€â”€ */

const FormSection = ({
  icon,
  title,
  subtitle,
  badge,
  children,
  defaultOpen = true,
}) => {
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

            {subtitle && (
              <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>

        {open ? (
          <ChevronUp size={16} className="text-slate-400" />
        ) : (
          <ChevronDown size={16} className="text-slate-400" />
        )}
      </button>

      {open && (
        <div className="px-6 pb-6 pt-1 bg-white border-t border-slate-100">
          {children}
        </div>
      )}
    </div>
  );
};

/* â”€â”€â”€ Residential Status Modal â”€â”€â”€ */

const ResidentialStatusModal = ({ onClose, onConfirm, initialData }) => {
  const [phase, setPhase] = useState(initialData?.status ? "result" : "form");

  const [result, setResult] = useState(initialData?.status || null);

  const [daysCurrentFY, setDaysCurrentFY] = useState(
    initialData?.daysCurrentFY || "",
  );

  const [daysPrev4FY, setDaysPrev4FY] = useState(
    initialData?.daysPrev4FY || "",
  );

  const [jurisdictions, setJurisdictions] = useState(
    initialData?.jurisdictions?.length
      ? initialData.jurisdictions
      : [{ country: "", tin: "" }],
  );

  // RNOR: Indian Resident but was NRI for â‰¥ 9 of last 10 years, OR < 730 days in last 7 years

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
    setJurisdictions((j) =>
      j.map((item, idx) => (idx === i ? { ...item, [field]: val } : item)),
    );

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
            <h2 className="font-extrabold text-slate-900 text-base">
              Residential Status
            </h2>

            <p className="text-xs text-slate-500 mt-0.5">
              Residential Status is crucial to calculate the correct taxation.
            </p>

            <p className="text-xs text-slate-500">
              Just answer a few questions and{" "}
              <strong className="text-slate-700">we will auto-select</strong>{" "}
              the correct Residential Status for you!
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="ml-4 mt-0.5 text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0"
          >
            <X size={20} />
          </button>
          
        </div>

        {/* Body */}

        <div className="flex-1 overflow-y-auto">
          {phase === "form" && (
            <div className="px-5 py-5 space-y-6">
              {/* Duration of stay */}

              <div>
                <p className="text-sm font-bold text-slate-800 mb-3">
                  Enter your duration of stay in India
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">
                      Days stayed between 1 Apr 2026 to 31 Mar 2027 (in days)
                    </label>

                    <input
                      type="number"
                      onWheel={(e) => e.target.blur()}
                      min="0"
                      max="366"
                      value={daysCurrentFY}
                      onChange={(e) => setDaysCurrentFY(e.target.value)}
                      placeholder=""
                      className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">
                      Days stayed between 1 Apr 2022 to 31 Mar 2026 (in days)
                    </label>

                    <input
                      type="number"
                      onWheel={(e) => e.target.blur()}
                      min="0"
                      max="1461"
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
                <p className="text-sm font-bold text-slate-800 mb-3">
                  Enter your jurisdiction details
                </p>

                {jurisdictions.map((j, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-2 gap-3 mb-3 items-start"
                  >
                    <div>
                      <label className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                        Jurisdiction of Resident{" "}
                        <Info size={11} className="text-slate-400" />
                      </label>

                      <div className="relative">
                        <select
                          value={j.country}
                          onChange={(e) =>
                            updateJurisdiction(i, "country", e.target.value)
                          }
                          className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 appearance-none"
                        >
                          <option value="">Select Country</option>

                          {COUNTRY_OPTIONS.map((country) => (
                            <option key={country.value} value={country.value}>
                              {country.label}
                            </option>
                          ))}
                        </select>

                        <ChevronDown
                          size={13}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                        Tax Identification number{" "}
                        <Info size={11} className="text-slate-400" />
                      </label>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={j.tin}
                          onChange={(e) =>
                            updateJurisdiction(i, "tin", e.target.value)
                          }
                          placeholder="Enter TIN number"
                          className="flex-1 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                        />

                        {jurisdictions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeJurisdiction(i)}
                            className="flex-shrink-0 p-2.5 border border-red-200 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="15"
                              height="15"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                              <path d="M10 11v6" />
                              <path d="M14 11v6" />
                              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addJurisdiction}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 mt-1"
                >
                  + Add another jurisdiction
                </button>
              </div>
            </div>
          )}

          {phase === "result" && result && (
            <div className="px-5 py-6 flex flex-col items-center text-center">
              <div className="w-28 h-28 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                <UserCircle2
                  size={64}
                  className="text-blue-400"
                  strokeWidth={1.2}
                />
              </div>

              <h3 className="text-2xl font-extrabold text-slate-900 mb-2">
                {result}
              </h3>

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
          {phase === "form" && (
            <button
              type="button"
              onClick={handleCalculate}
              disabled={!daysCurrentFY}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Calculate Status
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* â”€â”€â”€ Step progress bar â”€â”€â”€ */

/* â”€â”€â”€ Step progress bar â€” vertical sidebar â”€â”€â”€ */
const StepBar = ({ current, completedSteps = new Set(), onStepClick }) => (
  <div className="flex flex-col w-64 flex-shrink-0">
    {/* Header */}
    <div className="mb-6 px-1">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Your Progress</p>
    </div>

    {STEPS.map((step, i) => {
      const done   = completedSteps.has(i);
      const active = current === i;

      return (
        <div key={step.id} className="flex items-stretch gap-4">
          {/* Left track */}
          <div className="flex flex-col items-center w-8 flex-shrink-0">
            {/* Circle */}
            <button
              type="button"
              onClick={() => onStepClick(i)}
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all z-10 border-2
                ${active
                  ? "bg-slate-900 border-slate-900 shadow-lg"
                  : done
                  ? "bg-emerald-500 border-emerald-500"
                  : "bg-white border-slate-300 hover:border-slate-400"}
              `}
            >
              {done
                ? <CheckCircle2 size={16} className="text-white" />
                : <span className={`text-xs font-black ${active ? "text-white" : "text-slate-400"}`}>{i + 1}</span>
              }
            </button>
            {/* Connector line */}
            {i < STEPS.length - 1 && (
              <div className={`w-0.5 flex-1 my-1.5 min-h-[36px] rounded-full ${done ? "bg-emerald-400" : "bg-slate-200"}`} />
            )}
          </div>

          {/* Label */}
          <button
            type="button"
            onClick={() => onStepClick(i)}
            className="flex-1 text-left pb-8 last:pb-0 cursor-pointer group"
          >
            <p className={`text-sm font-bold leading-snug transition-colors
              ${active ? "text-slate-900" : done ? "text-emerald-700" : "text-slate-400 group-hover:text-slate-600"}
            `}>
              {step.label}
            </p>
            <p className={`text-xs mt-0.5 transition-colors
              ${active ? "text-blue-600 font-semibold" : done ? "text-emerald-500" : "text-slate-300 group-hover:text-slate-400"}
            `}>
              {done ? "âœ“ Completed" : active ? "In progress" : "Not started"}
            </p>
          </button>
        </div>
      );
    })}
  </div>
);

/* â”€â”€â”€ Tax Summary row â”€â”€â”€ */

const SummaryRow = ({ label, value, highlight, bold }) => (
  <div
    className={`flex items-center justify-between py-3 border-b border-slate-100 last:border-0 ${highlight ? "bg-blue-50 -mx-5 px-5 rounded-xl" : ""}`}
  >
    <span
      className={`text-sm ${bold ? "font-bold text-slate-900" : "text-slate-600"}`}
    >
      {label}
    </span>

    <span
      className={`text-sm font-bold ${highlight ? "text-blue-700 text-base" : "text-slate-900"}`}
    >
      {value}
    </span>
  </div>
);

/* â”€â”€â”€ Exempt Allowances section (HRA + LTA) â”€â”€â”€ */

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
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
            <span className="text-blue-600 font-black text-xs">2</span>
          </div>

          <div className="text-left">
            <span className="text-sm font-bold text-slate-800">
              2. Exempt allowances like HRA, LTA etc.
            </span>

            <span className="text-xs text-blue-500 ml-2 cursor-pointer hover:underline">
              Read More
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-slate-800">
            â‚¹ {total.toLocaleString("en-IN")}
          </span>

          {open ? (
            <ChevronUp size={16} className="text-slate-400" />
          ) : (
            <ChevronDown size={16} className="text-slate-400" />
          )}
        </div>
      </button>

      {open && (
        <div className="border-t border-slate-100 px-4 py-4 bg-white space-y-4">
          {/* HRA Exemption row */}

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-700">
                  HRA Exemption
                </p>

                <p className="text-xs text-slate-400">
                  You can edit your HRA exemption here. We will auto-calculate
                  your details.{" "}
                  <span className="text-blue-500 cursor-pointer hover:underline">
                    View Details
                  </span>
                </p>
              </div>

              <CurrencyInput
                value={entry.hraExemption}
                onChange={(e) =>
                  updateSalaryEntry(entry.id, "hraExemption", e.target.value)
                }
                width="w-44 ml-4"
              />
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
              <p className="text-sm font-semibold text-slate-700">
                LTA Exemption
              </p>

              <p className="text-xs text-slate-400">
                Leave Travel Allowance exemption u/s 10(5)
              </p>
            </div>

            <CurrencyInput
              value={entry.ltaExemption}
              onChange={(e) =>
                updateSalaryEntry(entry.id, "ltaExemption", e.target.value)
              }
              width="w-44 ml-4"
            />
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

/* â”€â”€â”€ HRA Exemption Modal â”€â”€â”€ */

const HRAExemptionModal = ({ entry, onClose, onSave }) => {
  const [metroCity, setMetroCity] = useState(entry.metroCity || false);

  const [rentPaid, setRentPaid] = useState(entry.rentPaid || "");

  const [hraExemption, setHraExemption] = useState(entry.hraExemption || "");

  // Auto-calculate HRA exemption (simplified rule)

  // Exempt = min of: actual HRA received, rent paid - 10% basic, 50%(metro)/40%(non-metro) of basic

  const basicPay = parseFloat(entry.basicPay) || 0;

  const hraReceived = parseFloat(entry.hra17) || 0;

  const rent = parseFloat(rentPaid) || 0;

  const autoCalc = Math.max(
    0,
    Math.min(
      hraReceived,

      rent - 0.1 * basicPay,

      (metroCity ? 0.5 : 0.4) * basicPay,
    ),
  );

  const handleSave = () => {
    onSave({
      rentPaid: rent.toString(),
      hraExemption: hraExemption || autoCalc.toString(),
      metroCity,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}

        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-100">
          <h2 className="font-extrabold text-slate-900 text-base">
            Add HRA exemption
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
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
                â‚¹{" "}
                {(parseFloat(hraExemption) || autoCalc).toLocaleString("en-IN")}
              </span>
            </span>

            <button
              type="button"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View More Details <ArrowRight size={11} />
            </button>
          </div>

          {/* Metro toggle */}

          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-800">
              Did you live in Delhi, Mumbai, Kolkata, or Chennai?
            </p>

            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-semibold ${!metroCity ? "text-slate-800" : "text-slate-400"}`}
              >
                No
              </span>

              <button
                type="button"
                onClick={() => setMetroCity((v) => !v)}
                className={`relative w-11 h-6 rounded-full transition-colors ${metroCity ? "bg-blue-600" : "bg-slate-300"}`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${metroCity ? "translate-x-5" : "translate-x-0.5"}`}
                />
              </button>

              <span
                className={`text-xs font-semibold ${metroCity ? "text-slate-800" : "text-slate-400"}`}
              >
                Yes
              </span>
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

                <p className="text-xs text-slate-500">
                  During this employment period
                </p>
              </div>

              <button
                type="button"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 border border-blue-200 rounded-lg px-3 py-1.5"
              >
                Remove
              </button>
            </div>

            {/* Rent Paid */}

            <div className="px-4 py-4 border-t border-slate-100 space-y-1">
              <p className="text-sm font-semibold text-slate-700">
                Total Rent Paid
              </p>

              <p className="text-xs text-slate-400">
                During this employment period
              </p>

              <CurrencyInput
                value={rentPaid}
                onChange={(e) => setRentPaid(e.target.value)}
                width="w-full"
                className="mt-2"
              />
            </div>

            {/* HRA Exemption Amount */}

            <div className="px-4 py-4 border-t border-slate-100 space-y-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-slate-700">
                  HRA Exemption Amount
                </p>

                <Info size={13} className="text-slate-400" />
              </div>

              <p className="text-xs text-slate-400">
                We auto-calculate your HRA exemption based on your rent and
                salary details.
              </p>

              <div className="flex items-center gap-3 mt-2">
                <CurrencyInput
                  value={hraExemption || (autoCalc > 0 ? autoCalc : "")}
                  onChange={(e) => setHraExemption(e.target.value)}
                  placeholder={autoCalc > 0 ? String(autoCalc) : "0"}
                  width="flex-1"
                />
              </div>
            </div>
          </div>

          {/* Footer links */}

          <div className="flex items-center gap-4 text-sm font-semibold text-blue-600">
            <button type="button" className="hover:text-blue-700">
              Add HRA Exemption
            </button>

            <span className="text-slate-300">|</span>

            <button
              type="button"
              className="hover:text-blue-700 flex items-center gap-1"
            >
              View More Details <ArrowRight size={12} />
            </button>
          </div>
        </div>

        {/* Action buttons */}

        <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 border border-slate-300 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-md"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

/* â”€â”€â”€ Other Salary Components (collapsible) â”€â”€â”€ */

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

    {
      label: "89A : Foreign Salary Income from notified countries",

      field: "foreignSalaryNotified",

      defaultVal: "",

      hasChevron: true,
    },

    {
      label: "89A : Foreign Salary Income from non-notified countries",

      field: "foreignSalaryNonNotified",

      defaultVal: "",

      hasChevron: false,
    },

    {
      label: "Salary from past years (claimed under 89A)",

      field: "salaryPastYears89A",

      defaultVal: "",

      hasChevron: false,
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
          <p className="text-sm font-bold text-slate-800">
            Other Salary Components
          </p>

          <p className="text-xs text-slate-500 mt-0.5">
            Perks &amp; extra salary (ESOPs, settlement, etc.) â€“ enter only if
            applicable
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-slate-700">
            â‚¹ {total.toLocaleString("en-IN")}
          </span>

          {open ? (
            <ChevronUp size={16} className="text-slate-400" />
          ) : (
            <ChevronDown size={16} className="text-slate-400" />
          )}
        </div>
      </button>

      {/* Rows */}

      {open && (
        <div className="border-t border-slate-100 divide-y divide-slate-100 bg-white">
          {rows.map(({ label, field, defaultVal, hasChevron }) => (
            <div
              key={field}
              className="flex items-center justify-between px-4 py-3.5 gap-4"
            >
              {/* Label + Read More */}

              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-700">{label}</p>

                <span className="text-xs text-blue-500 cursor-pointer hover:underline">
                  Read More
                </span>
              </div>

              {/* â‚¹ input */}

              <CurrencyInput
                value={entry[field] ?? ""}
                onChange={(e) =>
                  updateSalaryEntry(entry.id, field, e.target.value)
                }
                placeholder={defaultVal || ""}
                width="w-48"
              />

              {/* chevron icon for expandable rows */}

              {hasChevron ? (
                <ChevronDown
                  size={16}
                  className="text-slate-400 flex-shrink-0"
                />
              ) : (
                <div className="w-4 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

   QUICK CALC â€” floating dev/test panel

   Toggle with the calculator button (bottom-right).

   Completely independent of the main form state.

â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

const QC_DEFAULTS = {
  regime: "new",

  ageGroup: "general", // general | senior | superSenior

  grossSalary: "",

  stdDeduction: "", // leave blank = auto

  homeLoanInterest: "",

  otherIncome: "",

  sec80C: "",

  sec80D: "",

  nps: "",

  sec80EEA: "",

  stcgEquity: "",

  ltcgEquity: "",
};

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

   HOUSE PROPERTY SECTION

â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

let nextPropId = 0;

const newSelfOccupied = () => ({
  id: ++nextPropId,
  type: "so",

  // address

  sameAsPersonal: false,
  flatDoorNo: "",
  premiseName: "",
  roadStreet: "",

  areaLocality: "",
  pincode: "",
  state: "",
  city: "",
  country: "INDIA",

  // owner

  ownerName: "",
  ownerPAN: "",
  ownerShare: "100",

  hasCoOwner: false,

  coOwners: [{ name: "", pan: "", share: "" }],

  // loan

  loans: [],

  homeLoanDeduction: "0", // derived, shown read-only
});

const newLetOut = () => ({
  id: ++nextPropId,
  type: "lo",

  sameAsPersonal: false,
  flatDoorNo: "",
  premiseName: "",
  roadStreet: "",

  areaLocality: "",
  pincode: "",
  state: "",
  city: "",
  country: "INDIA",

  ownerName: "",
  ownerPAN: "",
  ownerShare: "100",

  hasCoOwner: false,

  coOwners: [{ name: "", pan: "", share: "" }],

  // tenant

  tenants: [{ name: "", panTan: "", aadhaar: "" }],

  // rental income

  rentReceived: "",
  municipalTax: "",

  // loan

  loans: [],

  homeLoanDeduction: "0",
});

let nextLoanId = 0;

const newLoan = () => ({
  id: ++nextLoanId,

  loanFrom: "Bank",
  bankName: "",
  accountNo: "",

  sanctionDate: "",
  loanAmount: "",
  loanOutstanding: "",

  preConstructionInterest: "",
  postConstructionInterest: "",
});

const HousePropertySection = ({ income, setIncome, personal }) => {
  const soList = income.selfOccupiedProps || [];

  const letList = income.letOutProps || [];

  const addSO = () =>
    setIncome((p) => ({
      ...p,
      selfOccupiedProps: [...(p.selfOccupiedProps || []), newSelfOccupied()],
    }));

  const addLet = () =>
    setIncome((p) => ({
      ...p,
      letOutProps: [...(p.letOutProps || []), newLetOut()],
    }));

  const updateSO = (id, patch) =>
    setIncome((p) => ({
      ...p,
      selfOccupiedProps: p.selfOccupiedProps.map((prop) =>
        prop.id === id ? { ...prop, ...patch } : prop,
      ),
    }));

  const updateLet = (id, patch) =>
    setIncome((p) => ({
      ...p,
      letOutProps: p.letOutProps.map((prop) =>
        prop.id === id ? { ...prop, ...patch } : prop,
      ),
    }));

  const removeSO = (id) =>
    setIncome((p) => ({
      ...p,
      selfOccupiedProps: p.selfOccupiedProps.filter((prop) => prop.id !== id),
    }));

  const removeLet = (id) =>
    setIncome((p) => ({
      ...p,
      letOutProps: p.letOutProps.filter((prop) => prop.id !== id),
    }));

  return (
    <div className="space-y-3 mt-2">
      {/* Self Occupied */}

      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3.5 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-lg">
              ðŸ 
            </div>

            <div>
              <p className="text-sm font-bold text-slate-800">
                Self Occupied Properties{" "}
                <span className="text-slate-400 font-normal">
                  (not given on rent)
                </span>
              </p>

              <p className="text-xs text-slate-500">
                Add address, loan interest, owner details etc.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={addSO}
            className="text-xs font-bold text-blue-600 border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50 transition-colors"
          >
            + Add Details
          </button>
        </div>

        {soList.map((prop) => (
          <PropCard
            key={prop.id}
            prop={prop}
            type="so"
            onUpdate={(p) => updateSO(prop.id, p)}
            onRemove={() => removeSO(prop.id)}
            personal={personal}
          />
        ))}
      </div>

      {/* Let Out */}

      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3.5 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-lg">
              ðŸ˜ï¸
            </div>

            <div>
              <p className="text-sm font-bold text-slate-800">
                Properties given on Rent
              </p>

              <p className="text-xs text-slate-500">
                Add rent, address, loan interest, tenant details etc.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={addLet}
            className="text-xs font-bold text-blue-600 border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50 transition-colors"
          >
            + Add Details
          </button>
        </div>

        {letList.map((prop) => (
          <PropCard
            key={prop.id}
            prop={prop}
            type="lo"
            onUpdate={(p) => updateLet(prop.id, p)}
            onRemove={() => removeLet(prop.id)}
            personal={personal}
          />
        ))}
      </div>
    </div>
  );
};

/* Single property card (self-occupied or let-out) */

const PropCard = ({ prop, type, onUpdate, onRemove, personal }) => {
  const [open, setOpen] = useState(true);

  const [showLoanModal, setShowLoanModal] = useState(false);

  const isLetOut = type === "lo";

  // auto-fill address from personal info

  const fillFromPersonal = (checked) => {
    if (checked) {
      onUpdate({
        sameAsPersonal: true,

        flatDoorNo: personal.flatDoorNo,
        premiseName: personal.premiseName,

        roadStreet: personal.roadStreet,
        areaLocality: personal.areaLocality,

        pincode: personal.pincode,
        state: personal.state,

        city: personal.city,
        country: personal.country,
      });
    } else {
      onUpdate({ sameAsPersonal: false });
    }
  };

  const addCoOwner = () =>
    onUpdate({
      coOwners: [...prop.coOwners, { name: "", pan: "", share: "" }],
    });

  const removeCoOwner = (i) =>
    onUpdate({ coOwners: prop.coOwners.filter((_, idx) => idx !== i) });

  const updateCoOwner = (i, field, val) =>
    onUpdate({
      coOwners: prop.coOwners.map((c, idx) =>
        idx === i ? { ...c, [field]: val } : c,
      ),
    });

  const addTenant = () =>
    onUpdate({
      tenants: [...(prop.tenants || []), { name: "", panTan: "", aadhaar: "" }],
    });

  const removeTenant = (i) =>
    onUpdate({ tenants: prop.tenants.filter((_, idx) => idx !== i) });

  const updateTenant = (i, field, val) =>
    onUpdate({
      tenants: prop.tenants.map((t, idx) =>
        idx === i ? { ...t, [field]: val } : t,
      ),
    });

  // Rental income auto-calc

  const rent = toNum(prop.rentReceived);

  const muni = toNum(prop.municipalTax);

  const stdDed = Math.round((rent - muni) * 0.3);

  const loanDed = toNum(prop.homeLoanDeduction);

  const netIncome = rent - muni - stdDed - loanDed;

  return (
    <div className="border-t border-slate-100">
      <div className="flex items-center justify-between px-4 py-3 bg-white">
        <span className="text-sm font-semibold text-slate-700">
          {prop.flatDoorNo ||
            (isLetOut ? "Let-out Property" : "Self-occupied Property")}
        </span>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="text-slate-400 hover:text-slate-600"
          >
            {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>

          <button
            type="button"
            onClick={onRemove}
            className="text-red-400 hover:text-red-600"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {open && (
        <div className="px-4 pb-5 space-y-5 bg-white">
          {/* House Address */}

          <div className="border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <MapPin size={14} className="text-rose-500" />

              <p className="text-sm font-bold text-slate-800">House Address</p>
            </div>

            <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={prop.sameAsPersonal}
                onChange={(e) => fillFromPersonal(e.target.checked)}
                className="w-3.5 h-3.5 text-blue-600 rounded"
              />
              Same as the address filled in Personal Information
            </label>

            <div className="grid grid-cols-2 gap-3">
              <FloatingInput
                label="Flat/Door/Block No.*"
                value={prop.flatDoorNo}
                onChange={(e) => onUpdate({ flatDoorNo: e.target.value })}
                readOnly={prop.sameAsPersonal}
              />

              <FloatingInput
                label="Premise Name"
                value={prop.premiseName}
                onChange={(e) => onUpdate({ premiseName: e.target.value })}
                readOnly={prop.sameAsPersonal}
              />
            </div>

            <FloatingInput
              label="Road/Street"
              value={prop.roadStreet}
              onChange={(e) => onUpdate({ roadStreet: e.target.value })}
              readOnly={prop.sameAsPersonal}
            />

            <div className="grid grid-cols-2 gap-3">
              <FloatingInput
                label="Area/Locality*"
                value={prop.areaLocality}
                onChange={(e) => onUpdate({ areaLocality: e.target.value })}
                readOnly={prop.sameAsPersonal}
              />

              <FloatingInput
                label="Pincode*"
                value={prop.pincode}
                onChange={(e) => onUpdate({ pincode: e.target.value })}
                readOnly={prop.sameAsPersonal}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <FloatingSelect
                label="Country"
                value={prop.country}
                onChange={(e) => onUpdate({ country: e.target.value })}
                options={[{ value: "INDIA", label: "INDIA" }]}
              />

              <FloatingSelect
                label="State"
                value={prop.state}
                onChange={(e) => onUpdate({ state: e.target.value })}
                options={STATE_OPTIONS}
              />

              <FloatingInput
                label="City"
                value={prop.city}
                onChange={(e) => onUpdate({ city: e.target.value })}
                readOnly={prop.sameAsPersonal}
              />
            </div>
          </div>

          {/* Owner Details */}

          <div className="border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-base">ðŸ‘¤</span>

                <p className="text-sm font-bold text-slate-800">
                  Owner Details
                </p>
              </div>

              <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                Your Share: {prop.ownerShare || 100}%
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <FloatingInput
                label="Name of Owner"
                value={prop.ownerName}
                onChange={(e) => onUpdate({ ownerName: e.target.value })}
              />

              <FloatingInput
                label="PAN of Owner"
                value={prop.ownerPAN}
                onChange={(e) =>
                  onUpdate({ ownerPAN: e.target.value.toUpperCase() })
                }
              />

              <FloatingInput
                label="% Share"
                type="number"
                onWheel={(e) => e.target.blur()}
                value={prop.ownerShare}
                onChange={(e) => onUpdate({ ownerShare: e.target.value })}
              />
            </div>

            {/* Co-owner toggle */}

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Does the property have more than one owner?
                </p>

                <p className="text-xs text-slate-500">
                  Enter basic details of your co-owner such as Name, PAN and %
                  share.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-semibold ${!prop.hasCoOwner ? "text-slate-800" : "text-slate-400"}`}
                >
                  No
                </span>

                <button
                  type="button"
                  onClick={() => onUpdate({ hasCoOwner: !prop.hasCoOwner })}
                  className={`relative w-10 h-5 rounded-full transition-colors ${prop.hasCoOwner ? "bg-blue-600" : "bg-slate-300"}`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${prop.hasCoOwner ? "translate-x-5" : "translate-x-0.5"}`}
                  />
                </button>

                <span
                  className={`text-xs font-semibold ${prop.hasCoOwner ? "text-slate-800" : "text-slate-400"}`}
                >
                  Yes
                </span>
              </div>
            </div>

            {prop.hasCoOwner && (
              <div className="space-y-2 pt-2">
                <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 px-1">
                  {["Name of Co-Owner", "PAN of Co-Owner", "% Share", ""].map(
                    (h) => (
                      <p key={h} className="text-xs font-bold text-slate-600">
                        {h}
                      </p>
                    ),
                  )}
                </div>

                {prop.coOwners.map((co, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-center"
                  >
                    <input
                      value={co.name}
                      onChange={(e) => updateCoOwner(i, "name", e.target.value)}
                      placeholder="Co-owner Name"
                      className="border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />

                    <input
                      value={co.pan}
                      onChange={(e) =>
                        updateCoOwner(i, "pan", e.target.value.toUpperCase())
                      }
                      placeholder="PAN"
                      className="border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />

                    <input
                      type="number"
                      onWheel={(e) => e.target.blur()}
                      value={co.share}
                      onChange={(e) =>
                        updateCoOwner(i, "share", e.target.value)
                      }
                      placeholder="%"
                      className="border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />

                    {prop.coOwners.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => removeCoOwner(i)}
                        className="text-red-400 hover:text-red-600 p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    ) : (
                      <div className="w-6" />
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addCoOwner}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 mt-1"
                >
                  <Plus
                    size={11}
                    className="border border-blue-600 rounded-full"
                  />{" "}
                  Add more items
                </button>
              </div>
            )}
          </div>

          {/* Tenant Details â€” let-out only */}

          {isLetOut && (
            <div className="border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base">ðŸ¢</span>

                <p className="text-sm font-bold text-slate-800">
                  Tenant Details
                </p>
              </div>

              <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 px-1">
                {[
                  "Name of Tenant",
                  "PAN/TAN of Tenant",
                  "Aadhaar of Tenant",
                  "",
                ].map((h) => (
                  <p key={h} className="text-xs font-bold text-slate-600">
                    {h}
                  </p>
                ))}
              </div>

              {(prop.tenants || []).map((t, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-center"
                >
                  <input
                    value={t.name}
                    onChange={(e) => updateTenant(i, "name", e.target.value)}
                    placeholder="Tenant Name"
                    className="border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />

                  <input
                    value={t.panTan}
                    onChange={(e) =>
                      updateTenant(i, "panTan", e.target.value.toUpperCase())
                    }
                    placeholder="PAN / TAN"
                    className="border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />

                  <input
                    value={t.aadhaar}
                    onChange={(e) => updateTenant(i, "aadhaar", e.target.value)}
                    placeholder="Aadhaar"
                    className="border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />

                  {(prop.tenants || []).length > 1 ? (
                    <button
                      type="button"
                      onClick={() => removeTenant(i)}
                      className="text-red-400 hover:text-red-600 p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  ) : (
                    <div className="w-6" />
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={addTenant}
                className="text-xs font-semibold text-blue-600 flex items-center gap-1 mt-1"
              >
                <Plus
                  size={11}
                  className="border border-blue-600 rounded-full"
                />{" "}
                Add more items
              </button>
            </div>
          )}

          {/* Rental Income â€” let-out only */}

          {isLetOut && (
            <div className="border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base">ðŸ“‹</span>

                <p className="text-sm font-bold text-slate-800">
                  1. Rental Income and Property Tax Details
                </p>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <p className="text-sm text-slate-700">
                  A. Total Annual Rent Received
                </p>

                <CurrencyInput
                  value={prop.rentReceived}
                  onChange={(e) => onUpdate({ rentReceived: e.target.value })}
                  width="w-44"
                />
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <div>
                  <p className="text-sm text-slate-700">
                    B. Municipal / Property Tax Paid
                  </p>

                  <p className="text-xs text-slate-400">
                    Specifying this reduces your tax liability
                  </p>
                </div>

                <CurrencyInput
                  value={prop.municipalTax}
                  onChange={(e) => onUpdate({ municipalTax: e.target.value })}
                  width="w-44"
                />
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <div>
                  <p className="text-sm text-slate-700">
                    C. Standard Deduction u/s 24a{" "}
                    <span className="text-slate-400">(30% of (A âˆ’ B))</span>
                  </p>

                  <p className="text-xs text-slate-400">
                    This field is auto-calculated
                  </p>
                </div>

                <div className="flex items-center gap-1 border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 w-44">
                  <span className="text-slate-400 text-sm">â‚¹</span>

                  <span className="flex-1 text-sm font-semibold text-slate-600 text-right">
                    {stdDed.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Net Income{" "}
                    <span className="text-slate-400 font-normal">
                      (A âˆ’ B âˆ’ C âˆ’ Loan)
                    </span>
                  </p>

                  <p className="text-xs text-slate-400">
                    This field is auto-calculated
                  </p>
                </div>

                <div className="flex items-center gap-1 border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 w-44">
                  <span className="text-slate-400 text-sm">â‚¹</span>

                  <span
                    className={`flex-1 text-sm font-semibold text-right ${netIncome < 0 ? "text-red-600" : "text-slate-600"}`}
                  >
                    {netIncome.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Home Loan Details */}

          <div className="border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-base">ðŸ¦</span>

                <p className="text-sm font-bold text-slate-800">
                  Home Loan Details
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowLoanModal(true)}
                className="text-xs font-bold text-blue-600 border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50 transition-colors"
              >
                {prop.loans?.length > 0 ? "Edit Loans" : "Add Loan"}
              </button>
            </div>

            {prop.loans?.length > 0 ? (
              <div className="space-y-2">
                {prop.loans.map((l, i) => (
                  <div
                    key={l.id}
                    className="flex justify-between items-center bg-slate-50 rounded-lg px-3 py-2 text-xs"
                  >
                    <span className="text-slate-700 font-semibold">
                      {l.bankName || `Loan ${i + 1}`}
                    </span>

                    <span className="text-slate-600">
                      Deduction: â‚¹
                      {toNum(prop.homeLoanDeduction).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}

                <p className="text-xs text-slate-500 mt-1">
                  Maximum deduction claimable in a FY is â‚¹2,00,000{" "}
                  {isLetOut ? "(uncapped for let-out)" : ""}
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-400">
                No loans added yet. Click Add Loan to enter your home loan
                interest certificate details.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Home Loan Modal */}

      {showLoanModal && (
        <HomeLoanModal
          prop={prop}
          onClose={() => setShowLoanModal(false)}
          onSave={(loans, deduction) => {
            onUpdate({ loans, homeLoanDeduction: String(deduction) });
            setShowLoanModal(false);
          }}
        />
      )}
    </div>
  );
};

/* Home Loan Details Modal */

const HomeLoanModal = ({ prop, onClose, onSave }) => {
  const [loans, setLoans] = useState(
    prop.loans?.length ? prop.loans : [newLoan()],
  );

  const addLoan = () => setLoans((l) => [...l, newLoan()]);

  const removeLoan = (id) => setLoans((l) => l.filter((x) => x.id !== id));

  const updateLoan = (id, patch) =>
    setLoans((l) => l.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  const calcDeduction = (loan) => {
    const pre = toNum(loan.preConstructionInterest);

    const post = toNum(loan.postConstructionInterest);

    return Math.round(pre * 0.2) + post;
  };

  const totalDeduction = Math.min(
    loans.reduce((s, l) => s + calcDeduction(l), 0),
    200_000,
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}

        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-100">
          <div>
            <h2 className="font-extrabold text-slate-900 text-base">
              Home Loan Details
            </h2>

            <p className="text-xs text-slate-500 mt-0.5">
              Enter loan details or upload the home loan interest certificate
              for this house property.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          {loans.map((loan, i) => {
            const ded = calcDeduction(loan);

            return (
              <div
                key={loan.id}
                className="border border-slate-200 rounded-xl overflow-hidden"
              >
                <div className="flex items-center justify-between px-4 py-3 bg-slate-50">
                  <p className="text-sm font-bold text-slate-800">
                    Loan Details {i + 1}
                  </p>

                  {loans.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLoan(loan.id)}
                      className="text-red-400 hover:text-red-600"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>

                <div className="px-4 py-4 space-y-4">
                  {/* Upload strip */}

                  <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-500">ðŸ“„</span>

                      <span className="text-xs text-blue-700 font-semibold">
                        Upload your Loan Interest Certificate to fetch details
                        instantly
                      </span>
                    </div>

                    <button
                      type="button"
                      className="text-xs font-bold text-blue-600 border border-blue-300 rounded-lg px-3 py-1.5 hover:bg-blue-100"
                    >
                      Upload File
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-500 mb-1 block">
                        Loan Taken From
                      </label>

                      <select
                        value={loan.loanFrom}
                        onChange={(e) =>
                          updateLoan(loan.id, { loanFrom: e.target.value })
                        }
                        className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 appearance-none"
                      >
                        {[
                          "Bank",
                          "Housing Finance Co.",
                          "Employer",
                          "Others",
                        ].map((o) => (
                          <option key={o}>{o}</option>
                        ))}
                      </select>
                    </div>

                    <FloatingInput
                      label="Name of Bank / Institution"
                      value={loan.bankName}
                      onChange={(e) =>
                        updateLoan(loan.id, { bankName: e.target.value })
                      }
                    />

                    <FloatingInput
                      label="Loan Account Number"
                      value={loan.accountNo}
                      onChange={(e) =>
                        updateLoan(loan.id, { accountNo: e.target.value })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <FloatingInput
                      label="Date of Sanction"
                      type="date"
                      value={loan.sanctionDate}
                      onChange={(e) =>
                        updateLoan(loan.id, { sanctionDate: e.target.value })
                      }
                    />

                    <FloatingInput
                      label="Total Loan Amount (â‚¹)"
                      type="number"
                      onWheel={(e) => e.target.blur()}
                      value={loan.loanAmount}
                      onChange={(e) =>
                        updateLoan(loan.id, { loanAmount: e.target.value })
                      }
                    />

                    <FloatingInput
                      label="Loan Outstanding (â‚¹)"
                      type="number"
                      onWheel={(e) => e.target.blur()}
                      value={loan.loanOutstanding}
                      onChange={(e) =>
                        updateLoan(loan.id, { loanOutstanding: e.target.value })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <FloatingInput
                        label="A. Interest before construction (â‚¹)"
                        type="number"
                        onWheel={(e) => e.target.blur()}
                        value={loan.preConstructionInterest}
                        onChange={(e) =>
                          updateLoan(loan.id, {
                            preConstructionInterest: e.target.value,
                          })
                        }
                        hint="20% interest eligible for deduction"
                      />
                    </div>

                    <FloatingInput
                      label="B. Interest after construction (â‚¹)"
                      type="number"
                      onWheel={(e) => e.target.blur()}
                      value={loan.postConstructionInterest}
                      onChange={(e) =>
                        updateLoan(loan.id, {
                          postConstructionInterest: e.target.value,
                        })
                      }
                    />

                    <div>
                      <label className="text-xs font-semibold text-slate-500 mb-1 block">
                        Deduction{" "}
                        <span className="font-normal text-slate-400">
                          (20% of A) + B
                        </span>
                      </label>

                      <div className="flex items-center gap-1 border border-slate-200 rounded-lg px-3 py-2.5 bg-slate-50">
                        <span className="text-slate-400 text-sm">â‚¹</span>

                        <span className="flex-1 text-sm font-semibold text-slate-700 text-right">
                          {ded.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <button
            type="button"
            onClick={addLoan}
            className="text-sm font-semibold text-blue-600 flex items-center gap-1 hover:text-blue-700"
          >
            <Plus size={13} className="border border-blue-600 rounded-full" />{" "}
            Add another loan
          </button>
        </div>

        <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-slate-800">
              Total Deduction:{" "}
              <span className="text-blue-700">
                â‚¹{totalDeduction.toLocaleString("en-IN")}
              </span>
            </p>

            <p className="text-xs text-slate-400">
              Maximum deduction claimable in a FY is â‚¹2,00,000
            </p>
          </div>

          <button
            type="button"
            onClick={() => onSave(loans, totalDeduction)}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-md"
          >
            Save & Continue
          </button>
        </div>
      </div>
    </div>
  );
};

const QuickCalc = () => {
  const [open, setOpen] = useState(false);

  const [q, setQ] = useState(QC_DEFAULTS);

  const [copied, setCopied] = useState(false);

  const set = (k, v) => setQ((p) => ({ ...p, [k]: v }));

  const n = (k) => Math.max(0, parseFloat(q[k]) || 0);

  const isSenior = q.ageGroup === "senior";

  const isSuperSenior = q.ageGroup === "superSenior";

  const isResident = true; // quick calc always assumes resident

  // â”€â”€ compute â”€â”€

  const salary = n("grossSalary");

  const autoStd =
    q.regime === "new"
      ? Math.min(salary, STD_DEDUCTION_NEW)
      : Math.min(salary, STD_DEDUCTION_OLD);

  const stdDed =
    q.stdDeduction !== "" ? Math.min(n("stdDeduction"), salary) : autoStd;

  const cappedInterest = Math.min(n("homeLoanInterest"), 200_000);

  const housePropOld = salary > 0 ? -cappedInterest : -cappedInterest; // simplified: self-occupied loss

  const housePropNew = 0;

  const otherInc = n("otherIncome");

  const stcgEquityTax = Math.round(n("stcgEquity") * 0.2 * 1.04);

  const ltcgEquityTax = Math.round(
    Math.max(0, n("ltcgEquity") - 125_000) * 0.125 * 1.04,
  );

  // old regime deductions

  const d80C = Math.min(n("sec80C"), 150_000);

  const d80D = Math.min(n("sec80D"), 50_000);

  const dNPS = Math.min(n("nps"), 50_000);

  const d80EEA = Math.min(n("sec80EEA"), 150_000);

  const oldDeds = d80C + d80D + dNPS + d80EEA;

  const grossOld = salary + Math.max(housePropOld, -200_000) + otherInc;

  const grossNew = salary + housePropNew + otherInc;

  const taxableOld = Math.max(
    0,
    grossOld - stdDed - (q.regime === "old" ? oldDeds : 0),
  );

  const taxableNew = Math.max(0, grossNew - stdDed);

  const taxOld =
    calcTax(
      taxableOld,
      "old",
      isResident,
      taxableOld,
      isSenior,
      isSuperSenior,
    ) +
    stcgEquityTax +
    ltcgEquityTax;

  const taxNew =
    calcTax(taxableNew, "new", isResident, taxableNew) +
    stcgEquityTax +
    ltcgEquityTax;

  const display = q.regime === "old" ? taxOld : taxNew;

  const saving = Math.abs(taxOld - taxNew);

  const better = taxNew <= taxOld ? "New" : "Old";

  const rows = [
    { l: "Gross Income", v: fmt(q.regime === "old" ? grossOld : grossNew) },

    { l: "Standard Deduction", v: `- ${fmt(stdDed)}` },

    ...(q.regime === "old" && oldDeds > 0
      ? [{ l: "Chapter VI-A Deductions", v: `- ${fmt(oldDeds)}` }]
      : []),

    {
      l: "Taxable Income",
      v: fmt(q.regime === "old" ? taxableOld : taxableNew),
      bold: true,
    },

    { l: "Tax (Old Regime)", v: fmt(taxOld) },

    { l: "Tax (New Regime)", v: fmt(taxNew) },

    ...(stcgEquityTax + ltcgEquityTax > 0
      ? [
          {
            l: "Capital Gains Tax (incl. cess)",
            v: fmt(stcgEquityTax + ltcgEquityTax),
          },
        ]
      : []),

    {
      l: `âœ… Tax â€” ${q.regime === "new" ? "New" : "Old"} Regime`,
      v: fmt(display),
      highlight: true,
    },
  ];

  const handleCopy = () => {
    const text = rows.map((r) => `${r.l}: ${r.v}`).join("\n");

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);

      setTimeout(() => setCopied(false), 1800);
    });
  };

  return (
    <>
      {/* Toggle button */}

      <button
        onClick={() => setOpen((o) => !o)}
        title="Quick Tax Calculator"
        className={`fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all

          ${open ? "bg-slate-800 text-white rotate-45" : "bg-blue-600 text-white hover:bg-blue-700"}`}
      >
        {open ? <X size={20} /> : <Calculator size={20} />}
      </button>

      {/* Drawer */}

      {open && (
        <div className="fixed bottom-20 right-6 z-40 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh]">
          {/* Header */}

          <div className="flex items-center justify-between px-4 py-3 bg-slate-900 text-white">
            <div className="flex items-center gap-2">
              <Calculator size={14} />

              <span className="text-sm font-bold">Quick Calc</span>

              <span className="text-[10px] bg-amber-400 text-amber-900 font-bold px-1.5 py-0.5 rounded-full">
                DEV
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setQ(QC_DEFAULTS)}
                title="Reset"
                className="text-slate-400 hover:text-white transition-colors"
              >
                <RefreshCw size={13} />
              </button>

              <button
                onClick={handleCopy}
                title="Copy results"
                className="text-slate-400 hover:text-white transition-colors"
              >
                {copied ? (
                  <CheckCircle2 size={13} className="text-emerald-400" />
                ) : (
                  <span className="text-[11px]">Copy</span>
                )}
              </button>
            </div>
          </div>

          <div className="overflow-y-auto flex-1 px-3 py-3 space-y-4">
            {/* Regime + Age */}

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide block mb-1">
                  Regime
                </label>

                <select
                  value={q.regime}
                  onChange={(e) => set("regime", e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 appearance-none"
                >
                  <option value="new">New</option>

                  <option value="old">Old</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide block mb-1">
                  Age group
                </label>

                <select
                  value={q.ageGroup}
                  onChange={(e) => set("ageGroup", e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 appearance-none"
                >
                  <option value="general">General (&lt;60)</option>

                  <option value="senior">Senior (60â€“79)</option>

                  <option value="superSenior">Super Sr (80+)</option>
                </select>
              </div>
            </div>

            {/* Income inputs */}

            <div className="space-y-2.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Income
              </p>

              <QInput
                label="Gross Salary (after exemptions)"
                fieldKey="grossSalary"
                q={q}
                set={set}
              />

              <QInput
                label="Std Deduction override"
                fieldKey="stdDeduction"
                hint={`Leave blank = auto (â‚¹${autoStd.toLocaleString("en-IN")})`}
                q={q}
                set={set}
              />

              <QInput
                label="Home Loan Interest (self-occ)"
                fieldKey="homeLoanInterest"
                hint="Old regime: capped â‚¹2L; not applied in new"
                q={q}
                set={set}
              />

              <QInput
                label="Other Income (FD, dividendsâ€¦)"
                fieldKey="otherIncome"
                q={q}
                set={set}
              />

              <QInput
                label="STCG â€” Equity (20%)"
                fieldKey="stcgEquity"
                q={q}
                set={set}
              />

              <QInput
                label="LTCG â€” Equity (12.5%, above â‚¹1.25L)"
                fieldKey="ltcgEquity"
                q={q}
                set={set}
              />
            </div>

            {/* Old-regime deduction inputs â€” only shown for old regime */}

            {q.regime === "old" && (
              <div className="space-y-2.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Deductions (Old Regime)
                </p>

                <QInput
                  label="80C (max â‚¹1.5L)"
                  fieldKey="sec80C"
                  q={q}
                  set={set}
                />

                <QInput
                  label="80D (max â‚¹50K shown)"
                  fieldKey="sec80D"
                  q={q}
                  set={set}
                />

                <QInput
                  label="NPS 80CCD(1B) (max â‚¹50K)"
                  fieldKey="nps"
                  q={q}
                  set={set}
                />

                <QInput
                  label="80EEA Home Loan (max â‚¹1.5L)"
                  fieldKey="sec80EEA"
                  q={q}
                  set={set}
                />
              </div>
            )}

            {/* Live result */}

            <div className="bg-slate-50 rounded-xl px-3 py-2 space-y-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                Breakdown
              </p>

              {rows.map((r) => (
                <QRow key={r.l} {...r} />
              ))}
            </div>

            {/* Better regime tip */}

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 flex items-start gap-2">
              <CheckCircle2
                size={13}
                className="text-emerald-500 mt-0.5 flex-shrink-0"
              />

              <p className="text-xs text-emerald-800">
                <strong>{better} Regime</strong> saves{" "}
                <strong>{fmt(saving)}</strong>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

   TEST DATA â€” fill the whole form in one click

   Only visible when import.meta.env.DEV === true

â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

const INCOME_DEFAULTS = {
  hasSalary: false,
  hasHouseProperty: false,
  selfOccupiedProps: [],
  letOutProps: [],

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
  interestP2P: "",

  interestBonds: "",
  interestPF: "",
  interestITRefund: "",
  dividends: [],
  otherIncome: [],

  hasExemptOther: false,
  onlineGaming: "",
  lotteryWinnings: "",
  exemptIncome: "",
  invoiceDiscounting: "",

  tdsSalary: "",
  tdsNonSalary: [],
  advanceTax: "",
  tcsPaid: "",
  selfTaxPayments: [],
  tdsProperty: [],
};

const TEST_SCENARIOS = [
  {
    label: "Salaried â€“ New Regime",

    personal: {
      firstName: "Ravi",
      middleName: "",
      lastName: "Sharma",
      dob: "1988-07-15",
      fatherName: "Mohan Sharma",
      gender: "M",
      maritalStatus: "married",
      flatDoorNo: "12B",
      premiseName: "Sunshine Apts",
      roadStreet: "MG Road",
      areaLocality: "Koramangala",
      pincode: "560034",
      country: "INDIA",
      state: "KARNATAKA",
      city: "Bengaluru",
      residentialStatus: "Indian Resident",
      aadhaar: "234567890123",
      pan: "ABCDE1234F",
      mobileCountry: "+91",
      mobile: "9876543210",
      email: "ravi.sharma@email.com",
    },

    bankAccounts: [
      {
        accountNumber: "12345678901",
        ifsc: "SBIN0001234",
        bankName: "State Bank of India",
        accountType: "savings",
      },
    ],

    salaryEntry: {
      employerName: "Infosys Ltd",
      employerTAN: "BLRI12345A",
      grossSalary17: "1200000",
      basicPay: "",
      hra17: "",
      lta17: "",
      others17: "",
      perquisites: "",
      profitsInLieu: "",
      hraExemption: "",
      ltaExemption: "",
      rentPaid: "",
      metroCity: false,
      foreignSalaryNotified: "",
      foreignSalaryNonNotified: "",
      salaryPastYears89A: "",
    },

    income: {
      ...INCOME_DEFAULTS,
      hasSalary: true,
      hasOtherIncome: true,
      interestSavings: "15000",
      interestFD: "20000",
      tdsSalary: "85000",
    },

    taxSaving: {
      regime: "new",
      professionalTax: "2400",
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
      employerNps: "60000",
      homeLoan80EEA: "",
    },
  },

  {
    label: "Salaried â€“ Old Regime",

    personal: {
      firstName: "Priya",
      middleName: "K",
      lastName: "Iyer",
      dob: "1985-03-22",
      fatherName: "Krishnan Iyer",
      gender: "F",
      maritalStatus: "married",
      flatDoorNo: "5A",
      premiseName: "Green Park",
      roadStreet: "Anna Salai",
      areaLocality: "T Nagar",
      pincode: "600017",
      country: "INDIA",
      state: "TAMIL NADU",
      city: "Chennai",
      residentialStatus: "Indian Resident",
      aadhaar: "456789012345",
      pan: "BCDEF2345G",
      mobileCountry: "+91",
      mobile: "9123456780",
      email: "priya.iyer@email.com",
    },

    bankAccounts: [
      {
        accountNumber: "98765432100",
        ifsc: "HDFC0001234",
        bankName: "HDFC Bank",
        accountType: "savings",
      },
    ],

    salaryEntry: {
      employerName: "TCS Ltd",
      employerTAN: "MAAI12345B",
      grossSalary17: "",
      basicPay: "800000",
      hra17: "300000",
      lta17: "50000",
      others17: "50000",
      perquisites: "",
      profitsInLieu: "",
      hraExemption: "120000",
      ltaExemption: "25000",
      rentPaid: "180000",
      metroCity: true,
      foreignSalaryNotified: "",
      foreignSalaryNonNotified: "",
      salaryPastYears89A: "",
    },

    income: {
      ...INCOME_DEFAULTS,
      hasSalary: true,
      hasCapitalGains: true,
      stcgEquity: "50000",
      ltcgEquity: "200000",
      hasOtherIncome: true,
      interestSavings: "8000",
      interestFD: "30000",
      dividends: [
        {
          narration: "Infosys Dividend",
          amount: "5000",
          dateOfReceipt: "2026-09-15",
        },
      ],
      tdsSalary: "120000",
      tdsNonSalary: [
        { deductorName: "HDFC Bank", tan: "PUNE12345A", amount: "1997" },
      ],
    },

    taxSaving: {
      regime: "old",
      professionalTax: "2400",
      arrearsRelief: "",
      foreignRetirementRelief: "",
      sec80C: "150000",
      sec80D_self: "25000",
      sec80D_parents: "25000",
      sec80D_selfSenior: false,
      sec80D_parentsSenior: false,
      sec80E: "",
      sec80G: "10000",
      sec80TTA: "8000",
      sec80TTB: "",
      nps80CCD: "50000",
      employerNps: "",
      homeLoan80EEA: "",
    },
  },

  {
    label: "Senior Citizen â€“ Old Regime",

    personal: {
      firstName: "Suresh",
      middleName: "",
      lastName: "Mehta",
      dob: "1958-11-05",
      fatherName: "Ramesh Mehta",
      gender: "M",
      maritalStatus: "married",
      flatDoorNo: "8C",
      premiseName: "Silver Oaks",
      roadStreet: "Linking Road",
      areaLocality: "Bandra West",
      pincode: "400050",
      country: "INDIA",
      state: "MAHARASHTRA",
      city: "Mumbai",
      residentialStatus: "Indian Resident",
      aadhaar: "678901234567",
      pan: "CDEFG3456H",
      mobileCountry: "+91",
      mobile: "9988776655",
      email: "suresh.mehta@email.com",
    },

    bankAccounts: [
      {
        accountNumber: "11223344556",
        ifsc: "ICIC0001234",
        bankName: "ICICI Bank",
        accountType: "savings",
      },
    ],

    salaryEntry: {
      employerName: "Retired â€“ Pension",
      employerTAN: "",
      grossSalary17: "600000",
      basicPay: "",
      hra17: "",
      lta17: "",
      others17: "",
      perquisites: "",
      profitsInLieu: "",
      hraExemption: "",
      ltaExemption: "",
      rentPaid: "",
      metroCity: false,
      foreignSalaryNotified: "",
      foreignSalaryNonNotified: "",
      salaryPastYears89A: "",
    },

    income: {
      ...INCOME_DEFAULTS,
      hasSalary: true,
      hasOtherIncome: true,
      interestSavings: "40000",
      interestFD: "120000",
      dividends: [
        {
          narration: "SBI Dividend",
          amount: "10000",
          dateOfReceipt: "2026-11-20",
        },
      ],
      tdsSalary: "30000",
      tdsNonSalary: [
        { deductorName: "EPFO", tan: "THNE12345B", amount: "12000" },
      ],
    },

    taxSaving: {
      regime: "old",
      professionalTax: "",
      arrearsRelief: "",
      foreignRetirementRelief: "",
      sec80C: "100000",
      sec80D_self: "50000",
      sec80D_parents: "",
      sec80D_selfSenior: true,
      sec80D_parentsSenior: false,
      sec80E: "",
      sec80G: "",
      sec80TTA: "",
      sec80TTB: "50000",
      nps80CCD: "",
      employerNps: "",
      homeLoan80EEA: "",
    },
  },
];

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

   MAIN COMPONENT

/* â”€â”€â”€ Deduction Card â€” collapsible card for old-regime deduction groups â”€â”€â”€ */
const DeductionCard = ({ emoji, title, subtitle, total, children }) => {
  const [open, setOpen] = useState(false);
  const hasValue = total > 0;
  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-slate-50/60 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xl flex-shrink-0">
            {emoji}
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-slate-900">{title}</p>
            <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 ml-4 flex-shrink-0">
          {hasValue && <span className="text-sm font-bold text-emerald-600">- â‚¹{total.toLocaleString("en-IN")}</span>}
          {open ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
        </div>
      </button>
      {open && (
        <div className="px-5 pb-5 pt-3 border-t border-slate-100 bg-white space-y-4">
          {children}
        </div>
      )}
    </div>
  );
};

/* â”€â”€â”€ Step 0: Personal Info â”€â”€â”€ */
const Step0PersonalInfo = ({
  personal,
  handlePersonal,
  errors,
  bankAccounts,
  addBankAccount,
  removeBankAccount,
  updateBankAccount,
  showResidentialModal,
  setShowResidentialModal,
  setPersonal,
  setErrors,
}) => (
  <div>
    {/* Permanent Information */}
    <FormSection
      icon={<User size={16} />}
      title="Permanent Information"
      subtitle="Please provide all info as per your government identity documents (PAN, Aadhaar etc.)"
      badge={
        personal.firstName && personal.dob && personal.fatherName
          ? "Details Added"
          : undefined
      }
    >
      <div className="mt-4 space-y-5">
        {/* Name row */}
        <div>
          <p className="text-sm font-semibold text-slate-700 mb-3">
            Name <span className="text-red-500">*</span>
          </p>
          <div className="grid grid-cols-3 gap-3">
            <FloatingInput
              label="First Name"
              name="firstName"
              value={personal.firstName}
              onChange={handlePersonal}
              required
              error={errors.firstName}
            />
            <FloatingInput
              label="Middle Name"
              name="middleName"
              value={personal.middleName}
              onChange={handlePersonal}
            />
            <FloatingInput
              label="Last Name"
              name="lastName"
              value={personal.lastName}
              onChange={handlePersonal}
            />
          </div>
          <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-2">
            <Info size={10} /> Name should be as per the PAN; 5th
            character of PAN no. is the first letter of the last name
          </p>
        </div>
        {/* DOB */}
        <div>
          <p className="text-sm font-semibold text-slate-700 mb-2">
            Date of Birth <span className="text-red-500">*</span>
          </p>
          <FloatingInput
            label="DD/MM/YYYY"
            name="dob"
            type="date"
            value={personal.dob}
            onChange={handlePersonal}
            required
            hint="Specify date in a format like DD/MM/YYYY"
            error={errors.dob}
          />
        </div>
        {/* Father's name */}
        <div>
          <p className="text-sm font-semibold text-slate-700 mb-2">
            Father's Name <span className="text-red-500">*</span>
          </p>
          <FloatingInput
            label="Father's Name"
            name="fatherName"
            value={personal.fatherName}
            onChange={handlePersonal}
            required
            error={errors.fatherName}
          />
        </div>
        {/* Gender + Marital status */}
        <div className="grid grid-cols-2 gap-4">
          <FloatingSelect
            label="Gender"
            name="gender"
            value={personal.gender}
            onChange={handlePersonal}
            options={[
              { value: "M", label: "Male" },
              { value: "F", label: "Female" },
              { value: "O", label: "Other" },
            ]}
          />
          <FloatingSelect
            label="Marital Status"
            name="maritalStatus"
            value={personal.maritalStatus}
            onChange={handlePersonal}
            options={[
              { value: "single", label: "Single" },
              { value: "married", label: "Married" },
            ]}
          />
        </div>
      </div>
    </FormSection>

    {/* Identification & Contact */}
    <FormSection
      icon={
        <CreditCard
          size={16}
          className="text-rose-500"
          style={{ color: "#f87171" }}
        />
      }
      title="Identification & Contact details"
      subtitle="To e-file your returns, please provide your Aadhaar, PAN and contact details."
      badge={
        personal.aadhaar &&
        personal.pan &&
        personal.mobile &&
        personal.email
          ? "Details Added"
          : undefined
      }
    >
      <div className="mt-4 space-y-4">
        <div>
          <p className="text-sm font-semibold text-slate-700 mb-2">
            Aadhaar Details <span className="text-red-500">*</span>
          </p>
          <FloatingInput
            label="Aadhaar Number"
            name="aadhaar"
            value={personal.aadhaar}
            onChange={handlePersonal}
            required
            error={errors.aadhaar}
          />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-700 mb-2">
            PAN <span className="text-red-500">*</span>
          </p>
          <FloatingInput
            label="PAN"
            name="pan"
            value={personal.pan}
            onChange={(e) =>
              handlePersonal({
                target: {
                  name: "pan",
                  value: e.target.value.toUpperCase(),
                },
              })
            }
            required
            error={errors.pan}
          />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-700 mb-2">
            Mobile No <span className="text-red-500">*</span>
          </p>
          <div className="flex gap-2">
            <div className="w-24">
              <FloatingSelect
                label="Code"
                name="mobileCountry"
                value={personal.mobileCountry}
                onChange={handlePersonal}
                options={[{ value: "+91", label: "+91" }]}
              />
            </div>
            <div className="flex-1">
              <FloatingInput
                label="Mobile Number"
                name="mobile"
                value={personal.mobile}
                onChange={handlePersonal}
                required
                error={errors.mobile}
              />
            </div>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-700 mb-2">
            Email <span className="text-red-500">*</span>
          </p>
          <FloatingInput
            label="Email"
            name="email"
            type="email"
            value={personal.email}
            onChange={handlePersonal}
            required
            error={errors.email}
          />
        </div>
      </div>
    </FormSection>

    {/* Bank Details */}
    <FormSection
      icon={<Building2 size={16} />}
      title="Bank Details"
      subtitle="Provide bank account details. In case of multiple accounts, First account will be selected as eligible for refund. Note: To receive your refund into an account it must be added and verified in the Income Tax portal."
      badge={
        bankAccounts[0]?.accountNumber && bankAccounts[0]?.ifsc
          ? "Details Added"
          : undefined
      }
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
          {[
            "Account Number",
            "IFSC Code â“˜",
            "Bank Name",
            "Account Type",
            "",
          ].map((h) => (
            <p key={h} className="text-xs font-bold text-slate-700">
              {h}
            </p>
          ))}
        </div>
        {/* Account rows */}
        <div className="space-y-3">
          {bankAccounts.map((acc, i) => (
            <div
              key={i}
              className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-3 items-start"
            >
              <input
                type="text"
                value={acc.accountNumber}
                onChange={(e) =>
                  updateBankAccount(i, "accountNumber", e.target.value)
                }
                placeholder="Account Number"
                className="border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
              />
              <input
                type="text"
                value={acc.ifsc}
                onChange={(e) =>
                  updateBankAccount(i, "ifsc", e.target.value.toUpperCase())
                }
                placeholder="e.g. SBIN0001234"
                className="border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
              />
              <input
                type="text"
                value={acc.bankName}
                onChange={(e) =>
                  updateBankAccount(i, "bankName", e.target.value)
                }
                placeholder="Bank Name"
                className="border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
              />
              <select
                value={acc.accountType}
                onChange={(e) =>
                  updateBankAccount(i, "accountType", e.target.value)
                }
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
              ) : (
                <div className="w-8" />
              )}
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
      badge={
        personal.flatDoorNo &&
        personal.areaLocality &&
        personal.pincode &&
        personal.state &&
        personal.city
          ? "Details Added"
          : undefined
      }
    >
      <div className="mt-4 space-y-4">
        <FloatingInput
          label="Flat / Door No"
          name="flatDoorNo"
          value={personal.flatDoorNo}
          onChange={handlePersonal}
          required
          error={errors.flatDoorNo}
        />
        <FloatingInput
          label="Premise Name"
          name="premiseName"
          value={personal.premiseName}
          onChange={handlePersonal}
        />
        <FloatingInput
          label="Road / Street"
          name="roadStreet"
          value={personal.roadStreet}
          onChange={handlePersonal}
        />
        <FloatingInput
          label="Area Locality"
          name="areaLocality"
          value={personal.areaLocality}
          onChange={handlePersonal}
          required
          error={errors.areaLocality}
        />
        <FloatingInput
          label="Pincode / ZipCode"
          name="pincode"
          value={personal.pincode}
          onChange={handlePersonal}
          required
          error={errors.pincode}
          hint="6-digit pincode"
        />
        <div>
          <p className="text-sm font-semibold text-slate-700 mb-3">
            Country | State | City{" "}
            <span className="text-red-500">*</span>
          </p>
          <div className="grid grid-cols-3 gap-3">
            <FloatingSelect
              label="Country"
              name="country"
              value={personal.country}
              onChange={handlePersonal}
              options={[{ value: "INDIA", label: "INDIA" }]}
            />
            <FloatingSelect
              label="State"
              name="state"
              value={personal.state}
              onChange={handlePersonal}
              required
              error={errors.state}
              options={STATE_OPTIONS}
            />
            <FloatingInput
              label="City"
              name="city"
              value={personal.city}
              onChange={handlePersonal}
              required
              error={errors.city}
            />
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
            <p className="text-xs text-slate-500 mb-2">
              Your residential status
            </p>
            <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5">
              <span className="font-bold text-slate-800 text-sm">
                {personal.residentialStatus}
              </span>
              <button
                type="button"
                onClick={() => setShowResidentialModal(true)}
                className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
              >
                Change Residential Status <ArrowRight size={13} />
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Status selected for Tax Year 2026-27 (April 2026 to March 2027).
            </p>
            {errors.residentialStatus && (
              <p className="text-xs text-red-500 mt-2">
                {errors.residentialStatus}
              </p>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-start gap-3">
            <p className="text-sm text-slate-600">
              Your residential status hasn't been set yet. Click below
              to determine it based on your days of stay in India.
            </p>
            <button
              type="button"
              onClick={() => setShowResidentialModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-sm"
            >
              <UserCircle2 size={15} />
              Determine Residential Status
            </button>
            {errors.residentialStatus && (
              <p className="text-xs text-red-500">
                {errors.residentialStatus}
              </p>
            )}
          </div>
        )}
      </div>
    </FormSection>
  </div>
);

/* â”€â”€â”€ Step 1: Income Sources â”€â”€â”€ */
const Step1IncomeSources = ({
  income,
  handleIncome,
  setIncome,
  salaryEntries,
  editingSalaryId,
  setEditingSalaryId,
  addSalaryEntry,
  removeSalaryEntry,
  updateSalaryEntry,
  hraModalEntryId,
  setHraModalEntryId,
  taxSaving,
  personal,
}) => (
  <div>
    <p className="text-xs text-slate-500 mb-5 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-center gap-2">
      <Info size={14} className="text-blue-500 flex-shrink-0" />
      Select all income sources that apply. Only fill what's relevant
      â€” leave the rest blank.
    </p>

    {/* Salary */}
    <FormSection
      icon={<Briefcase size={16} />}
      title="Salary Income"
      subtitle="Add details manually or Upload Form 16 to auto-fill your salary details. You can add salary income from multiple jobs as well."
      badge={
        income.hasSalary && salaryEntries.some((e) => e.employerName)
          ? "Details Added"
          : undefined
      }
      defaultOpen={true}
    >
      {/* Section-level action buttons */}
      <div className="flex items-center justify-end gap-3 mt-3 mb-4">
        <label className="flex items-center gap-3 cursor-pointer mr-auto">
          <input
            type="checkbox"
            name="hasSalary"
            checked={income.hasSalary}
            onChange={handleIncome}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <span className="text-sm font-semibold text-slate-700">
            I have salary / pension income
          </span>
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
            const s171 =
              toNum(entry.basicPay) +
              toNum(entry.hra17) +
              toNum(entry.lta17) +
              toNum(entry.others17);
            const s172 = toNum(entry.perquisites);
            const s173 = toNum(entry.profitsInLieu);

            return (
              <div
                key={entry.id}
                className="border border-slate-200 rounded-xl overflow-hidden"
              >
                {/* Collapsed row */}
                <div className="flex items-center justify-between px-4 py-3 bg-slate-50">
                  <span className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                    {entry.employerName || "New Employer"}
                  </span>
                  <div className="flex items-center gap-4">
                    {total > 0 && (
                      <span className="text-sm font-bold text-slate-800">
                        â‚¹{total.toLocaleString("en-IN")}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        setEditingSalaryId(isEditing ? null : entry.id)
                      }
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
                      onClick={() =>
                        setEditingSalaryId(isEditing ? null : entry.id)
                      }
                      className="text-slate-400 hover:text-slate-600"
                    >
                      {isEditing ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
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
                        onChange={(e) =>
                          updateSalaryEntry(entry.id, "employerName", e.target.value)
                        }
                      />
                      <FloatingInput
                        label="Employer TAN (optional)"
                        value={entry.employerTAN}
                        onChange={(e) =>
                          updateSalaryEntry(entry.id, "employerTAN", e.target.value.toUpperCase())
                        }
                        hint="10-digit TAN as per Form 16"
                      />
                    </div>

                    {/* Taxable Salary bar */}
                    <div className="flex items-center justify-between bg-slate-100 border border-slate-200 rounded-xl px-4 py-3">
                      <span className="text-sm font-bold text-slate-700">
                        Taxable Salary
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">
                          {total > 0 ? `â‚¹${total.toLocaleString("en-IN")}` : "â€”"}
                        </span>
                        <ChevronDown size={14} className="text-slate-400" />
                      </div>
                    </div>

                    {/* 1. Gross Salary â€” 17(1) */}
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      {/* Section header */}
                      <div className="flex items-center justify-between px-4 py-3 bg-white">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-rose-50 flex items-center justify-center flex-shrink-0">
                            <User size={13} className="text-rose-400" />
                          </div>
                          <span className="text-sm font-bold text-slate-800">
                            1. Gross Salary
                          </span>
                          <span className="text-xs text-blue-500 cursor-pointer hover:underline">
                            Read More
                          </span>
                        </div>
                        <span className="text-sm font-bold text-slate-800">
                          {s171 > 0 ? `â‚¹${s171.toLocaleString("en-IN")}` : "â€”"}
                        </span>
                      </div>

                      {/* 17(1) row â€” single total input + breakup toggle */}
                      <div className="border-t border-slate-100 px-4 py-3 bg-white space-y-3">
                        <div className="flex items-center justify-between gap-4">
                          <div className="min-w-0">
                            <span className="text-xs text-slate-600 font-medium">
                              17(1) : Basic, HRA, LTA &amp; other allowances
                            </span>
                            <span className="text-xs text-blue-500 ml-2 cursor-pointer hover:underline">
                              Read More
                            </span>
                          </div>
                          <CurrencyInput
                            value={entry.grossSalary17 || ""}
                            onChange={(e) =>
                              updateSalaryEntry(entry.id, "grossSalary17", e.target.value)
                            }
                            placeholder="Enter total"
                            width="w-48"
                          />
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Enter total or use the breakup below to split into components.
                        </p>

                        {/* Salary Breakup card */}
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <p className="text-sm font-bold text-slate-800">
                                Salary Breakup
                              </p>
                              <p className="text-xs text-slate-500">
                                You may edit the amounts or add other components if needed.
                              </p>
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

                          {/* Full-width rows */}
                          <div className="space-y-0 divide-y divide-slate-200">
                            {[
                              { label: "Basic Pay", field: "basicPay" },
                              { label: "House Rent Allowance", field: "hra17" },
                              { label: "LTA Allowance", field: "lta17" },
                              { label: "Others", field: "others17" },
                            ].map(({ label, field }) => (
                              <div
                                key={field}
                                className="flex items-center justify-between py-2.5 gap-4"
                              >
                                <span className="text-xs text-slate-600 flex-1 min-w-0">
                                  {label}
                                </span>
                                <div className="flex items-center gap-1.5 border border-slate-300 rounded-lg px-3 py-1.5 bg-white w-44 flex-shrink-0">
                                  <span className="text-slate-400 text-xs flex-shrink-0">â‚¹</span>
                                  <input
                                    type="number"
                                    onWheel={(e) => e.target.blur()}
                                    value={entry[field]}
                                    onChange={(e) =>
                                      updateSalaryEntry(entry.id, field, e.target.value)
                                    }
                                    placeholder="0"
                                    className="flex-1 text-sm font-semibold text-slate-800 bg-transparent border-none outline-none text-right min-w-0"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                          <button
                            type="button"
                            className="mt-3 text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                          >
                            Edit Breakup <ArrowRight size={11} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* 2. Exempt Allowances â€” HRA, LTA */}
                    <ExemptAllowances
                      entry={entry}
                      updateSalaryEntry={updateSalaryEntry}
                      onOpenHRA={() => setHraModalEntryId(entry.id)}
                    />

                    {/* 3. Perquisites 17(2) */}
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3 bg-white">
                        <div>
                          <span className="text-sm font-bold text-slate-800">
                            2. Perquisites u/s 17(2)
                          </span>
                          <span className="text-xs text-blue-500 ml-2 cursor-pointer hover:underline">
                            Read More
                          </span>
                        </div>
                        <span className="text-sm font-bold text-slate-800">
                          {s172 > 0 ? `â‚¹${s172.toLocaleString("en-IN")}` : "â€”"}
                        </span>
                      </div>
                      <div className="border-t border-slate-100 px-4 py-3 bg-white">
                        <p className="text-xs text-slate-500 mb-3">
                          Value of perquisites under section 17(2) â€” as per Form No. 12BA, wherever applicable
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-600">
                            17(2) : Employer perks (car, ESOPs, etc.)
                          </span>
                          <CurrencyInput
                            value={entry.perquisites}
                            onChange={(e) =>
                              updateSalaryEntry(entry.id, "perquisites", e.target.value)
                            }
                            width="w-44"
                          />
                        </div>
                      </div>
                    </div>

                    {/* 3. Profits in lieu 17(3) */}
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3 bg-white">
                        <div>
                          <span className="text-sm font-bold text-slate-800">
                            3. Profits in lieu of salary u/s 17(3)
                          </span>
                          <span className="text-xs text-blue-500 ml-2 cursor-pointer hover:underline">
                            Read More
                          </span>
                        </div>
                        <span className="text-sm font-bold text-slate-800">
                          {s173 > 0 ? `â‚¹${s173.toLocaleString("en-IN")}` : "â€”"}
                        </span>
                      </div>
                      <div className="border-t border-slate-100 px-4 py-3 bg-white">
                        <p className="text-xs text-slate-500 mb-3">
                          Profits in lieu of salary under section 17(3) â€” as per Form No. 12BA, wherever applicable
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-600">
                            17(3) : Settlement, Bonus, extra salary, etc.
                          </span>
                          <CurrencyInput
                            value={entry.profitsInLieu}
                            onChange={(e) =>
                              updateSalaryEntry(entry.id, "profitsInLieu", e.target.value)
                            }
                            width="w-44"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Other Salary Components */}
                    <OtherSalaryComponents
                      entry={entry}
                      updateSalaryEntry={updateSalaryEntry}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </FormSection>

    {/* HRA Exemption Modal â€” rendered outside the map */}
    {hraModalEntryId &&
      (() => {
        const entry = salaryEntries.find((e) => e.id === hraModalEntryId);
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
    <FormSection
      icon={<Home size={16} />}
      title="House Property"
      subtitle="Add details if you earned rent from your property or paid interest on home loan"
      badge={
        income.hasHouseProperty &&
        (income.selfOccupiedProps?.length > 0 || income.letOutProps?.length > 0)
          ? "Details Added"
          : undefined
      }
    >
      <div className="mt-3 mb-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="hasHouseProperty"
            checked={income.hasHouseProperty}
            onChange={handleIncome}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <span className="text-sm font-semibold text-slate-700">
            I have house property income / loss
          </span>
        </label>
      </div>
      {income.hasHouseProperty && (
        <HousePropertySection income={income} setIncome={setIncome} personal={personal} />
      )}
    </FormSection>

    {/* Capital Gains */}
    <FormSection
      icon={<TrendingUp size={16} />}
      title="Capital Gains"
      subtitle="Stocks, Mutual Funds, Property, F&O"
    >
      <div className="mt-3 mb-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="hasCapitalGains"
            checked={income.hasCapitalGains}
            onChange={handleIncome}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <span className="text-sm font-semibold text-slate-700">
            I have capital gains / losses
          </span>
        </label>
      </div>
      {income.hasCapitalGains && (
        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <FloatingInput
              label="STCG â€” listed equity / equity MF (20%)"
              name="stcgEquity"
              type="number"
              onWheel={(e) => e.target.blur()}
              value={income.stcgEquity}
              onChange={handleIncome}
            />
            <FloatingInput
              label="LTCG â€” listed equity / equity MF (12.5%)"
              name="ltcgEquity"
              type="number"
              onWheel={(e) => e.target.blur()}
              value={income.ltcgEquity}
              onChange={handleIncome}
              hint="Aggregate eligible gains above â‚¹1.25L taxable"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FloatingInput
              label="STCG â€” other assets (slab rate)"
              name="stcgOther"
              type="number"
              onWheel={(e) => e.target.blur()}
              value={income.stcgOther}
              onChange={handleIncome}
            />
            <FloatingInput
              label="LTCG â€” other assets (12.5%)*"
              name="ltcgOther"
              type="number"
              onWheel={(e) => e.target.blur()}
              value={income.ltcgOther}
              onChange={handleIncome}
              hint="Rate and eligibility vary by asset and acquisition date"
            />
          </div>
        </div>
      )}
    </FormSection>

    {/* Other income */}
    <FormSection
      icon={<PiggyBank size={16} />}
      title="Other Income"
      subtitle="Interest, dividends, freelance, gifts etc."
    >
      <div className="mt-3 mb-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="hasOtherIncome"
            checked={income.hasOtherIncome}
            onChange={handleIncome}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <span className="text-sm font-semibold text-slate-700">
            I have other income
          </span>
        </label>
      </div>
      {income.hasOtherIncome && (
        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <FloatingInput
              label="Interest â€” Savings A/c (â‚¹)"
              name="interestSavings"
              type="number"
              onWheel={(e) => e.target.blur()}
              value={income.interestSavings}
              onChange={handleIncome}
              hint="Banks + Post Office savings accounts"
            />
            <FloatingInput
              label="Interest â€” FD / RD (â‚¹)"
              name="interestFD"
              type="number"
              onWheel={(e) => e.target.blur()}
              value={income.interestFD}
              onChange={handleIncome}
              hint="Fixed & Recurring Deposits incl. Post Office FDs"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FloatingInput
              label="Interest â€” P2P Lending (â‚¹)"
              name="interestP2P"
              type="number"
              onWheel={(e) => e.target.blur()}
              value={income.interestP2P}
              onChange={handleIncome}
              hint="CredMint, 12% Club, LendBox, IndiaP2P etc."
            />
            <FloatingInput
              label="Interest â€” Bond Investments (â‚¹)"
              name="interestBonds"
              type="number"
              onWheel={(e) => e.target.blur()}
              value={income.interestBonds}
              onChange={handleIncome}
              hint="Grip, Jiraaf, WintWealth, GoldenPi etc."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FloatingInput
              label="Interest â€” Provident Fund (â‚¹)"
              name="interestPF"
              type="number"
              onWheel={(e) => e.target.blur()}
              value={income.interestPF}
              onChange={handleIncome}
              hint="EPF / RPF interest (taxable portion above threshold)"
            />
            <FloatingInput
              label="Interest â€” IT Refund (â‚¹)"
              name="interestITRefund"
              type="number"
              onWheel={(e) => e.target.blur()}
              value={income.interestITRefund}
              onChange={handleIncome}
              hint="Interest received along with last year's tax refund"
            />
          </div>
          <div className="space-y-3">
            {/* Dividends â€” row table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-slate-50">
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    Dividend Income from Equities, Stocks, Mutual Funds etc.
                  </p>
                  <p className="text-xs text-slate-500">
                    You may see dividend details in your Form 26AS or P&L Reports (e.g. Zerodha P&L)
                  </p>
                </div>
                <span className="text-sm font-bold text-slate-700">
                  â‚¹{(income.dividends || []).reduce((s, d) => s + toNum(d.amount), 0).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="px-4 py-4 space-y-3">
                {/* Header row */}
                <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-3">
                  {["Narration", "Amount (â‚¹)", "Date of Receipt", ""].map((h) => (
                    <p key={h} className="text-xs font-bold text-slate-600">{h}</p>
                  ))}
                </div>
                {/* Data rows */}
                {(income.dividends || []).map((d, i) => (
                  <div key={i} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-3 items-center">
                    <input
                      value={d.narration}
                      onChange={(e) =>
                        setIncome((p) => ({
                          ...p,
                          dividends: p.dividends.map((x, idx) =>
                            idx === i ? { ...x, narration: e.target.value } : x,
                          ),
                        }))
                      }
                      placeholder="e.g. HDFC Bank Dividend"
                      className="border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                    <div className="flex items-center border border-slate-300 rounded-lg px-3 py-2 bg-white">
                      <span className="text-slate-400 text-sm mr-1">â‚¹</span>
                      <input
                        type="number"
                        onWheel={(e) => e.target.blur()}
                        value={d.amount}
                        onChange={(e) =>
                          setIncome((p) => ({
                            ...p,
                            dividends: p.dividends.map((x, idx) =>
                              idx === i ? { ...x, amount: e.target.value } : x,
                            ),
                          }))
                        }
                        placeholder="0"
                        className="flex-1 text-sm font-semibold text-slate-800 bg-transparent outline-none text-right"
                      />
                    </div>
                    <input
                      type="date"
                      value={d.dateOfReceipt}
                      onChange={(e) =>
                        setIncome((p) => ({
                          ...p,
                          dividends: p.dividends.map((x, idx) =>
                            idx === i ? { ...x, dateOfReceipt: e.target.value } : x,
                          ),
                        }))
                      }
                      className="border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setIncome((p) => ({
                          ...p,
                          dividends: p.dividends.filter((_, idx) => idx !== i),
                        }))
                      }
                      className="text-red-400 hover:text-red-600 p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    setIncome((p) => ({
                      ...p,
                      dividends: [
                        ...(p.dividends || []),
                        { narration: "", amount: "", dateOfReceipt: "" },
                      ],
                    }))
                  }
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 mt-1"
                >
                  <Plus size={11} className="border border-blue-600 rounded-full" />{" "}
                  Add more items
                </button>
              </div>
            </div>

            {/* Any Other Income â€” source dropdown + amount rows */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-slate-50">
                <div>
                  <p className="text-sm font-bold text-slate-800">Any Other Income</p>
                  <p className="text-xs text-slate-500">
                    Family pension, gifts, freelance, NSC, winnings, commission etc.
                  </p>
                </div>
                <span className="text-sm font-bold text-slate-700">
                  â‚¹{(income.otherIncome || []).reduce((s, r) => s + toNum(r.amount), 0).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="px-4 py-4 space-y-3">
                {(income.otherIncome || []).length > 0 && (
                  <div className="grid grid-cols-[1fr_1fr_auto] gap-3">
                    {["Source", "Amount (â‚¹)", ""].map((h) => (
                      <p key={h} className="text-xs font-bold text-slate-600">{h}</p>
                    ))}
                  </div>
                )}
                {(income.otherIncome || []).map((row, i) => (
                  <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-3 items-center">
                    <select
                      value={row.source}
                      onChange={(e) =>
                        setIncome((p) => ({
                          ...p,
                          otherIncome: p.otherIncome.map((x, idx) =>
                            idx === i ? { ...x, source: e.target.value } : x,
                          ),
                        }))
                      }
                      className="border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 appearance-none"
                    >
                      <option value="">Select sourceâ€¦</option>
                      <option value="Family Pension">Family Pension</option>
                      <option value="Commission / Brokerage">Commission / Brokerage</option>
                      <option value="Freelance / Consulting">Freelance / Consulting</option>
                      <option value="Gifts received">Gifts received</option>
                      <option value="NSC Interest">NSC Interest</option>
                      <option value="KVP Interest">KVP Interest</option>
                      <option value="Post Office MIS">Post Office MIS</option>
                      <option value="Gratuity (taxable portion)">Gratuity (taxable portion)</option>
                      <option value="VRS / Leave Encashment">VRS / Leave Encashment</option>
                      <option value="Agricultural Income (taxable)">Agricultural Income (taxable)</option>
                      <option value="Rental income (not HP)">Rental income (not HP)</option>
                      <option value="Interest from loans given">Interest from loans given</option>
                      <option value="Winnings (crossword, horse race)">Winnings (crossword, horse race)</option>
                      <option value="Director's fees / sitting fees">Director's fees / sitting fees</option>
                      <option value="Alimony received">Alimony received</option>
                      <option value="Others">Others</option>
                    </select>
                    <div className="flex items-center border border-slate-300 rounded-lg px-3 py-2 bg-white">
                      <span className="text-slate-400 text-sm mr-1">â‚¹</span>
                      <input
                        type="number"
                        onWheel={(e) => e.target.blur()}
                        value={row.amount}
                        onChange={(e) =>
                          setIncome((p) => ({
                            ...p,
                            otherIncome: p.otherIncome.map((x, idx) =>
                              idx === i ? { ...x, amount: e.target.value } : x,
                            ),
                          }))
                        }
                        placeholder="0"
                        className="flex-1 text-sm font-semibold text-slate-800 bg-transparent outline-none text-right"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setIncome((p) => ({
                          ...p,
                          otherIncome: p.otherIncome.filter((_, idx) => idx !== i),
                        }))
                      }
                      className="text-red-400 hover:text-red-600 p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    setIncome((p) => ({
                      ...p,
                      otherIncome: [
                        ...(p.otherIncome || []),
                        { source: "", amount: "" },
                      ],
                    }))
                  }
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 mt-1"
                >
                  <Plus size={11} className="border border-blue-600 rounded-full" />{" "}
                  Add more items
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </FormSection>

    {/* Exempt, Online Gaming & Other Special Income */}
    <FormSection
      icon={<span className="text-base">ðŸŽ®</span>}
      title="Exempt, Online Gaming & Other Income"
      subtitle="Exempt Income, Invoice Discounting, Online Gaming, Puzzles, Lottery Winnings etc."
      badge={income.hasExemptOther ? "Details Added" : undefined}
      defaultOpen={false}
    >
      <div className="mt-3 mb-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="hasExemptOther"
            checked={income.hasExemptOther}
            onChange={handleIncome}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <span className="text-sm font-semibold text-slate-700">
            I have exempt / gaming / lottery income
          </span>
        </label>
      </div>
      {income.hasExemptOther && (
        <div className="space-y-4 mt-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-800 flex items-start gap-2">
            <Info size={13} className="text-amber-500 mt-0.5 flex-shrink-0" />
            Online gaming & lottery winnings are taxed at 30% flat + 4% cess (no basic exemption applies).
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FloatingInput
              label="Online Gaming Winnings (â‚¹)"
              name="onlineGaming"
              type="number"
              onWheel={(e) => e.target.blur()}
              value={income.onlineGaming}
              onChange={handleIncome}
              hint="Dream11, MPL, WinZO, Rummy etc. â€” taxed at 30%"
            />
            <FloatingInput
              label="Lottery / Puzzle Winnings (â‚¹)"
              name="lotteryWinnings"
              type="number"
              onWheel={(e) => e.target.blur()}
              value={income.lotteryWinnings}
              onChange={handleIncome}
              hint="Taxed at 30% flat u/s 115BB"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FloatingInput
              label="Invoice Discounting Income (â‚¹)"
              name="invoiceDiscounting"
              type="number"
              onWheel={(e) => e.target.blur()}
              value={income.invoiceDiscounting}
              onChange={handleIncome}
              hint="Taxed at slab rate"
            />
            <FloatingInput
              label="Exempt Income (â‚¹)"
              name="exemptIncome"
              type="number"
              onWheel={(e) => e.target.blur()}
              value={income.exemptIncome}
              onChange={handleIncome}
              hint="Agriculture, PPF maturity, LTCG within exemption etc."
            />
          </div>
        </div>
      )}
    </FormSection>

    {/* Taxes Paid â€” TDS, TCS, Advance Tax */}
    <FormSection
      icon={<CreditCard size={16} />}
      title="Taxes Paid, TDS and TCS"
      subtitle="TDS or TCS Payments, Payments for Advance Taxes or Tax due and others. Upload Form 26AS to fetch these details."
      badge={
        toNum(income.tdsSalary) +
          (income.tdsNonSalary || []).reduce((s, t) => s + toNum(t.amount), 0) +
          (income.tdsProperty || []).reduce((s, t) => s + toNum(t.amount), 0) +
          (income.selfTaxPayments || []).reduce((s, t) => s + toNum(t.amount), 0) +
          toNum(income.advanceTax) +
          toNum(income.tcsPaid) >
        0
          ? "Details Added"
          : undefined
      }
      defaultOpen={false}
    >
      <div className="mt-4 space-y-3">
        {/* 1. Self Tax Payments (Challan 280) */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3.5 bg-slate-50">
            <div className="flex items-center gap-3">
              <span className="text-lg">ðŸ§¾</span>
              <div>
                <p className="text-sm font-bold text-slate-800">
                  Self Tax Payments{" "}
                  <span className="text-slate-400 font-normal">(For Tax Due / Advance Tax)</span>
                </p>
                <p className="text-xs text-slate-500">
                  Add details if you have paid directly any taxes to the Govt. (via Challan 280)
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                setIncome((p) => ({
                  ...p,
                  selfTaxPayments: [
                    ...(p.selfTaxPayments || []),
                    { bsrCode: "", challanNo: "", date: "", amount: "", type: "Advance Tax" },
                  ],
                }))
              }
              className="text-xs font-bold text-blue-600 border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50 transition-colors"
            >
              + Add Details
            </button>
          </div>
          {(income.selfTaxPayments || []).length > 0 && (
            <div className="px-4 py-4 space-y-3">
              <div className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-2">
                {["BSR Code", "Challan No.", "Date", "Amount (â‚¹)", ""].map((h) => (
                  <p key={h} className="text-xs font-bold text-slate-600">{h}</p>
                ))}
              </div>
              {income.selfTaxPayments.map((t, i) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-2 items-center">
                  <input
                    value={t.bsrCode}
                    onChange={(e) =>
                      setIncome((p) => ({
                        ...p,
                        selfTaxPayments: p.selfTaxPayments.map((x, idx) =>
                          idx === i ? { ...x, bsrCode: e.target.value } : x,
                        ),
                      }))
                    }
                    placeholder="BSR Code"
                    className="border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                  <input
                    value={t.challanNo}
                    onChange={(e) =>
                      setIncome((p) => ({
                        ...p,
                        selfTaxPayments: p.selfTaxPayments.map((x, idx) =>
                          idx === i ? { ...x, challanNo: e.target.value } : x,
                        ),
                      }))
                    }
                    placeholder="Challan No."
                    className="border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                  <input
                    type="date"
                    value={t.date}
                    onChange={(e) =>
                      setIncome((p) => ({
                        ...p,
                        selfTaxPayments: p.selfTaxPayments.map((x, idx) =>
                          idx === i ? { ...x, date: e.target.value } : x,
                        ),
                      }))
                    }
                    className="border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                  <div className="flex items-center border border-slate-300 rounded-lg px-2 py-2 bg-white">
                    <span className="text-slate-400 text-xs mr-1">â‚¹</span>
                    <input
                      type="number"
                      onWheel={(e) => e.target.blur()}
                      value={t.amount}
                      onChange={(e) =>
                        setIncome((p) => ({
                          ...p,
                          selfTaxPayments: p.selfTaxPayments.map((x, idx) =>
                            idx === i ? { ...x, amount: e.target.value } : x,
                          ),
                        }))
                      }
                      placeholder="0"
                      className="flex-1 text-sm font-semibold text-slate-800 bg-transparent outline-none text-right w-0 min-w-0"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setIncome((p) => ({
                        ...p,
                        selfTaxPayments: p.selfTaxPayments.filter((_, idx) => idx !== i),
                      }))
                    }
                    className="text-red-400 hover:text-red-600 p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 2. TDS on Salary */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3.5 bg-slate-50">
            <div className="flex items-center gap-3">
              <span className="text-lg">ðŸ’°</span>
              <div>
                <p className="text-sm font-bold text-slate-800">TDS on Salary</p>
                <p className="text-xs text-slate-500">
                  This is TDS deducted from salary, check Salary page for any changes.
                </p>
              </div>
            </div>
          </div>
          <div className="px-4 py-4">
            <FloatingInput
              label="TDS on Salary (â‚¹)"
              name="tdsSalary"
              type="number"
              onWheel={(e) => e.target.blur()}
              value={income.tdsSalary}
              onChange={handleIncome}
              hint="As per Form 16 / Form 26AS â€” total TDS deducted by employer"
            />
          </div>
        </div>

        {/* 3. Non-Salary TDS */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3.5 bg-slate-50">
            <div className="flex items-center gap-3">
              <span className="text-lg">ðŸ“Š</span>
              <div>
                <p className="text-sm font-bold text-slate-800">Non Salary TDS</p>
                <p className="text-xs text-slate-500">
                  Add TDS deducted on interest income, professional or consulting income
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                setIncome((p) => ({
                  ...p,
                  tdsNonSalary: [
                    ...(p.tdsNonSalary || []),
                    { deductorName: "", tan: "", amount: "" },
                  ],
                }))
              }
              className="text-xs font-bold text-blue-600 border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50 transition-colors"
            >
              + Add Details
            </button>
          </div>
          {(income.tdsNonSalary || []).length > 0 && (
            <div className="px-4 py-4 space-y-3">
              <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-3">
                {["Deductor Name", "TAN", "Amount (â‚¹)", ""].map((h) => (
                  <p key={h} className="text-xs font-bold text-slate-600">{h}</p>
                ))}
              </div>
              {income.tdsNonSalary.map((t, i) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-3 items-center">
                  <input
                    value={t.deductorName}
                    onChange={(e) =>
                      setIncome((p) => ({
                        ...p,
                        tdsNonSalary: p.tdsNonSalary.map((x, idx) =>
                          idx === i ? { ...x, deductorName: e.target.value } : x,
                        ),
                      }))
                    }
                    placeholder="e.g. HDFC Bank"
                    className="border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                  <input
                    value={t.tan}
                    onChange={(e) =>
                      setIncome((p) => ({
                        ...p,
                        tdsNonSalary: p.tdsNonSalary.map((x, idx) =>
                          idx === i ? { ...x, tan: e.target.value.toUpperCase() } : x,
                        ),
                      }))
                    }
                    placeholder="TAN"
                    className="border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                  <div className="flex items-center border border-slate-300 rounded-lg px-3 py-2 bg-white">
                    <span className="text-slate-400 text-sm mr-1">â‚¹</span>
                    <input
                      type="number"
                      onWheel={(e) => e.target.blur()}
                      value={t.amount}
                      onChange={(e) =>
                        setIncome((p) => ({
                          ...p,
                          tdsNonSalary: p.tdsNonSalary.map((x, idx) =>
                            idx === i ? { ...x, amount: e.target.value } : x,
                          ),
                        }))
                      }
                      placeholder="0"
                      className="flex-1 text-sm font-semibold text-slate-800 bg-transparent outline-none text-right"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setIncome((p) => ({
                        ...p,
                        tdsNonSalary: p.tdsNonSalary.filter((_, idx) => idx !== i),
                      }))
                    }
                    className="text-red-400 hover:text-red-600 p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 4. TDS on Sale/Rent of Property */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3.5 bg-slate-50">
            <div className="flex items-center gap-3">
              <span className="text-lg">ðŸ </span>
              <div>
                <p className="text-sm font-bold text-slate-800">
                  TDS on Sale / Rent of Immovable Property
                </p>
                <p className="text-xs text-slate-500">
                  Add TDS details if you have sold / rented land, house, property or building etc.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                setIncome((p) => ({
                  ...p,
                  tdsProperty: [
                    ...(p.tdsProperty || []),
                    { deductorName: "", pan: "", amount: "" },
                  ],
                }))
              }
              className="text-xs font-bold text-blue-600 border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50 transition-colors"
            >
              + Add Details
            </button>
          </div>
          {(income.tdsProperty || []).length > 0 && (
            <div className="px-4 py-4 space-y-3">
              <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-3">
                {["Deductor Name", "PAN of Buyer/Tenant", "Amount (â‚¹)", ""].map((h) => (
                  <p key={h} className="text-xs font-bold text-slate-600">{h}</p>
                ))}
              </div>
              {income.tdsProperty.map((t, i) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-3 items-center">
                  <input
                    value={t.deductorName}
                    onChange={(e) =>
                      setIncome((p) => ({
                        ...p,
                        tdsProperty: p.tdsProperty.map((x, idx) =>
                          idx === i ? { ...x, deductorName: e.target.value } : x,
                        ),
                      }))
                    }
                    placeholder="Name"
                    className="border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                  <input
                    value={t.pan}
                    onChange={(e) =>
                      setIncome((p) => ({
                        ...p,
                        tdsProperty: p.tdsProperty.map((x, idx) =>
                          idx === i ? { ...x, pan: e.target.value.toUpperCase() } : x,
                        ),
                      }))
                    }
                    placeholder="PAN"
                    className="border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                  <div className="flex items-center border border-slate-300 rounded-lg px-3 py-2 bg-white">
                    <span className="text-slate-400 text-sm mr-1">â‚¹</span>
                    <input
                      type="number"
                      onWheel={(e) => e.target.blur()}
                      value={t.amount}
                      onChange={(e) =>
                        setIncome((p) => ({
                          ...p,
                          tdsProperty: p.tdsProperty.map((x, idx) =>
                            idx === i ? { ...x, amount: e.target.value } : x,
                          ),
                        }))
                      }
                      placeholder="0"
                      className="flex-1 text-sm font-semibold text-slate-800 bg-transparent outline-none text-right"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setIncome((p) => ({
                        ...p,
                        tdsProperty: p.tdsProperty.filter((_, idx) => idx !== i),
                      }))
                    }
                    className="text-red-400 hover:text-red-600 p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* TCS + Advance Tax (flat fields) */}
        <div className="grid grid-cols-2 gap-4 pt-1">
          <FloatingInput
            label="Advance Tax Paid (â‚¹)"
            name="advanceTax"
            type="number"
            onWheel={(e) => e.target.blur()}
            value={income.advanceTax}
            onChange={handleIncome}
            hint="Self-assessment / advance tax challan payments"
          />
          <FloatingInput
            label="TCS Collected (â‚¹)"
            name="tcsPaid"
            type="number"
            onWheel={(e) => e.target.blur()}
            value={income.tcsPaid}
            onChange={handleIncome}
            hint="Tax Collected at Source â€” LRS, car purchase etc."
          />
        </div>

        {/* Total */}
        <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
          <span className="text-sm font-semibold text-slate-700">Total Taxes Paid</span>
          <span className="text-sm font-bold text-slate-900">
            {fmt(
              toNum(income.tdsSalary) +
                (income.tdsNonSalary || []).reduce((s, t) => s + toNum(t.amount), 0) +
                (income.tdsProperty || []).reduce((s, t) => s + toNum(t.amount), 0) +
                (income.selfTaxPayments || []).reduce((s, t) => s + toNum(t.amount), 0) +
                toNum(income.advanceTax) +
                toNum(income.tcsPaid),
            )}
          </span>
        </div>
      </div>
    </FormSection>
  </div>
);

/* â”€â”€â”€ Step 2: Tax Saving â”€â”€â”€ */
const Step2TaxSaving = ({ taxSaving, handleTaxSaving, income, tax, personal }) => (
  <div>
    {/* Regime selector */}
    <div className="mb-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <p className="text-sm font-bold text-slate-900 mb-3">Choose Tax Regime</p>
      <div className="grid grid-cols-2 gap-3">
        {[
          {
            val: "new",
            label: "New Regime",
            sub: "Default under the Income-tax Act, 2025; most personal deductions are not available.",
          },
          {
            val: "old",
            label: "Old Regime",
            sub: "Alternative regime with eligible savings, insurance and other deductions.",
          },
        ].map((r) => (
          <label
            key={r.val}
            className={`flex flex-col gap-1 p-4 rounded-xl border-2 cursor-pointer transition-all ${taxSaving.regime === r.val ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-slate-300"}`}
          >
            <input
              type="radio"
              name="regime"
              value={r.val}
              checked={taxSaving.regime === r.val}
              onChange={handleTaxSaving}
              className="sr-only"
            />
            <span
              className={`font-bold text-sm ${taxSaving.regime === r.val ? "text-blue-700" : "text-slate-700"}`}
            >
              {r.label}
            </span>
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

    <FormSection
      icon={<Calculator size={16} />}
      title="Deductions and Relief"
      subtitle="Salary deductions are calculated for Tax Year 2026-27; enter relief amounts only when eligible."
    >
      <div className="mt-4 space-y-5">
        <section className="space-y-3">
          <h3 className="text-sm font-bold text-slate-800">3A Â· Deduction under section 19</h3>
          <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 px-4 py-3">
            <div>
              <p className="text-sm text-slate-700">Standard deduction</p>
              <p className="text-xs text-slate-500">
                Auto-applied: up to â‚¹75,000 new regime or â‚¹50,000 old regime, limited to salary.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2">
              <span className="text-slate-400">â‚¹</span>
              <span className="w-24 text-right text-sm font-semibold text-slate-700">
                {tax.stdDeduction.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
          <FloatingInput
            label="Professional tax paid during the tax year"
            name="professionalTax"
            type="number"
            onWheel={(e) => e.target.blur()}
            value={taxSaving.professionalTax}
            onChange={handleTaxSaving}
            hint="Deductible under section 19 in either regime; limited to salary income."
          />
        </section>

        <section className="space-y-3 border-t border-slate-100 pt-4">
          <h3 className="text-sm font-bold text-slate-800">
            3B Â· Relief under section 157 (formerly section 89)
          </h3>
          <FloatingInput
            label="Relief for salary arrears / advance salary"
            name="arrearsRelief"
            type="number"
            onWheel={(e) => e.target.blur()}
            value={taxSaving.arrearsRelief}
            onChange={handleTaxSaving}
            hint="Enter the eligible tax relief amount computed for Tax Year 2026-27. This reduces tax payable, not taxable income."
          />
        </section>

        <section className="space-y-3 border-t border-slate-100 pt-4">
          <h3 className="text-sm font-bold text-slate-800">
            3C Â· Income claimed under section 158 (formerly section 89A)
          </h3>
          <FloatingInput
            label="Eligible foreign retirement-account income"
            name="foreignRetirementRelief"
            type="number"
            onWheel={(e) => e.target.blur()}
            value={taxSaving.foreignRetirementRelief}
            onChange={handleTaxSaving}
            hint="Enter qualifying income otherwise taxable this year that is deferred using the section 158 option in Form 40."
          />
        </section>
      </div>
    </FormSection>

    <FormSection
      icon={<Info size={16} />}
      title="Tax rebate"
      subtitle="Resident individuals may qualify for a rebate after tax is calculated."
    >
      <div className="mt-4 space-y-2 text-sm text-slate-600">
        <p>
          <strong className="text-slate-800">New regime:</strong>{" "}
          rebate up to â‚¹60,000 where total income is up to â‚¹12 lakh; marginal relief may apply just above â‚¹12 lakh.
        </p>
        <p>
          <strong className="text-slate-800">Old regime:</strong>{" "}
          rebate up to â‚¹12,500 where total income is up to â‚¹5 lakh.
        </p>
        <p className="text-xs text-slate-500">
          Rebate is for resident individuals. Tax on special-rate income such as capital gains is calculated separately.
          Tax Year 2026-27 rebate rules are in section 156 of the Income-tax Act, 2025.
        </p>
      </div>
    </FormSection>

    <FormSection
      icon={<Calculator size={16} />}
      title="Deductions available under both regimes"
      subtitle="Enter the eligible employer contribution shown in your salary or NPS records."
    >
      <div className="mt-4">
        <FloatingInput
          label="Employer NPS contribution eligible for deduction"
          name="employerNps"
          type="number"
          onWheel={(e) => e.target.blur()}
          value={taxSaving.employerNps}
          onChange={handleTaxSaving}
          hint="Section 124. Use the eligible amount from Form 16/payroll after the salary-based limit; do not enter your own NPS contribution here."
        />
      </div>
    </FormSection>

    {taxSaving.regime === "old" && (
      <FormSection
        icon={<Calculator size={16} />}
        title="Tax Savings Deductions"
        subtitle="Invested your earnings to save taxes for AY 2026-2027? Enter relevant fields & save taxes!"
      >
        <div className="mt-4 space-y-3">
          {/* 1 â€” Popular Tax Saving Investments */}
          <DeductionCard
            emoji="ðŸ¦"
            title="Popular Tax Saving Investments"
            subtitle="80C, PPF, ELSS, NPS, Savings Bank Interest, Pension, and more"
            total={
              Math.min(toNum(taxSaving.sec80C), 150_000) +
              Math.min(toNum(taxSaving.nps80CCD), 50_000) +
              (isSeniorForTaxYear(personal.dob) && personal.residentialStatus !== "Non Resident Indian"
                ? Math.min(toNum(taxSaving.sec80TTB), 50_000)
                : Math.min(toNum(taxSaving.sec80TTA), 10_000))
            }
          >
            <FloatingInput
              label="Eligible savings: LIC, PPF, ELSS, EPF, tuition fees (max â‚¹1.5L)"
              name="sec80C" type="number" onWheel={(e) => e.target.blur()}
              value={taxSaving.sec80C} onChange={handleTaxSaving}
              hint="Section 80C â€” combined cap â‚¹1,50,000."
            />
            <FloatingInput
              label="Own NPS contributions (max â‚¹50,000)"
              name="nps80CCD" type="number" onWheel={(e) => e.target.blur()}
              value={taxSaving.nps80CCD} onChange={handleTaxSaving}
              hint="Additional deduction u/s 80CCD(1B); old regime only."
            />
            {isSeniorForTaxYear(personal.dob) && personal.residentialStatus !== "Non Resident Indian" ? (
              <FloatingInput
                label="Senior citizen interest deduction (80TTB, max â‚¹50,000)"
                name="sec80TTB" type="number" onWheel={(e) => e.target.blur()}
                value={taxSaving.sec80TTB} onChange={handleTaxSaving}
                hint={`Eligible interest currently â‚¹${(toNum(income.interestSavings) + toNum(income.interestFD) + toNum(income.interestP2P) + toNum(income.interestBonds) + toNum(income.interestPF) + toNum(income.interestITRefund)).toLocaleString("en-IN")}.`}
              />
            ) : (
              <FloatingInput
                label="Savings account interest deduction (80TTA, max â‚¹10,000)"
                name="sec80TTA" type="number" onWheel={(e) => e.target.blur()}
                value={taxSaving.sec80TTA} onChange={handleTaxSaving}
                hint={`Savings interest currently â‚¹${toNum(income.interestSavings).toLocaleString("en-IN")}.`}
              />
            )}
          </DeductionCard>

          {/* 2 â€” Medical Insurance */}
          <DeductionCard
            emoji="ðŸ¥"
            title="Medical Insurance, Health Check-ups, Disabilities etc."
            subtitle="Deductions related to 80D â€” Insurance, Disabilities, Health Checkups, etc."
            total={
              Math.min(toNum(taxSaving.sec80D_self), taxSaving.sec80D_selfSenior ? 50_000 : 25_000) +
              Math.min(toNum(taxSaving.sec80D_parents), taxSaving.sec80D_parentsSenior ? 50_000 : 25_000)
            }
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <FloatingInput
                  label="Health cover â€” Self & Family"
                  name="sec80D_self" type="number" onWheel={(e) => e.target.blur()}
                  value={taxSaving.sec80D_self} onChange={handleTaxSaving}
                  hint={`Limit â‚¹${taxSaving.sec80D_selfSenior ? "50,000" : "25,000"}`}
                />
                <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                  <input type="checkbox" name="sec80D_selfSenior" checked={taxSaving.sec80D_selfSenior} onChange={handleTaxSaving} className="w-3.5 h-3.5 text-blue-600 rounded" />
                  Self / spouse / child is 60 or older
                </label>
              </div>
              <div className="space-y-2">
                <FloatingInput
                  label="Health cover â€” Parents"
                  name="sec80D_parents" type="number" onWheel={(e) => e.target.blur()}
                  value={taxSaving.sec80D_parents} onChange={handleTaxSaving}
                  hint={`Limit â‚¹${taxSaving.sec80D_parentsSenior ? "50,000" : "25,000"}`}
                />
                <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                  <input type="checkbox" name="sec80D_parentsSenior" checked={taxSaving.sec80D_parentsSenior} onChange={handleTaxSaving} className="w-3.5 h-3.5 text-blue-600 rounded" />
                  Parent is 60 or older
                </label>
              </div>
            </div>
          </DeductionCard>

          {/* 3 â€” Donations */}
          <DeductionCard
            emoji="ðŸ¤"
            title="Donations / Contributions"
            subtitle="Deductions for donations to charitable orgs., political parties, R&D, etc."
            total={toNum(taxSaving.sec80G)}
          >
            <FloatingInput
              label="Eligible deduction for donations (80G)"
              name="sec80G" type="number" onWheel={(e) => e.target.blur()}
              value={taxSaving.sec80G} onChange={handleTaxSaving}
              hint="Enter the deductible amount after applying eligibility %. Some donations have a 10% of Adjusted GTI ceiling."
            />
          </DeductionCard>

          {/* 4 â€” Loans */}
          <DeductionCard
            emoji="ðŸ "
            title="Loans"
            subtitle="Deduction for Educational, Home or Electric Vehicle Loans"
            total={toNum(taxSaving.sec80E) + Math.min(toNum(taxSaving.homeLoan80EEA), 150_000)}
          >
            <FloatingInput
              label="Education Loan Interest (80E)"
              name="sec80E" type="number" onWheel={(e) => e.target.blur()}
              value={taxSaving.sec80E} onChange={handleTaxSaving}
              hint="No monetary cap â€” full interest on education loan is deductible."
            />
            <FloatingInput
              label="Home Loan â€” First-time buyers (80EEA, max â‚¹1.5L)"
              name="homeLoan80EEA" type="number" onWheel={(e) => e.target.blur()}
              value={taxSaving.homeLoan80EEA} onChange={handleTaxSaving}
              hint="Max â‚¹1.5L (enforced); loan sanctioned between 1 Apr 2019 â€“ 31 Mar 2022."
            />
          </DeductionCard>
        </div>
      </FormSection>
    )}
  </div>
);

/* â”€â”€â”€ Step 3: Tax Summary â”€â”€â”€ */
const Step3TaxSummary = ({ tax, taxSaving, income, personal, navigate }) => (
  <div>
    {/* â”€â”€ Refund / Due hero banner â”€â”€ */}
    <div
      className={`rounded-2xl p-6 mb-5 text-center shadow-sm ${tax.refundOrDue >= 0 ? "bg-gradient-to-br from-violet-50 to-indigo-50 border border-indigo-200" : "bg-gradient-to-br from-rose-50 to-orange-50 border border-rose-200"}`}
    >
      {tax.refundOrDue >= 0 ? (
        <>
          <p className="text-lg font-extrabold text-indigo-600 mb-1">
            ðŸŽ‰ You have a tax refund of {fmt(tax.refundOrDue)}
          </p>
          <p className="text-xs text-slate-500">Tax Already Paid exceeds your Tax Liability</p>
        </>
      ) : (
        <>
          <p className="text-lg font-extrabold text-rose-600 mb-1">
            âš ï¸ Tax Due: {fmt(Math.abs(tax.refundOrDue))}
          </p>
          <p className="text-xs text-slate-500">You need to pay this before filing your return</p>
        </>
      )}
      {/* ITR Type + Regime chips */}
      <div className="flex items-center justify-center gap-4 mt-4">
        <div className="flex items-center gap-1.5 bg-white border border-indigo-200 rounded-lg px-3 py-1.5">
          <span className="text-xs text-slate-500">Your ITR Type:</span>
          <span className="text-xs font-black text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
            {tax.itrType}
          </span>
        </div>
        <div className="flex items-center gap-1.5 bg-white border border-emerald-200 rounded-lg px-3 py-1.5">
          <span className="text-xs text-slate-500">Your Tax Regime:</span>
          <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
            {taxSaving.regime === "new" ? "New Regime" : "Old Regime"}
          </span>
        </div>
      </div>
    </div>

    {/* â”€â”€ Main computation card â”€â”€ */}
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm mb-5">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white flex items-center gap-3">
        <Calculator size={18} />
        <div>
          <h2 className="font-extrabold text-base">Tax Computation Summary</h2>
          <p className="text-blue-100 text-xs">
            Tax Year 2026â€“27 Â· Income-tax Act, 2025 Â·{" "}
            {taxSaving.regime === "new" ? "New" : "Old"} Regime
          </p>
        </div>
      </div>
      <div className="px-5 py-5">
        <SummaryRow label="Gross Total Income" value={fmt(tax.grossTotal)} />
        {tax.professionalTax > 0 && (
          <SummaryRow label="Professional Tax Deduction" value={`- ${fmt(tax.professionalTax)}`} />
        )}
        <SummaryRow label="Standard Deduction" value={`- ${fmt(tax.stdDeduction)}`} />
        {tax.retirementIncomeRelief > 0 && (
          <SummaryRow label="Retirement Account Income Relief" value={`- ${fmt(tax.retirementIncomeRelief)}`} />
        )}
        {taxSaving.regime === "old" && (
          <SummaryRow label="Chapter VI-A Deductions" value={`- ${fmt(tax.totalDeductions)}`} />
        )}
        {tax.employerNpsDeduction > 0 && (
          <SummaryRow label="Employer NPS Contribution" value={`- ${fmt(tax.employerNpsDeduction)}`} />
        )}
        <SummaryRow
          label="Taxable Income (Slab)"
          value={fmt(taxSaving.regime === "new" ? tax.taxableNew : tax.taxableOld)}
          bold
        />
        {/* Slab breakdown table â€” new regime only */}
        {taxSaving.regime === "new" && tax.slabs.length > 0 && (
          <div className="mt-3 mb-2 border border-slate-100 rounded-xl overflow-hidden">
            <div className="bg-slate-50 px-4 py-2 flex justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wide">
              <span>Income Slab</span>
              <span>Rate</span>
              <span>Your Income</span>
              <span>Tax</span>
            </div>
            {tax.slabs.map((s) => (
              <div key={s.range} className="flex justify-between px-4 py-2 border-t border-slate-100 text-xs">
                <span className="text-slate-600 w-24">{s.range}</span>
                <span className="text-slate-500">{s.rate}</span>
                <span className="text-slate-700">â‚¹{Math.round(s.income).toLocaleString("en-IN")}</span>
                <span className="font-semibold text-slate-800">â‚¹{Math.round(s.tax).toLocaleString("en-IN")}</span>
              </div>
            ))}
          </div>
        )}
        <div className="h-2" />
        <SummaryRow
          label="Slab Rate Tax"
          value={fmt(taxSaving.regime === "new" ? tax.taxNew : tax.taxOld)}
        />
        {tax.gamingTax + tax.lotteryTax > 0 && (
          <SummaryRow label="Fixed Rate Tax (Gaming / Lottery)" value={fmt(tax.gamingTax + tax.lotteryTax)} />
        )}
        {tax.arrearsRelief > 0 && (
          <SummaryRow label="Relief u/s 157 (Arrears)" value={`- ${fmt(tax.arrearsRelief)}`} />
        )}
        <SummaryRow label="Total Tax Liability" value={fmt(tax.totalTaxLiability)} bold />
        <div className="h-2" />
        <SummaryRow
          label="TDS on Salary"
          value={toNum(income.tdsSalary) > 0 ? `- ${fmt(toNum(income.tdsSalary))}` : "â€”"}
        />
        <SummaryRow
          label="Non-Salary TDS"
          value={toNum(income.tdsNonSalary) > 0 ? `- ${fmt(toNum(income.tdsNonSalary))}` : "â€”"}
        />
        <SummaryRow
          label="Advance Tax Paid"
          value={toNum(income.advanceTax) > 0 ? `- ${fmt(toNum(income.advanceTax))}` : "â€”"}
        />
        <SummaryRow
          label="TCS Collected"
          value={toNum(income.tcsPaid) > 0 ? `- ${fmt(toNum(income.tcsPaid))}` : "â€”"}
        />
        <SummaryRow label="Tax Already Paid" value={fmt(tax.totalTaxPaid)} bold />
        <div className="h-2" />
        <SummaryRow
          label={
            tax.refundOrDue >= 0
              ? "ðŸŸ¢ Tax Refund (Taxes Paid â€“ Liability)"
              : "ðŸ”´ Tax Due (Liability â€“ Taxes Paid)"
          }
          value={fmt(Math.abs(tax.refundOrDue))}
          highlight
          bold
        />
      </div>
      <p className="px-5 pb-4 text-xs text-slate-500">
        Estimate only. Surcharge, final deduction eligibility, and asset-specific capital-gains rules may change the final tax.
      </p>
      {/* Regime saving callout */}
      <div className="mx-5 mb-5 bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
        <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" />
        <div>
          <p className="text-sm font-bold text-emerald-800">
            {tax.betterRegime} Regime saves you {fmt(tax.saving)}
          </p>
          <p className="text-xs text-emerald-700 mt-0.5">
            {tax.betterRegime ===
            taxSaving.regime.charAt(0).toUpperCase() + taxSaving.regime.slice(1)
              ? "You are already on the better regime."
              : `Consider switching to ${tax.betterRegime} Regime.`}
          </p>
        </div>
      </div>
    </div>

    {/* Personal summary card */}
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm mb-5">
      <h3 className="font-bold text-slate-900 text-sm mb-4">Filing Details</h3>
      <div className="grid grid-cols-2 gap-3 text-sm">
        {[
          { l: "Name", v: fullName(personal) || "â€”" },
          { l: "PAN", v: personal.pan || "â€”" },
          { l: "Date of Birth", v: personal.dob || "â€”" },
          {
            l: "Mobile",
            v: personal.mobile ? `${personal.mobileCountry} ${personal.mobile}` : "â€”",
          },
          { l: "Email", v: personal.email || "â€”" },
          { l: "City", v: personal.city || "â€”" },
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
);

const ITRFilingForm = () => {
  const { user } = useAuth();

  const navigate = useNavigate();

  const [step, setStep] = useState(0);

  const [completedSteps, setCompletedSteps] = useState(new Set());

  const [errors, setErrors] = useState({});

  const [showResidentialModal, setShowResidentialModal] = useState(false);

  const [showTestBanner, setShowTestBanner] = useState(true);

  /* â”€â”€ Personal Info state â”€â”€ */

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

  /* â”€â”€ Bank Accounts state â”€â”€ */

  const [bankAccounts, setBankAccounts] = useState([
    { accountNumber: "", ifsc: "", bankName: "", accountType: "" },
  ]);

  const addBankAccount = () =>
    setBankAccounts((b) => [
      ...b,
      { accountNumber: "", ifsc: "", bankName: "", accountType: "" },
    ]);

  const removeBankAccount = (i) =>
    setBankAccounts((b) => b.filter((_, idx) => idx !== i));

  const updateBankAccount = (i, field, val) =>
    setBankAccounts((b) =>
      b.map((item, idx) => (idx === i ? { ...item, [field]: val } : item)),
    );

  /* â”€â”€ Salary Entries state â”€â”€ */

  const [salaryEntries, setSalaryEntries] = useState([newSalaryEntry()]);

  const [editingSalaryId, setEditingSalaryId] = useState(null); // id of entry being edited

  const addSalaryEntry = () => {
    const entry = newSalaryEntry();

    setSalaryEntries((s) => [...s, entry]);

    setEditingSalaryId(entry.id);
  };

  const removeSalaryEntry = (id) => {
    setSalaryEntries((s) => s.filter((e) => e.id !== id));

    setEditingSalaryId((cur) => (cur === id ? null : cur));
  };

  const updateSalaryEntry = (id, field, val) =>
    setSalaryEntries((s) =>
      s.map((e) => (e.id === id ? { ...e, [field]: val } : e)),
    );

  const [hraModalEntryId, setHraModalEntryId] = useState(null);

  /* â”€â”€ Income Sources state â”€â”€ */

  const [income, setIncome] = useState({
    hasSalary: false,

    hasHouseProperty: false,

    // Self-occupied properties (array)

    selfOccupiedProps: [],

    // Let-out properties (array)

    letOutProps: [],

    // legacy flat fields kept for backward compat with useMemo (derived from arrays)

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

    interestP2P: "",

    interestBonds: "",

    interestPF: "",

    interestITRefund: "",

    dividends: [], // [{narration, amount, dateOfReceipt}]

    otherIncome: [], // [{source, amount}]

    // Exempt & special-rate income

    hasExemptOther: false,

    onlineGaming: "",

    lotteryWinnings: "",

    exemptIncome: "",

    invoiceDiscounting: "",

    // Taxes already paid

    selfTaxPayments: [], // [{bsrCode, challanNo, date, amount, type}]

    tdsSalary: "",

    tdsNonSalary: [], // [{deductorName, tan, amount}]

    tdsProperty: [], // [{deductorName, pan, amount}]

    advanceTax: "",

    tcsPaid: "",
  });

  /* â”€â”€ Tax Saving state â”€â”€ */

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

  /* â”€â”€ Fill test data â”€â”€ */

  const fillTestData = (scenario) => {
    setPersonal((p) => ({ ...p, ...scenario.personal }));

    setBankAccounts(scenario.bankAccounts);

    setSalaryEntries([{ ...newSalaryEntry(), ...scenario.salaryEntry }]);

    setEditingSalaryId(null);

    setIncome((p) => ({ ...p, ...scenario.income }));

    setTaxSaving((p) => ({ ...p, ...scenario.taxSaving }));

    setErrors({});

    setCompletedSteps(new Set());

    setStep(0);
  };

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

    setTaxSaving((p) => ({
      ...p,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  /* â”€â”€ Validations â”€â”€ */

  const validatePersonal = () => {
    const e = {};

    if (!personal.firstName.trim()) e.firstName = "First name is required";

    if (!personal.dob) e.dob = "Date of birth is required";

    if (!personal.fatherName.trim()) e.fatherName = "Father's name is required";

    if (!personal.flatDoorNo.trim()) e.flatDoorNo = "Flat/Door No is required";

    if (!personal.areaLocality.trim())
      e.areaLocality = "Area / Locality is required";

    if (!PINCODE_RE.test(personal.pincode))
      e.pincode = "Enter a valid 6-digit pincode";

    if (!personal.state) e.state = "State is required";

    if (!personal.city.trim()) e.city = "City is required";

    if (!personal.residentialStatus)
      e.residentialStatus =
        "Determine your residential status to calculate resident rebates";

    if (!AADHAAR_RE.test(personal.aadhaar.replace(/\s/g, "")))
      e.aadhaar = "Enter valid 12-digit Aadhaar";

    if (!PAN_RE.test(personal.pan.toUpperCase()))
      e.pan = "Enter valid PAN (e.g. ABCDE1234F)";

    if (!MOBILE_RE.test(personal.mobile))
      e.mobile = "Enter valid 10-digit mobile number";

    if (!EMAIL_RE.test(personal.email)) e.email = "Enter valid email address";

    return e;
  };

  /* â”€â”€ Tax computation â”€â”€ */

  const tax = useMemo(() => {
    const isResident =
      personal.residentialStatus === "Indian Resident" ||
      personal.residentialStatus ===
        "Resident but Not Ordinarily Resident (RNOR)";

    const isSenior = isSeniorForTaxYear(personal.dob);

    const isSuperSenior = isSuperSeniorForTaxYear(personal.dob);

    const salaryOld = income.hasSalary
      ? salaryEntries.reduce((sum, e) => sum + getSalaryTotal(e, true), 0)
      : 0;

    const salaryNew = income.hasSalary
      ? salaryEntries.reduce((sum, e) => sum + getSalaryTotal(e, false), 0)
      : 0;

    // â”€â”€ House property income â”€â”€

    const soProps = income.hasHouseProperty
      ? income.selfOccupiedProps || []
      : [];

    const letProps = income.hasHouseProperty ? income.letOutProps || [] : [];

    // Self-occupied: home loan interest loss capped at â‚¹2L total (sec 24(b))

    const soInterestTotal = soProps.reduce(
      (s, p) => s + toNum(p.homeLoanDeduction),
      0,
    );

    const cappedSOInterest = Math.min(soInterestTotal, 200_000);

    // Let-out: rent - municipal - 30% std deduction u/s 24a - home loan interest (uncapped)

    const letOutNetIncome = letProps.reduce((s, p) => {
      const rent = toNum(p.rentReceived);

      const muni = toNum(p.municipalTax);

      const stdDed = Math.round((rent - muni) * 0.3);

      const loan = toNum(p.homeLoanDeduction);

      return s + (rent - muni - stdDed - loan);
    }, 0);

    // Flat-field fallback when no arrays filled yet

    const rawRent =
      letProps.length === 0
        ? income.hasHouseProperty
          ? toNum(income.rentReceived)
          : 0
        : 0;

    const rawMunicipal =
      letProps.length === 0
        ? income.hasHouseProperty
          ? toNum(income.municipalTax)
          : 0
        : 0;

    const rawInterest =
      soProps.length === 0
        ? income.hasHouseProperty
          ? toNum(income.homeLoanInterest)
          : 0
        : 0;

    const cappedInterestOld = Math.min(rawInterest, 200_000);

    const houseIncomeOld =
      soProps.length + letProps.length > 0
        ? letOutNetIncome - cappedSOInterest
        : rawRent > 0
          ? rawRent - rawMunicipal - cappedInterestOld
          : -cappedInterestOld;

    const houseIncomeOldCapped = Math.max(houseIncomeOld, -200_000);

    const houseIncomeNew =
      letProps.length > 0
        ? letOutNetIncome
        : rawRent > 0
          ? Math.max(0, rawRent - rawMunicipal)
          : 0;

    // Capital gains taxed at special flat rates (not in slab income)

    const stcgEquityTax = income.hasCapitalGains
      ? Math.round(toNum(income.stcgEquity) * 0.2 * 1.04)
      : 0;

    const ltcgEquityTax = income.hasCapitalGains
      ? Math.round(
          Math.max(0, toNum(income.ltcgEquity) - 125_000) * 0.125 * 1.04,
        )
      : 0;

    const ltcgOtherTax = income.hasCapitalGains
      ? Math.round(toNum(income.ltcgOther) * 0.125 * 1.04)
      : 0;

    const slabCapGains = income.hasCapitalGains ? toNum(income.stcgOther) : 0;

    const other = income.hasOtherIncome
      ? toNum(income.interestSavings) +
        toNum(income.interestFD) +
        toNum(income.interestP2P) +
        toNum(income.interestBonds) +
        toNum(income.interestPF) +
        toNum(income.interestITRefund) +
        (Array.isArray(income.dividends)
          ? income.dividends.reduce((s, d) => s + toNum(d.amount), 0)
          : toNum(income.dividends)) +
        (Array.isArray(income.otherIncome)
          ? income.otherIncome.reduce((s, r) => s + toNum(r.amount), 0)
          : toNum(income.otherIncome))
      : 0;

    const professionalTaxOld = Math.min(
      salaryOld,
      toNum(taxSaving.professionalTax),
    );

    const professionalTaxNew = Math.min(
      salaryNew,
      toNum(taxSaving.professionalTax),
    );

    // Gross total income (house property loss is already negative, reducing gross)

    const grossOld = salaryOld + houseIncomeOldCapped + slabCapGains + other;

    const grossNew = salaryNew + houseIncomeNew + slabCapGains + other;

    const retirementReliefOld = Math.min(
      grossOld,
      toNum(taxSaving.foreignRetirementRelief),
    );

    const retirementReliefNew = Math.min(
      grossNew,
      toNum(taxSaving.foreignRetirementRelief),
    );

    // â”€â”€ Old regime deductions (Chapter VI-A) â”€â”€

    const d80C = Math.min(toNum(taxSaving.sec80C), 150_000);

    const d80D =
      Math.min(
        toNum(taxSaving.sec80D_self),
        taxSaving.sec80D_selfSenior ? 50_000 : 25_000,
      ) +
      Math.min(
        toNum(taxSaving.sec80D_parents),
        taxSaving.sec80D_parentsSenior ? 50_000 : 25_000,
      );

    const chapterVIA =
      d80C +
      d80D +
      toNum(taxSaving.sec80E) +
      toNum(taxSaving.sec80G) +
      Math.min(
        toNum(taxSaving.sec80TTA),
        income.hasOtherIncome ? toNum(income.interestSavings) : 0,
        10_000,
      ) +
      (isResident && isSenior
        ? Math.min(
            toNum(taxSaving.sec80TTB),
            income.hasOtherIncome
              ? toNum(income.interestSavings) +
                  toNum(income.interestFD) +
                  toNum(income.interestP2P) +
                  toNum(income.interestBonds) +
                  toNum(income.interestPF) +
                  toNum(income.interestITRefund)
              : 0,
            50_000,
          )
        : 0) +
      Math.min(toNum(taxSaving.nps80CCD), 50_000) +
      Math.min(toNum(taxSaving.homeLoan80EEA), 150_000); // sec 80EEA cap: â‚¹1.5L

    const employerNpsDeduction = toNum(taxSaving.employerNps);

    const totalDeductions = chapterVIA + employerNpsDeduction;

    const oldStandardDeduction = Math.min(salaryOld, STD_DEDUCTION_OLD);

    const newStandardDeduction = Math.min(salaryNew, STD_DEDUCTION_NEW);

    const taxableOld = Math.max(
      0,
      grossOld -
        oldStandardDeduction -
        professionalTaxOld -
        retirementReliefOld -
        totalDeductions,
    );

    const taxableNew = Math.max(
      0,
      grossNew -
        newStandardDeduction -
        professionalTaxNew -
        retirementReliefNew -
        employerNpsDeduction,
    );

    const specialRateIncome = income.hasCapitalGains
      ? toNum(income.stcgEquity) +
        toNum(income.ltcgEquity) +
        toNum(income.ltcgOther)
      : 0;

    // Pass senior flags so calcTax applies the correct old-regime basic exemption threshold

    const taxOld =
      calcTax(
        taxableOld,
        "old",
        isResident,
        taxableOld + specialRateIncome,
        isSenior,
        isSuperSenior,
      ) +
      stcgEquityTax +
      ltcgEquityTax +
      ltcgOtherTax;

    const taxNew =
      calcTax(taxableNew, "new", isResident, taxableNew + specialRateIncome) +
      stcgEquityTax +
      ltcgEquityTax +
      ltcgOtherTax;

    const chosen = Math.max(
      0,
      (taxSaving.regime === "old" ? taxOld : taxNew) -
        toNum(taxSaving.arrearsRelief),
    );

    const saving = Math.abs(taxOld - taxNew);

    const betterRegime = taxNew < taxOld ? "New" : "Old";

    const grossTotal = taxSaving.regime === "old" ? grossOld : grossNew;

    // Online gaming & lottery taxed at 30% flat (u/s 115BBJ / 115BB) + 4% cess

    const gamingTax = income.hasExemptOther
      ? Math.round(toNum(income.onlineGaming) * 0.3 * 1.04)
      : 0;

    const lotteryTax = income.hasExemptOther
      ? Math.round(toNum(income.lotteryWinnings) * 0.3 * 1.04)
      : 0;

    // Total tax liability (chosen regime + special rates)

    const totalTaxLiability = Math.max(0, chosen + gamingTax + lotteryTax);

    // Taxes already paid

    const totalTaxPaid =
      toNum(income.tdsSalary) +
      (Array.isArray(income.tdsNonSalary)
        ? income.tdsNonSalary.reduce((s, t) => s + toNum(t.amount), 0)
        : toNum(income.tdsNonSalary)) +
      (Array.isArray(income.tdsProperty)
        ? income.tdsProperty.reduce((s, t) => s + toNum(t.amount), 0)
        : 0) +
      (Array.isArray(income.selfTaxPayments)
        ? income.selfTaxPayments.reduce((s, t) => s + toNum(t.amount), 0)
        : 0) +
      toNum(income.advanceTax) +
      toNum(income.tcsPaid);

    const refundOrDue = totalTaxPaid - totalTaxLiability; // positive = refund, negative = due

    // ITR type recommendation

    const itrType = (() => {
      const hasBusinessIncome = false; // extend later

      const hasCapGains =
        income.hasCapitalGains &&
        toNum(income.stcgEquity) +
          toNum(income.ltcgEquity) +
          toNum(income.stcgOther) +
          toNum(income.ltcgOther) >
          0;

      const hasMultipleEmployers = salaryEntries.length > 1;

      const hasForeignIncome = salaryEntries.some(
        (e) =>
          toNum(e.foreignSalaryNotified) + toNum(e.foreignSalaryNonNotified) >
          0,
      );

      if (hasBusinessIncome) return "ITR-3";

      if (
        hasCapGains ||
        hasMultipleEmployers ||
        income.hasHouseProperty ||
        hasForeignIncome ||
        income.hasExemptOther
      )
        return "ITR-2";

      return "ITR-1";
    })();

    // Slab breakdown for new regime (for display)

    const slabs =
      taxSaving.regime === "new"
        ? [
            {
              range: "â‚¹0 â€“ â‚¹4L",
              rate: "0%",
              income: Math.min(taxableNew, 400_000),
              tax: 0,
            },

            {
              range: "â‚¹4L â€“ â‚¹8L",
              rate: "5%",
              income: Math.max(0, Math.min(taxableNew, 800_000) - 400_000),
              tax: Math.max(0, Math.min(taxableNew, 800_000) - 400_000) * 0.05,
            },

            {
              range: "â‚¹8L â€“ â‚¹12L",
              rate: "10%",
              income: Math.max(0, Math.min(taxableNew, 1_200_000) - 800_000),
              tax: Math.max(0, Math.min(taxableNew, 1_200_000) - 800_000) * 0.1,
            },

            {
              range: "â‚¹12L â€“ â‚¹16L",
              rate: "15%",
              income: Math.max(0, Math.min(taxableNew, 1_600_000) - 1_200_000),
              tax:
                Math.max(0, Math.min(taxableNew, 1_600_000) - 1_200_000) * 0.15,
            },

            {
              range: "â‚¹16L â€“ â‚¹20L",
              rate: "20%",
              income: Math.max(0, Math.min(taxableNew, 2_000_000) - 1_600_000),
              tax:
                Math.max(0, Math.min(taxableNew, 2_000_000) - 1_600_000) * 0.2,
            },

            {
              range: "â‚¹20L â€“ â‚¹24L",
              rate: "25%",
              income: Math.max(0, Math.min(taxableNew, 2_400_000) - 2_000_000),
              tax:
                Math.max(0, Math.min(taxableNew, 2_400_000) - 2_000_000) * 0.25,
            },

            {
              range: "Above â‚¹24L",
              rate: "30%",
              income: Math.max(0, taxableNew - 2_400_000),
              tax: Math.max(0, taxableNew - 2_400_000) * 0.3,
            },
          ].filter((s) => s.income > 0)
        : [];

    return {
      grossTotal,
      taxableOld,
      taxableNew,
      taxOld,
      taxNew,
      chosen,
      saving,
      betterRegime,
      totalDeductions: chapterVIA,
      employerNpsDeduction,
      arrearsRelief: Math.min(
        toNum(taxSaving.arrearsRelief),
        taxSaving.regime === "old" ? taxOld : taxNew,
      ),
      professionalTax:
        taxSaving.regime === "old" ? professionalTaxOld : professionalTaxNew,
      retirementIncomeRelief:
        taxSaving.regime === "old" ? retirementReliefOld : retirementReliefNew,
      stdDeduction:
        taxSaving.regime === "old"
          ? oldStandardDeduction
          : newStandardDeduction,
      gamingTax,
      lotteryTax,
      totalTaxLiability,
      totalTaxPaid,
      refundOrDue,
      itrType,
      slabs,
    };
  }, [
    income,
    taxSaving,
    salaryEntries,
    personal.residentialStatus,
    personal.dob,
  ]);

  /* â”€â”€ Navigation â”€â”€ */

  const goNext = () => {
    if (step === 0) {
      const errs = validatePersonal();

      if (Object.keys(errs).length > 0) {
        setErrors(errs);

        window.scrollTo({ top: 0, behavior: "smooth" });

        return;
      }
    }

    setErrors({});

    setCompletedSteps((prev) => new Set([...prev, step]));

    setStep((s) => s + 1);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goBack = () => {
    setStep((s) => s - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ RENDER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      {/* <Navbar /> */}

      <main className="flex-1 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex gap-8 items-start">

            {/* â”€â”€ Left sidebar: step progress â”€â”€ */}
            <aside className="hidden md:block sticky top-8 self-start">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-6 py-8 w-64">
                <StepBar
                  current={step}
                  completedSteps={completedSteps}
                  onStepClick={(i) => {
                    setErrors({});
                    setStep(i);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                />
              </div>
            </aside>

            {/* â”€â”€ Right: form content â”€â”€ */}
            <div className="flex-1 min-w-0">

          {/* â”€â”€ DEV: Test Data Banner â”€â”€ */}

          {showTestBanner && (
            <div className="mb-6 border border-amber-300 bg-amber-50 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-amber-200">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black bg-amber-400 text-amber-900 px-2 py-0.5 rounded-full tracking-wide">
                    DEV
                  </span>

                  <span className="text-sm font-bold text-amber-900">
                    Test Data
                  </span>

                  <span className="text-xs text-amber-700">
                    â€” fill the whole form instantly to verify calculations
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setShowTestBanner(false)}
                  className="text-amber-500 hover:text-amber-700 transition-colors ml-2"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="flex flex-wrap gap-2 px-4 py-3">
                {TEST_SCENARIOS.map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => fillTestData(s)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-semibold text-amber-800 hover:bg-amber-100 hover:border-amber-400 transition-all shadow-sm"
                  >
                    <RefreshCw size={11} />

                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* â”€â”€ STEP 0 : PERSONAL INFO â”€â”€ */}

          {step === 0 && <Step0PersonalInfo personal={personal} handlePersonal={handlePersonal} errors={errors} bankAccounts={bankAccounts} addBankAccount={addBankAccount} removeBankAccount={removeBankAccount} updateBankAccount={updateBankAccount} setPersonal={setPersonal} setErrors={setErrors} showResidentialModal={showResidentialModal} setShowResidentialModal={setShowResidentialModal} />}

          {/* â”€â”€ STEP 1 : INCOME SOURCES â”€â”€ */}

          {step === 1 && <Step1IncomeSources income={income} handleIncome={handleIncome} setIncome={setIncome} salaryEntries={salaryEntries} editingSalaryId={editingSalaryId} setEditingSalaryId={setEditingSalaryId} addSalaryEntry={addSalaryEntry} removeSalaryEntry={removeSalaryEntry} updateSalaryEntry={updateSalaryEntry} hraModalEntryId={hraModalEntryId} setHraModalEntryId={setHraModalEntryId} taxSaving={taxSaving} personal={personal} />}

          {/* â”€â”€ STEP 2 : TAX SAVING â”€â”€ */}

          {step === 2 && <Step2TaxSaving taxSaving={taxSaving} handleTaxSaving={handleTaxSaving} income={income} tax={tax} personal={personal} />}

          {/* â”€â”€ STEP 3 : TAX SUMMARY â”€â”€ */}

          {step === 3 && <Step3TaxSummary tax={tax} taxSaving={taxSaving} income={income} personal={personal} navigate={navigate} />}

          {/* â”€â”€ Navigation buttons â”€â”€ */}

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

            </div>{/* end form content */}
          </div>{/* end flex row */}
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

            setErrors((currentErrors) => ({
              ...currentErrors,
              residentialStatus: "",
            }));

            setShowResidentialModal(false);
          }}
        />
      )}

      {/* Quick Calc floating panel */}

      <QuickCalc />
    </div>
  );
};

export default ITRFilingForm;
