import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  CheckCircle2,
  ShieldCheck,
  Star,
  ArrowRight,
  FileText,
  Zap,
  Clock,
  Award,
  ChevronRight,
  CheckCheck,
  AlertCircle,
  RefreshCw,
  Landmark,
  BadgeCheck,
  IndianRupee,
  Users,
  Lock,
  Sparkles,
} from "lucide-react";
import Navbar from "./frontend/Navbar";
import Footer from "./frontend/Footer";
import { useAuth } from "../context/AuthContext";

/* ─────────────── tiny animated counter ─────────────── */
const Counter = ({ target, suffix = "", duration = 1800 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const steps = 60;
          const increment = target / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return (
    <span ref={ref}>
      {count.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
};

/* ─────────────── floating card for hero ─────────────── */
const HeroInfoCard = () => (
  <div className="relative w-full max-w-sm mx-auto lg:mx-0">
    {/* Rotating accuracy ring */}
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
      <div
        className="w-72 h-72 rounded-full border-2 border-dashed border-blue-200 opacity-60"
        style={{ animation: "spin 20s linear infinite" }}
      />
      {["100% ACCURACY", "100% ACCURACY", "100% ACCURACY"].map((text, i) => (
        <span
          key={i}
          className="absolute text-[10px] font-bold text-blue-300 tracking-widest"
          style={{
            transform: `rotate(${i * 120}deg) translateY(-140px) rotate(${-(i * 120)}deg)`,
          }}
        >
          {text} •
        </span>
      ))}
    </div>

    {/* Main card */}
    <div className="relative bg-white rounded-3xl shadow-2xl shadow-blue-100/60 p-8 border border-slate-100 z-10">
      {/* Accuracy badge */}
      <div className="text-center mb-6 pb-5 border-b border-slate-100">
        <p className="text-5xl font-black text-slate-900 mb-1">100%</p>
        <p className="text-sm font-bold text-slate-700">Accurate and notice</p>
        <p className="text-sm font-bold text-slate-700">protected</p>
        <p className="text-xs text-slate-400 mt-2">Everything auto fetched no manual entry</p>
      </div>

      {/* Status rows */}
      {[
        { label: "FORM 16", status: "AUTO FILLED", color: "text-blue-600 bg-blue-50" },
        { label: "Verified with AIS", status: "VERIFIED", color: "text-emerald-600 bg-emerald-50" },
        { label: "Verified with 26AS", status: "VERIFIED", color: "text-emerald-600 bg-emerald-50" },
      ].map((row) => (
        <div
          key={row.label}
          className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0"
        >
          <span className="text-sm font-semibold text-slate-700">{row.label}</span>
          <span
            className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${row.color}`}
          >
            {row.status}
          </span>
        </div>
      ))}
    </div>

    {/* Notice protect badge */}
    <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl shadow-lg border border-slate-100 px-4 py-2 flex items-center gap-2 z-20">
      <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
        <ShieldCheck size={14} className="text-white" />
      </div>
      <div>
        <p className="text-[10px] font-black text-blue-600 uppercase tracking-wide">Notice Protect</p>
        <p className="text-[10px] text-slate-500">Free notice handling</p>
      </div>
    </div>
  </div>
);

/* ─────────────── main page ─────────────── */
const SelfFilingPage = () => {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);

  // Auto-cycle steps in "How it works"
  useEffect(() => {
    const t = setInterval(() => setActiveStep((p) => (p + 1) % 4), 3000);
    return () => clearInterval(t);
  }, []);

  const stats = [
    { value: 8, suffix: "M+", label: "Happy Filers" },
    { value: 99, suffix: "%", label: "Accuracy Rate" },
    { value: 15, suffix: "min", label: "Avg. Time to File" },
    { value: 50000, suffix: "+", label: "CAs & Tax Experts" },
  ];

  const steps = [
    {
      icon: <FileText size={24} />,
      title: "Enter Basic Details",
      desc: "PAN, Aadhaar & personal info — pre-filled wherever possible.",
    },
    {
      icon: <Zap size={24} />,
      title: "Auto-Fetch Income Data",
      desc: "We pull Form 16, AIS & 26AS directly from the IT portal.",
    },
    {
      icon: <ShieldCheck size={24} />,
      title: "Review & Optimise",
      desc: "Our engine checks deductions & compares old vs new regime for max refund.",
    },
    {
      icon: <CheckCheck size={24} />,
      title: "e-File & e-Verify",
      desc: "One click files your return. e-Verify instantly via Aadhaar OTP.",
    },
  ];

  const features = [
    {
      icon: <Zap size={20} className="text-blue-600" />,
      title: "Smart Auto-Fill",
      desc: "Pre-populated from Form 16, AIS and 26AS. Zero manual data entry.",
    },
    {
      icon: <IndianRupee size={20} className="text-emerald-600" />,
      title: "Maximum Refund Guaranteed",
      desc: "AI-driven deduction check across 80C, 80D, HRA, LTA & more.",
    },
    {
      icon: <ShieldCheck size={20} className="text-violet-600" />,
      title: "Notice Protection",
      desc: "Get a notice? We handle it free. Computation error? 100% Refund.",
    },
    {
      icon: <Clock size={20} className="text-orange-500" />,
      title: "File in Under 15 Min",
      desc: "Fastest ITR filing experience — simple returns done in minutes.",
    },
    {
      icon: <BadgeCheck size={20} className="text-blue-600" />,
      title: "CA-Reviewed Filing",
      desc: "Every return reviewed by a qualified CA before submission.",
    },
    {
      icon: <Lock size={20} className="text-slate-600" />,
      title: "Bank-Grade Security",
      desc: "256-bit SSL encryption. Your data is always private and protected.",
    },
  ];

  const incomeCategories = [
    {
      icon: "💼",
      label: "Salaried",
      sub: "Form 16 / Salary slip",
      plan: "salary-basic-itr",
      badge: "Most Popular",
      badgeColor: "bg-blue-600",
    },
    {
      icon: "📈",
      label: "Capital Gains",
      sub: "Stocks, MF & Property",
      plan: "capital-gain",
      badge: "New Regime Ready",
      badgeColor: "bg-emerald-600",
    },
    {
      icon: "🏢",
      label: "Business / Freelance",
      sub: "ITR-3 / ITR-4",
      plan: null,
      badge: "Presumptive Tax",
      badgeColor: "bg-violet-600",
    },
    {
      icon: "🌏",
      label: "NRI / Foreign Income",
      sub: "DTAA & FEMA",
      plan: "nri-income",
      badge: "Expert Guided",
      badgeColor: "bg-orange-500",
    },
  ];

  const testimonials = [
    {
      name: "Priya S.",
      role: "Software Engineer",
      text: "Filed my ITR with capital gains in under 20 minutes. Everything was auto-filled — I just reviewed and submitted.",
      rating: 5,
      avatar: "PS",
    },
    {
      name: "Rahul M.",
      role: "Business Owner",
      text: "The CA review gave me confidence. Saved ₹18,000 in taxes with deductions I didn't even know I had.",
      rating: 5,
      avatar: "RM",
    },
    {
      name: "Anjali D.",
      role: "NRI Professional",
      text: "DTAA filing for NRIs is complex. Powerfiling made it completely stress-free. Highly recommended.",
      rating: 5,
      avatar: "AD",
    },
  ];

  const faqs = [
    {
      q: "Is self-filing really free?",
      a: "Yes — basic salaried ITR-1 filing is free. For complex returns (capital gains, NRI, business income), we charge a small fee that covers expert CA review and notice protection.",
    },
    {
      q: "How does auto-fill work?",
      a: "We connect to the Income Tax portal and pull your Form 16, AIS, and 26AS data automatically. No manual entry needed for most income sources.",
    },
    {
      q: "What if I receive a notice after filing?",
      a: "Our Notice Protect cover handles any notice related to a return we filed — completely free. Computation errors get a 100% refund.",
    },
    {
      q: "Can I switch between old and new tax regimes?",
      a: "Absolutely. Our tax engine computes your liability under both regimes and recommends the one that gives you the highest refund.",
    },
  ];

  const [openFaq, setOpenFaq] = useState(null);

  const handleStartFiling = () => {
    navigate("/itr-filing/form");
  };

  return (
    <>
      <Helmet>
        <title>File ITR Online in Minutes | 100% Accuracy | Powerfiling</title>
        <meta
          name="description"
          content="File your income tax return online with 100% accuracy. Auto-fetch from Form 16, AIS & 26AS. Maximum refund guaranteed. Expert CA review. Start filing for free."
        />
        <meta
          name="keywords"
          content="file ITR online, ITR filing, income tax return, self filing ITR, Form 16, AIS, 26AS, tax refund, CA filing"
        />
      </Helmet>

      <div className="flex flex-col min-h-screen bg-white font-sans text-slate-900">
        <Navbar />

        {/* ── HERO ── */}
        <section className="relative pt-12 pb-20 lg:pt-16 lg:pb-24 overflow-hidden"
          style={{ background: "linear-gradient(135deg, #f0f4ff 0%, #fafbff 50%, #f0f9ff 100%)" }}>
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

              {/* Left copy */}
              <div className="flex-1 text-center lg:text-left">
                {/* Social proof pill */}
                <div className="inline-flex items-center gap-3 bg-white border border-slate-200 rounded-full px-5 py-2 shadow-sm mb-8">
                  <div className="flex -space-x-1">
                    {["bg-blue-500", "bg-emerald-500", "bg-violet-500"].map((c, i) => (
                      <div key={i} className={`w-6 h-6 ${c} rounded-full border-2 border-white`} />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-slate-700">8M+ Users</span>
                  <span className="text-slate-300">|</span>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} className="fill-yellow-400 text-yellow-400" />
                    ))}
                    <span className="text-sm font-bold text-slate-700 ml-1">4.6</span>
                  </div>
                  <span className="text-xs text-blue-600 font-semibold underline cursor-pointer">
                    See reviews
                  </span>
                </div>

                {/* Headline */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.08] mb-6">
                  File your ITR in{" "}
                  <span className="relative inline-block">
                    minutes
                    <span className="absolute -bottom-1 left-0 w-full h-1 bg-blue-200 rounded-full" />
                  </span>{" "}
                  with{" "}
                  <span className="text-blue-600">100% Accuracy</span>
                </h1>

                {/* Max refund badge */}
                <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl px-5 py-3 mb-8 text-sm font-bold">
                  <Award size={16} className="text-emerald-600 flex-shrink-0" />
                  Maximum Tax Refund,{" "}
                  <span className="text-emerald-600">Guaranteed</span>
                </div>

                {/* CTA button */}
                <div className="flex flex-col sm:flex-row items-center lg:items-start gap-4 mb-8">
                  <button
                    onClick={handleStartFiling}
                    className="animate-float w-full sm:w-auto bg-blue-600 text-white px-10 py-4 rounded-2xl text-lg font-bold flex items-center justify-center gap-2 shadow-[0_8px_30px_rgba(37,99,235,0.45)] hover:shadow-[0_12px_40px_rgba(37,99,235,0.65)] hover:bg-blue-700 transition-all duration-300 transform hover:-translate-y-1"
                  >
                    Start Filing For Free <ArrowRight size={20} />
                  </button>
                  <Link
                    to="/calculators/income-tax"
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border-2 border-slate-200 text-slate-700 font-bold hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 text-sm"
                  >
                    <IndianRupee size={16} />
                    Calculate Tax First
                  </Link>
                </div>

                {/* Notice protect strip */}
                <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-5 py-3 shadow-sm w-fit mx-auto lg:mx-0">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <ShieldCheck size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-blue-600 uppercase tracking-widest leading-none mb-0.5">
                      Powerfiling Notice Protect
                    </p>
                    <p className="text-xs text-slate-500">
                      Received a notice?{" "}
                      <span className="font-bold text-slate-700">We Handle It Free</span>{" "}
                      · Computation Error?{" "}
                      <span className="font-bold text-slate-700">100% Refund.</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Right card */}
              <div className="flex-shrink-0 w-full lg:w-auto flex justify-center">
                <HeroInfoCard />
              </div>
            </div>
          </div>

          {/* BG blobs */}
          <div className="absolute top-0 right-0 w-[40%] h-[120%] bg-gradient-to-bl from-blue-50 via-transparent to-transparent -z-0 pointer-events-none" />
          <div className="absolute -bottom-10 left-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-50 -z-0 pointer-events-none" />
        </section>

        {/* ── STATS BAR ── */}
        <section className="py-10 bg-slate-900">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {stats.map((s, i) => (
                <div key={i} className="text-white">
                  <p className="text-3xl lg:text-4xl font-black mb-1">
                    <Counter target={s.value} suffix={s.suffix} />
                  </p>
                  <p className="text-slate-400 text-sm font-medium">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── WHO SHOULD FILE ── */}
        <section className="py-20 bg-white">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <p className="text-blue-600 font-bold text-sm uppercase tracking-widest mb-3">
                Pick Your Category
              </p>
              <h2 className="text-4xl font-extrabold text-slate-900 mb-4">
                Who are you filing for?
              </h2>
              <p className="text-slate-500 max-w-xl mx-auto text-lg">
                Choose your income profile and we'll guide you to the right ITR form — instantly.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {incomeCategories.map((cat, i) => (
                <Link
                  key={i}
                  to={cat.plan ? `/services/${cat.plan}` : "/services/individual"}
                  className="group relative bg-white border-2 border-slate-100 rounded-3xl p-7 flex flex-col items-center text-center hover:border-blue-400 hover:shadow-xl hover:shadow-blue-50 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer"
                >
                  <span
                    className={`absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-black text-white px-3 py-1 rounded-full uppercase tracking-widest whitespace-nowrap ${cat.badgeColor}`}
                  >
                    {cat.badge}
                  </span>
                  <div className="text-4xl mb-4 mt-2">{cat.icon}</div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">{cat.label}</h3>
                  <p className="text-sm text-slate-500 mb-5">{cat.sub}</p>
                  <div className="flex items-center gap-1 text-blue-600 font-bold text-sm group-hover:gap-2 transition-all">
                    Start Filing <ChevronRight size={16} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="py-20 bg-slate-50 border-y border-slate-100">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <p className="text-blue-600 font-bold text-sm uppercase tracking-widest mb-3">
                Super Simple
              </p>
              <h2 className="text-4xl font-extrabold text-slate-900">
                File your ITR in 4 steps
              </h2>
            </div>

            <div className="grid md:grid-cols-4 gap-4 relative">
              {/* Connector line (desktop) */}
              <div className="hidden md:block absolute top-12 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-blue-100 via-blue-300 to-blue-100 z-0" />

              {steps.map((step, i) => (
                <button
                  key={i}
                  onClick={() => setActiveStep(i)}
                  className={`relative text-center p-7 rounded-3xl border-2 transition-all duration-400 cursor-pointer z-10 ${
                    activeStep === i
                      ? "border-blue-500 bg-white shadow-xl shadow-blue-100/60 -translate-y-1"
                      : "border-transparent bg-white hover:border-slate-200 hover:shadow-md"
                  }`}
                >
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 transition-all duration-300 ${
                      activeStep === i
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                        : "bg-blue-50 text-blue-500"
                    }`}
                  >
                    {step.icon}
                  </div>
                  <div
                    className={`text-xs font-black uppercase tracking-widest mb-2 transition-colors ${
                      activeStep === i ? "text-blue-600" : "text-slate-400"
                    }`}
                  >
                    Step {i + 1}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
                </button>
              ))}
            </div>

            <div className="text-center mt-12">
              <button
                onClick={handleStartFiling}
                className="bg-blue-600 text-white px-10 py-4 rounded-2xl text-base font-bold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform inline-flex items-center gap-2"
              >
                Start Your Free Filing <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </section>

        {/* ── FEATURES GRID ── */}
        <section className="py-20 bg-white">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <p className="text-blue-600 font-bold text-sm uppercase tracking-widest mb-3">
                Why Powerfiling
              </p>
              <h2 className="text-4xl font-extrabold text-slate-900">
                Everything you need for stress-free filing
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
              {features.map((f, i) => (
                <div
                  key={i}
                  className="bg-slate-50/60 border border-slate-100 rounded-3xl p-8 hover:bg-white hover:shadow-lg hover:shadow-slate-100 hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className="w-11 h-11 bg-white rounded-2xl flex items-center justify-center mb-5 shadow-sm border border-slate-100 group-hover:scale-110 transition-transform duration-300">
                    {f.icon}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{f.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── COMPARISON BANNER ── */}
        <section className="py-16 bg-blue-600">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
              {/* Left copy */}
              <div className="text-white text-center lg:text-left">
                <div className="flex items-center gap-2 mb-4 justify-center lg:justify-start">
                  <Sparkles size={18} className="text-yellow-300" />
                  <span className="text-yellow-300 font-bold text-sm uppercase tracking-widest">
                    Old vs New Regime
                  </span>
                </div>
                <h2 className="text-3xl lg:text-4xl font-extrabold mb-4 leading-tight">
                  Not sure which tax regime
                  <br />
                  saves you more?
                </h2>
                <p className="text-blue-100 text-lg mb-8 max-w-lg">
                  Our tax engine auto-calculates both regimes and picks the one that puts more money back in your pocket.
                </p>
                <Link
                  to="/calculators/old-new-regime"
                  className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-2xl font-bold text-sm hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform"
                >
                  Compare Regimes Free <ArrowRight size={16} />
                </Link>
              </div>

              {/* Right visual */}
              <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                {[
                  { regime: "Old Regime", tax: "₹1,24,800", highlight: false },
                  { regime: "New Regime", tax: "₹98,800", highlight: true, saving: "Save ₹26,000" },
                ].map((item, i) => (
                  <div
                    key={i}
                    className={`rounded-2xl p-6 text-center ${
                      item.highlight
                        ? "bg-white text-slate-900"
                        : "bg-blue-700/60 text-white border border-blue-500"
                    }`}
                  >
                    <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${item.highlight ? "text-blue-600" : "text-blue-200"}`}>
                      {item.regime}
                    </p>
                    <p className={`text-2xl font-black mb-2 ${item.highlight ? "text-slate-900" : "text-white"}`}>
                      {item.tax}
                    </p>
                    {item.saving && (
                      <span className="text-[11px] font-black bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full">
                        {item.saving} 🎉
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section className="py-20 bg-white">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <p className="text-blue-600 font-bold text-sm uppercase tracking-widest mb-3">
                Real Stories
              </p>
              <h2 className="text-4xl font-extrabold text-slate-900">
                Taxpayers love Powerfiling
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((t, i) => (
                <div
                  key={i}
                  className="bg-slate-50 border border-slate-100 rounded-3xl p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-200">
                      {t.avatar}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{t.name}</p>
                      <p className="text-xs text-slate-500">{t.role}</p>
                    </div>
                  </div>
                  <div className="flex mb-4">
                    {[...Array(t.rating)].map((_, j) => (
                      <Star key={j} size={14} className="fill-yellow-400 text-yellow-400 mr-0.5" />
                    ))}
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed italic">"{t.text}"</p>
                </div>
              ))}
            </div>

            <div className="text-center mt-12 flex flex-col items-center gap-3">
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <Users size={16} />
                <span>Trusted by <strong className="text-slate-900">8 million+ taxpayers</strong> across India</span>
              </div>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
                ))}
                <span className="text-slate-700 font-bold ml-2">4.6 / 5.0</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="py-20 bg-slate-50 border-t border-slate-100">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <p className="text-blue-600 font-bold text-sm uppercase tracking-widest mb-3">FAQ</p>
              <h2 className="text-4xl font-extrabold text-slate-900">Common questions</h2>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <div
                  key={i}
                  className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${
                    openFaq === i ? "border-blue-300 shadow-md" : "border-slate-100 hover:border-slate-200"
                  }`}
                >
                  <button
                    className="w-full flex items-center justify-between p-6 text-left"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    <span className="font-bold text-slate-900 text-sm pr-4">{faq.q}</span>
                    <ChevronRight
                      size={18}
                      className={`flex-shrink-0 text-slate-400 transition-transform duration-300 ${
                        openFaq === i ? "rotate-90 text-blue-600" : ""
                      }`}
                    />
                  </button>
                  {openFaq === i && (
                    <div className="px-6 pb-6">
                      <p className="text-slate-600 text-sm leading-relaxed">{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section className="py-20 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-[2.5rem] p-12 shadow-2xl shadow-blue-200/60 relative overflow-hidden">
              {/* bg decor */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

              <div className="relative z-10">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Landmark size={28} className="text-white" />
                </div>
                <h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-4">
                  Ready to file your ITR?
                </h2>
                <p className="text-blue-100 text-lg mb-8 max-w-md mx-auto">
                  Join 8M+ filers who trust Powerfiling for accurate, fast and hassle-free tax filing.
                </p>
                <button
                  onClick={handleStartFiling}
                  className="bg-white text-blue-600 px-12 py-4 rounded-2xl font-extrabold text-lg hover:bg-blue-50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 transform inline-flex items-center gap-2"
                >
                  Start Filing For Free <ArrowRight size={20} />
                </button>
                <p className="text-blue-200 text-xs mt-5 flex items-center justify-center gap-2">
                  <Lock size={12} /> Secure · No hidden charges · CA-verified
                </p>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>

      {/* Spin keyframe for the accuracy ring */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
};

export default SelfFilingPage;
