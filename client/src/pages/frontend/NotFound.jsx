import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

const links = [
  { to: "/services/individual", label: "Individual ITR Filing" },
  { to: "/services/business", label: "Business ITR Filing" },
  { to: "/calculators", label: "Tax Calculators" },
  { to: "/blog", label: "Tax Guides" },
  { to: "/contact", label: "Contact Us" },
];

/** Shown for unknown URLs. RouteSEO adds <meta name="robots" content="noindex">. */
const NotFound = () => (
  <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
    <Navbar />
    <main className="flex-1 flex items-center justify-center px-4 py-20">
      <div className="text-center max-w-xl">
        <h1 style={{fontSize:"56px"}} className="text-blue-600 font-bold mb-2">404</h1>
        <h2 className="text-4xl font-extrabold mb-4">Page not found</h2>
        <p className="text-slate-600 mb-8">
          The page you are looking for does not exist or has moved. Try one of
          these instead:
        </p>
        <ul className="flex flex-wrap justify-center gap-3">
          {links.map((l) => (
            <li key={l.to}>
              <Link
                to={l.to}
                className="inline-block bg-white border border-slate-200 px-5 py-2.5 rounded-xl font-semibold text-blue-700 hover:bg-blue-50"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <Link
          to="/"
          className="inline-block mt-8 bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700"
        >
          Go to Homepage
        </Link>
      </div>
    </main>
    <Footer />
  </div>
);

export default NotFound;
