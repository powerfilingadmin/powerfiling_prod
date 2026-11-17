import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

/**
 * Homepage "services" block.
 * - explains the main services in plain language (SEO audit point 1)
 * - gives every focused service page a crawlable, keyword-descriptive
 *   internal link (audit points 4 & 6)
 * Edit the text below freely; keep each link pointing at an existing route.
 */
const services = [
  {
    to: "/services/salary-basic-itr",
    title: "ITR Filing for Salaried Employees",
    text: "File ITR-1 or ITR-2 with Form 16, 80C/80D deductions and house property income.",
  },
  {
    to: "/services/capital-gain",
    title: "Capital Gains Tax Filing",
    text: "Report gains from shares, mutual funds and property with correct LTCG / STCG computation.",
  },
  {
    to: "/services/fo-trading",
    title: "F&O Trading Tax Filing",
    text: "Futures & options income, turnover and loss carry-forward reported correctly.",
  },
  {
    to: "/services/crypto-trading",
    title: "Crypto Tax Filing",
    text: "Virtual digital asset (VDA) gains reported with exchange statement reconciliation.",
  },
  {
    to: "/services/nri-income",
    title: "NRI & Foreign Income Tax Filing",
    text: "Residential status, DTAA benefits, foreign tax credit and Schedule FA reporting.",
  },
  {
    to: "/services/business-profession",
    title: "ITR for Business & Professionals",
    text: "ITR-3 / ITR-4 for business owners, freelancers and professionals, including presumptive taxation.",
  },
  {
    to: "/services/house-property",
    title: "House Property & Rental Income",
    text: "Rental income, home loan interest and multiple property reporting.",
  },
  {
    to: "/services/huf-filing",
    title: "HUF Income Tax Filing",
    text: "Income tax returns for Hindu Undivided Families, from property to investments.",
  },
];

const moreLinks = [
  { to: "/services/gst-registration", label: "GST Registration" },
  { to: "/services/company-registration", label: "Company Registration" },
  { to: "/services/llp-registration", label: "LLP Registration" },
  { to: "/services/gst-filing", label: "GST Return Filing" },
  { to: "/calculators/income-tax", label: "Income Tax Calculator" },
  { to: "/calculators/old-new-regime", label: "Old vs New Regime Calculator" },
  { to: "/blog", label: "Tax Guides" },
];

const HomeServicesSection = () => (
  <section className="py-12 bg-white" aria-labelledby="home-services-heading">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2
          id="home-services-heading"
          className="text-4xl font-extrabold text-slate-900 mb-4"
        >
          Online ITR Filing Services for Every Taxpayer
        </h2>
        <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
          PowerFiling helps you file your income tax return online in India,
          whether you earn a salary, trade in stocks, F&amp;O or crypto, run a
          business or live abroad as an NRI. Every return is prepared and
          reviewed by Chartered Accountants. Choose the service that matches
          your income:
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {services.map((s) => (
          <Link
            key={s.to}
            to={s.to}
            className="group bg-slate-50 border border-slate-100 rounded-2xl p-6 hover:bg-white hover:shadow-xl hover:border-blue-200 transition-all"
          >
            <h3 className="text-lg font-bold text-slate-900 mb-2">{s.title}</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              {s.text}
            </p>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 group-hover:gap-2 transition-all">
              View service <ArrowRight size={14} />
            </span>
          </Link>
        ))}
      </div>

      <nav
        aria-label="More services and tools"
        className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm"
      >
        <span className="font-semibold text-slate-500">Also explore:</span>
        {moreLinks.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            className="text-blue-600 font-medium hover:underline"
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </div>
  </section>
);

export default HomeServicesSection;
