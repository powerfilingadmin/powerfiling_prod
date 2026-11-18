import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { X, Sparkles, ArrowRight } from "lucide-react";

const DEFAULT_OFFERS = [
  {
    label: "Popular",
    badge: "bg-blue-100 text-blue-700",
    title: "File Your ITR Online",
    desc: "Hassle-free ITR filing by experts. Salary, Capital Gains, Business & more.",
    cta: "Start Filing — ₹999",
    path: "/services/salary-basic-itr",
  },
  {
    label: "Limited Offer",
    badge: "bg-blue-100 text-blue-700",
    title: "GST Registration in 3 Days",
    desc: "Get your GSTIN fast. Full document support included.",
    cta: "Register Now — ₹1,499",
    path: "/services/gst-registration",
  },
  {
    label: "New",
    badge: "bg-blue-100 text-blue-700",
    title: "Startup India Recognition",
    desc: "Unlock DPIIT recognition, tax exemptions & funding access for your startup.",
    cta: "Apply Now — ₹4,999",
    path: "/services/startup-india-registration",
  },
  {
    label: "Best Value",
    badge: "bg-blue-100 text-blue-700",
    title: "Company Registration",
    desc: "Incorporate your Pvt Ltd company with full MCA compliance setup.",
    cta: "Get Started — ₹6,999",
    path: "/services/company-registration",
  },
];

// Single vivid theme applied to every offer
const ACCENT = "from-blue-600 to-indigo-600";

/**
 * ScrollAdModal — compact floating ad (ET/TOI cube style)
 *
 * Props:
 *   triggerPercent  {number}  Scroll depth (0–100) to show. Default: 40
 *   offers          {Array}   Override default offers.
 *   rotateInterval  {number}  Ms between rotations. Default: 6000
 *   brandName       {string}  Footer label. Default: "Powerfiling"
 */
const ScrollAdModal = ({
  triggerPercent = 40,
  offers = DEFAULT_OFFERS,
  rotateInterval = 6000,
  brandName = "Powerfiling",
}) => {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (dismissed) return;
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(100, Math.round((scrollTop / docHeight) * 100)) : 0;
      if (progress >= triggerPercent) setShow(true);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [dismissed, triggerPercent]);

  useEffect(() => {
    if (!show || minimized) return;
    const id = setInterval(() => setIndex((prev) => (prev + 1) % offers.length), rotateInterval);
    return () => clearInterval(id);
  }, [show, minimized, offers.length, rotateInterval]);

  const dismiss = () => { setShow(false); setDismissed(true); };

  if (!show || dismissed) return null;

  const offer = offers[index];

  return (
    // w-56 = 224px — compact cube proportion
    <div className="fixed bottom-4 left-4 z-46 w-52 transition-all duration-500 opacity-100 translate-y-0">
      {minimized ? (
        /* ── Minimized pill ── */
        <button
          onClick={() => setMinimized(false)}
          className="flex items-center gap-1.5 bg-white border border-slate-200 shadow-md rounded-full px-3 py-2 text-xs font-semibold text-slate-700 hover:shadow-lg transition-all hover:scale-105"
        >
          <Sparkles size={12} className="text-blue-500" />
          Special Offers
          <span className="ml-0.5 w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
        </button>
      ) : (
        /* ── Compact card ── */
        <div className="bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden">

          {/* Gradient header */}
          <div className={`bg-gradient-to-r ${ACCENT} px-3 pt-3 pb-4`}>
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${offer.badge}`}>
                {offer.label}
              </span>
              <div className="flex items-center gap-0.5">
                <button
                  onClick={() => setMinimized(true)}
                  className="text-white/70 hover:text-white transition-colors p-0.5 rounded"
                  aria-label="Minimize"
                >
                  <span className="block w-3 h-0.5 bg-current rounded" />
                </button>
                <button
                  onClick={dismiss}
                  className="text-white/70 hover:text-white transition-colors p-0.5 rounded"
                  aria-label="Close ad"
                >
                  <X size={12} />
                </button>
              </div>
            </div>
            <h3 className="text-white font-bold text-sm mt-2 leading-snug">
              {offer.title}
            </h3>
          </div>

          {/* Body */}
          <div className="px-3 py-3">
            <p className="text-slate-500 text-[11px] leading-relaxed mb-3 line-clamp-2">
              {offer.desc}
            </p>

            <Link
              to={offer.path}
              onClick={dismiss}
              className={`flex items-center justify-between w-full bg-gradient-to-r ${ACCENT} text-white text-[11px] font-semibold px-3 py-2 rounded-lg hover:opacity-90 transition-opacity`}
            >
              {offer.cta}
              <ArrowRight size={11} />
            </Link>

            {/* Dot indicators */}
            <div className="flex items-center justify-center gap-1 mt-2.5">
              {offers.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  className={`rounded-full transition-all duration-300 ${
                    i === index
                      ? "w-3 h-1 bg-blue-500"
                      : "w-1 h-1 bg-slate-200 hover:bg-slate-300"
                  }`}
                  aria-label={`Show offer ${i + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="px-3 pb-2 pt-1.5 flex items-center justify-between border-t border-slate-100">
            <span className="text-[10px] text-slate-400">{brandName}</span>
            <button
              onClick={dismiss}
              className="text-[10px] text-slate-400 hover:text-slate-600 transition-colors"
            >
              Don't show again
            </button>
          </div>

        </div>
      )}
    </div>
  );
};

export default ScrollAdModal;
