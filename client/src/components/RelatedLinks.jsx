import { Link } from "react-router-dom";

/**
 * "Related services & tools" block for service pages.
 * Gives each service page contextual internal links (SEO audit point 6).
 * Add / change relations in RELATED – keys are service ids or calculator paths.
 */
const LINKS = {
  "salary-basic-itr": { to: "/services/salary-basic-itr", label: "ITR-1 Filing for Salaried Employees" },
  "salary-premium": { to: "/services/salary-premium", label: "ITR-2 Filing (Salary + Investments)" },
  "capital-gain": { to: "/services/capital-gain", label: "Capital Gains Tax Filing" },
  "nri-income": { to: "/services/nri-income", label: "NRI Income Tax Filing" },
  "business-profession": { to: "/services/business-profession", label: "ITR for Business & Professionals" },
  "fo-trading": { to: "/services/fo-trading", label: "F&O Trading Tax Filing" },
  "house-property": { to: "/services/house-property", label: "House Property & Rental Income ITR" },
  "crypto-trading": { to: "/services/crypto-trading", label: "Crypto Tax Filing" },
  "huf-filing": { to: "/services/huf-filing", label: "HUF Income Tax Filing" },
  "gst-registration": { to: "/services/gst-registration", label: "GST Registration" },
  "huf-registration": { to: "/services/huf-registration", label: "HUF Registration" },
  "company-registration": { to: "/services/company-registration", label: "Private Limited Company Registration" },
  "llp-registration": { to: "/services/llp-registration", label: "LLP Registration" },
  "gst-filing": { to: "/services/gst-filing", label: "GST Return Filing" },
  "roc-filing": { to: "/services/roc-filing", label: "ROC Filing" },
  "annual-compliance-filing": { to: "/services/annual-compliance-filing", label: "Annual Compliance Filing" },
  dsc: { to: "/services/dsc", label: "Digital Signature Certificate (DSC)" },
  "startup-india-registration": { to: "/services/startup-india-registration", label: "Startup India Registration" },
  "blog-notice": { to: "/blog/how-to-respond-to-income-tax-notice", label: "How to Respond to an Income Tax Notice" },
  "calc-income-tax": { to: "/calculators/income-tax", label: "Income Tax Calculator" },
  "calc-regime": { to: "/calculators/old-new-regime", label: "Old vs New Regime Calculator" },
  "calc-capital-gain": { to: "/calculators/capital-gain-tax", label: "Capital Gains Tax Calculator" },
  "calc-tds": { to: "/calculators/tds-calculator", label: "TDS Calculator" },
  "calc-home-loan": { to: "/calculators/home-loan-emi", label: "Home Loan EMI Calculator" },
};

const RELATED = {
  "salary-basic-itr": ["salary-premium", "calc-regime", "calc-income-tax", "house-property", "blog-notice"],
  "salary-premium": ["salary-basic-itr", "capital-gain", "house-property", "calc-regime", "blog-notice"],
  "capital-gain": ["calc-capital-gain", "fo-trading", "crypto-trading", "salary-premium", "blog-notice"],
  "nri-income": ["capital-gain", "house-property", "salary-premium", "calc-income-tax", "blog-notice"],
  "business-profession": ["fo-trading", "gst-registration", "gst-filing", "calc-income-tax", "blog-notice"],
  "fo-trading": ["capital-gain", "business-profession", "crypto-trading", "calc-capital-gain", "blog-notice"],
  "house-property": ["salary-premium", "capital-gain", "calc-home-loan", "calc-income-tax"],
  "crypto-trading": ["capital-gain", "fo-trading", "salary-premium", "calc-income-tax"],
  "huf-filing": ["huf-registration", "house-property", "capital-gain", "calc-income-tax"],
  "gst-registration": ["gst-filing", "company-registration", "llp-registration", "business-profession"],
  "huf-registration": ["huf-filing", "gst-registration", "house-property"],
  "company-registration": ["dsc", "llp-registration", "gst-registration", "annual-compliance-filing", "startup-india-registration"],
  "llp-registration": ["dsc", "company-registration", "gst-registration", "annual-compliance-filing"],
  "gst-filing": ["gst-registration", "business-profession", "annual-compliance-filing"],
  "tds-filing": ["house-property", "capital-gain", "calc-tds"],
  "pf-esic": ["company-registration", "gst-registration", "annual-compliance-filing"],
  "roc-filing": ["annual-compliance-filing", "dsc", "company-registration", "llp-registration"],
  "annual-compliance-filing": ["roc-filing", "dsc", "company-registration", "llp-registration"],
  dsc: ["company-registration", "llp-registration", "roc-filing"],
  "startup-india-registration": ["company-registration", "llp-registration", "annual-compliance-filing"],
};

const RelatedLinks = ({ serviceId }) => {
  const items = (RELATED[serviceId] || []).map((k) => LINKS[k]).filter(Boolean);
  if (items.length === 0) return null;

  return (
    <section
      aria-labelledby="related-services-heading"
      className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 mb-8"
    >
      <h2
        id="related-services-heading"
        className="text-xl font-extrabold text-slate-900 mb-5"
      >
        Related Services & Tools
      </h2>
      <ul className="grid sm:grid-cols-2 gap-3">
        {items.map((item) => (
          <li key={item.to}>
            <Link
              to={item.to}
              className="block p-3 bg-slate-50 rounded-xl border border-slate-100 text-sm font-semibold text-blue-700 hover:border-blue-200 hover:bg-blue-50 transition-colors"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default RelatedLinks;
