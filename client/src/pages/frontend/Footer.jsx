import { Mail, Phone, MapPin, X, Linkedin, Instagram, Facebook, Youtube } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400">

      {/* Main Footer Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">

          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <img src="/favicon-32x32.png" alt="Powerfiling" className="w-8 h-8 rounded-lg" />
              <span className="text-xl font-bold text-white tracking-tight">Powerfiling</span>
            </div>
            <p className="text-sm leading-relaxed text-slate-400 max-w-xs">
              India's trusted platform for ITR filing, GST registration, company incorporation, and compliance — backed by expert CAs.
            </p>

            {/* Social Proof */}
            {/* <div className="flex flex-wrap gap-3 pt-1">
              <div className="bg-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                ⭐ 4.9/5 Rating
              </div>
              <div className="bg-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                ✅ CA Verified
              </div>
              <div className="bg-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                🔒 SSL Secured
              </div>
            </div> */}

            {/* Social Links */}
            <div className="flex items-center gap-3 pt-1">
              <a href="https://x.com/PowerFiling" target="_blank" aria-label="Twitter" className="w-9 h-9 bg-slate-800 hover:bg-blue-600 rounded-xl flex items-center justify-center transition-colors">
                <X size={15} />
              </a>
              <a href="http://www.linkedin.com/in/powerfiling" target="_blank" aria-label="LinkedIn" className="w-9 h-9 bg-slate-800 hover:bg-blue-600 rounded-xl flex items-center justify-center transition-colors">
                <Linkedin size={15} />
              </a>
              <a href="https://www.instagram.com/powerfiling?igsh=MWVib2YxemVkcHNycw%3D%3D&utm_source=qr" target="_blank" aria-label="Instagram" className="w-9 h-9 bg-slate-800 hover:bg-pink-600 rounded-xl flex items-center justify-center transition-colors">
                <Instagram size={15} />
              </a>
              <a href="https://www.facebook.com/share/1bdA8jcc6n/?mibextid=wwXIfr" target="_blank" aria-label="Facebook" className="w-9 h-9 bg-slate-800 hover:bg-blue-700 rounded-xl flex items-center justify-center transition-colors">
                <Facebook size={15} />
              </a>
              {/* <a href="#" aria-label="YouTube" className="w-9 h-9 bg-slate-800 hover:bg-red-600 rounded-xl flex items-center justify-center transition-colors">
                <Youtube size={15} />
              </a> */}
            </div>
          </div>

          {/* Popular Services */}
          <div className="space-y-4">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider">Popular Services</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { label: "Individual ITR Filing", to: "/services/individual" },
                { label: "Business ITR Filing", to: "/services/business" },
                { label: "LLP Registration", to: "/services/llp-registration" },
                { label: "TDS Filing", to: "/services/tds-filing" },
              ].map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Policies */}
          <div className="space-y-4">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider">Legal</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { label: "Privacy Policy", to: "/privacy-policy" },
                { label: "Refund Policy", to: "/refund" },
                { label: "Disclaimer", to: "/disclaimer" },
                { label: "Security", to: "/security" },
                { label: "Terms & Conditions", to: "/terms" }
              ].map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="mailto:support@powerfiling.com" className="flex items-start gap-2.5 hover:text-white transition-colors">
                  <Mail size={14} className="mt-0.5 flex-shrink-0 text-blue-400" />
                  support@powerfiling.com
                </a>
              </li>
              <li>
                <a href="tel:+919876543210" className="flex items-start gap-2.5 hover:text-white transition-colors">
                  <Phone size={14} className="mt-0.5 flex-shrink-0 text-blue-400" />
                  +91 97847 99904
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin size={14} className="mt-0.5 flex-shrink-0 text-blue-400" />
                <div>
                    <p className="font-bold text-slate-400">Address</p>
                    <p className="text-slate-600 text-sm">
                      Jtm Mall, FF25, Jagatpura Rd, near Jagatpura Flyover, Model Town,
                      Malviya Nagar, Jaipur, Rajasthan 302017
                    </p>
                  </div>
              </li>
            </ul>

            {/* Legal Compliance Badges */}
            {/* <div className="pt-3 space-y-2">
              <h5 className="text-white font-bold text-xs uppercase tracking-wider mb-2">Compliance</h5>
              <div className="flex flex-wrap gap-2">
                <span className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-300 flex items-center gap-1">
                  <ShieldCheck size={11} className="text-green-400" /> ISO 27001
                </span>
                <span className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-300 flex items-center gap-1">
                  <Lock size={11} className="text-blue-400" /> 256-bit SSL
                </span>
                <span className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-300">
                  🇮🇳 DPDP Compliant
                </span>
                <span className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-300">
                  📋 ICAI Registered
                </span>
              </div>
            </div> */}
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-500">
          <p>© 2026 Powerfiling Pvt. Ltd. All rights reserved. Designed for Indian Taxpayers.</p>
          <div className="flex items-center gap-4">
            <Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link to="/refund" className="hover:text-white transition-colors">Refunds</Link>
            <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
            
          </div>
        </div>
      </div>

    </footer>
  );
};

export default Footer;
