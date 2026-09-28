import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  Menu,
  X,
  User,
  Building2,
  FileCheck,
  Calculator,
  Building,
  Receipt,
  CreditCard,
  Shield,
  Users,
  LogOut,
  LayoutDashboard,
  BookOpen,
  FileBadge,
  PenLine,
  Rocket,
  TrendingUp,
  Home,
  Car,
  Wallet,
  Scale,
  Briefcase,
  Percent,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";


const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { isLoggedIn, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navigationItems = [
    {
      title: "Income Tax Return",
      icon: <Calculator size={16} />,
      sections: [
        {
          // title: "ITR Filing Services",
          // icon: <User size={14} />,
          items: [
            {
              name: "Individual",
              icon: <User size={14} />,
              path: "/services/individual",
            },
            {
              name: "Business",
              icon: <Building2 size={14} />,
              path: "/services/business",
            },
          ],
        },
      ],
    },
    {
      title: "Registration",
      icon: <FileCheck size={16} />,
      sections: [
        {
          title: "Business Registration",
          items: [
            {
              name: "GST Registration",
              icon: <Receipt size={14} />,
              path: "/services/gst-registration",
            },
            {
              name: "HUF Registration",
              icon: <Users size={14} />,
              path: "/services/huf-registration",
            },
            {
              name: "Company Registration",
              icon: <Building size={14} />,
              path: "/services/company-registration",
            },
            {
              name: "LLP Registration",
              icon: <Building2 size={14} />,
              path: "/services/llp-registration",
            },
          ],
        },
        {
          title: "Other Filings",
          items: [
            {
              name: "GST Filing",
              icon: <Receipt size={14} />,
              path: "/services/gst-filing",
            },
            {
              name: "TDS Filing",
              icon: <CreditCard size={14} />,
              path: "/services/tds-filing",
            },
            {
              name: "PF & ESIC",
              icon: <Shield size={14} />,
              path: "/services/pf-esic",
            },
            // {
            //   name: "Test Production Plan",
            //   icon: <Shield size={14} />,
            //   path: "/services/test-production-plan",
            // },
            {
              name:"ROC Filing",
              icon: <FileBadge size={14} />,
              path: "/services/roc-filing",
            },
            {
              name:"Digital Signature Certificate",
              icon: <PenLine size={14} />,
              path: "/services/dsc",
            },
            {
              name:"Startup India Registration",
              icon: <Rocket size={14} />,
              path: "/services/startup-india-registration",
            },
            {
              name:"Annual Compliance Filing",
              icon: <FileBadge size={14} />,
              path: "/services/annual-compliance-filing",
            }
          ],
        },
      ],
    },
    {
      title: "Calculators",
      icon: <Calculator size={16} />,
      hubPath: "/calculators",
      sections: [
        {
          title: "Tax Calculators",
          items: [
            { name: "Income Tax", icon: <Calculator size={14} />, path: "/calculators/income-tax" },
            { name: "Old vs New Regime", icon: <Scale size={14} />, path: "/calculators/old-new-regime" },
            { name: "Salary Tax", icon: <Briefcase size={14} />, path: "/calculators/salary-tax" },
            { name: "Capital Gains Tax", icon: <TrendingUp size={14} />, path: "/calculators/capital-gain-tax" },
            { name: "HRA Calculator", icon: <Percent size={14} />, path: "/calculators/hra-calculator" },
            { name: "TDS Calculator", icon: <Receipt size={14} />, path: "/calculators/tds-calculator" },
          ],
        },
        {
          title: "Loan Calculators",
          items: [
            { name: "Home Loan EMI", icon: <Home size={14} />, path: "/calculators/home-loan-emi" },
            { name: "Car Loan EMI", icon: <Car size={14} />, path: "/calculators/car-loan-emi" },
            { name: "Personal Loan EMI", icon: <Wallet size={14} />, path: "/calculators/personal-loan-emi" },
          ],
        },
      ],
    },
    {
      title: "Blog",
      icon: <BookOpen size={16} />,
      path: "/blog",
    },
    {
      title: "Contact Us",
      icon: <CreditCard size={14} />,
      path: "/contact",
    }
  ];

  const handleDropdownToggle = (index) => {
    setActiveDropdown(activeDropdown === index ? null : index);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center cursor-pointer lg: gap-1">
            <div className=" rounded-lg">
              <img src="/android-chrome-192x192.png" alt="Powerfiling" className="w-8" />
            </div>
            <h2 className="text-2xl font-bold ">Power<span className="text-2xl font-bold text-blue-900 tracking-tight">
             Filing
            </span></h2>
           
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-2">
            {navigationItems.map((item, index) => (
              <div key={index} className="relative group">
                {/* Plain link item (no dropdown) */}
                {!item.sections ? (
                  <Link
                    to={item.path}
                    className="flex items-center gap-2 px-4 py-2 font-medium text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                  >
                    {item.icon}
                    {item.title}
                  </Link>
                ) : (
                  <>
                    <button
                      className="flex items-center gap-2 px-4 py-2 font-medium text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                      onMouseEnter={() => setActiveDropdown(index)}
                      onMouseLeave={() => setActiveDropdown(null)}
                    >
                      {item.icon}
                      {item.title}
                      <ChevronDown
                        size={16}
                        className="transition-transform group-hover:rotate-180"
                      />
                    </button>

                    {/* Mega Menu Dropdown */}
                    <div
                      className={`absolute top-full left-0 mt-1 w-max bg-white shadow-2xl rounded-2xl border border-slate-200 transition-all duration-300 max-h-96 overflow-y-auto ${
                        activeDropdown === index
                          ? "opacity-100 visible translate-y-0"
                          : "opacity-0 invisible translate-y-2"
                      }`}
                      onMouseEnter={() => setActiveDropdown(index)}
                      onMouseLeave={() => setActiveDropdown(null)}
                    >
                      <div className="p-5">
                        <div className={`${item.sections.length > 1 ? "flex gap-6" : "space-y-6"}`}>
                          {item.sections.map((section, sectionIndex) => (
                            <div key={sectionIndex} className={item.sections.length > 1 ? "min-w-[180px]" : ""}>
                              <h4 className="text-sm font-semibold text-slate-600 mb-3 flex items-center gap-2 uppercase tracking-wide">
                                {section.icon}
                                {section.title}
                              </h4>
                              <div className="grid grid-cols-1 gap-2">
                                {section.items.map((subItem, subIndex) => (
                                  <Link
                                    key={subIndex}
                                    to={subItem.path}
                                    className="flex items-center gap-3 p-3 text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 group"
                                  >
                                    <div className="w-8 h-8 bg-slate-100 group-hover:bg-blue-100 rounded-lg flex items-center justify-center transition-colors">
                                      {subItem.icon}
                                    </div>
                                    <span className="text-sm font-medium">
                                      {subItem.name}
                                    </span>
                                  </Link>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                        {item.hubPath && (
                          <div className="mt-4 pt-3 border-t border-slate-100">
                            <Link
                              to={item.hubPath}
                              className="flex items-center justify-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                            >
                              <Calculator size={14} />
                              View all calculators
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}

            {/* Plans Link */}
            {/* <Link
              to="#pricing"
              className="px-4 py-2 font-medium text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
            >
              Plans
            </Link> */}

            {/* Start Filing CTA */}
            <Link
              to="/itr-filing"
              className="border-2 border-blue-600 text-blue-600 px-5 py-2 rounded-full font-semibold hover:bg-blue-50 transition-all duration-200 text-sm whitespace-nowrap"
            >
              Start Filing
            </Link>

            {/* Auth Buttons */}
            {!isLoggedIn ? (
              <Link
                to="/login"
                className="bg-blue-600 text-white px-8 py-2.5 rounded-full font-semibold hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl text-sm"
              >
                Login
              </Link>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  onMouseEnter={() => setIsProfileOpen(true)}
                  onMouseLeave={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2 p-1 border-2 border-slate-100 rounded-full hover:border-blue-600 transition-all duration-200 bg-slate-50"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white">
                    <User size={20} />
                  </div>
                </button>

                {/* Profile Dropdown */}
                <div
                  onMouseEnter={() => setIsProfileOpen(true)}
                  onMouseLeave={() => setIsProfileOpen(false)}
                  className={`absolute right-0 top-full mt-2 w-48 bg-white shadow-2xl rounded-2xl border border-slate-100 transition-all duration-300 ${
                    isProfileOpen
                      ? "opacity-100 visible translate-y-0"
                      : "opacity-0 invisible translate-y-2"
                  }`}
                >
                  <div className="p-2 space-y-1">
                    <div className="px-3 py-2 border-b border-slate-100 mb-1">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Account</p>
                      <p className="text-sm font-bold text-slate-800 truncate">{user?.name || "User"}</p>
                    </div>
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-3 px-3 py-2 text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <LayoutDashboard size={18} />
                      <span className="text-sm font-semibold">Dashboard</span>
                    </Link>
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
                    >
                      <LogOut size={18} />
                      <span className="text-sm font-semibold">Logout</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {isMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-40"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer — slides in from right */}
      <div
        className={`lg:hidden fixed top-0 right-0 h-full w-[80vw] max-w-sm bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <Link to="/" className="flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
            <img src="/android-chrome-192x192.png" alt="Powerfiling" className="w-6 h-6" />
            <span className="text-lg font-bold text-blue-900 tracking-tight">Powerfiling</span>
          </Link>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <X size={22} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-4 px-4 space-y-1">
          {navigationItems.map((item, index) => (
            <div key={index} className="border-b border-slate-100 pb-3 mb-1">
              {!item.sections ? (
                <Link
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2 p-3 text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
                >
                  {item.icon}
                  <span>{item.title}</span>
                </Link>
              ) : (
                <>
                  <button
                    onClick={() => handleDropdownToggle(index)}
                    className="w-full flex items-center justify-between p-3 text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {item.icon}
                      <span className="font-medium">{item.title}</span>
                    </div>
                    <ChevronDown
                      size={16}
                      className={`transition-transform duration-200 ${
                        activeDropdown === index ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {activeDropdown === index && (
                    <div className="mt-1 ml-3 space-y-3">
                      {item.sections.map((section, sectionIndex) => (
                        <div key={sectionIndex}>
                          {section.title && (
                            <h4 className="text-xs font-semibold text-slate-400 mb-2 px-2 uppercase tracking-wider">
                              {section.title}
                            </h4>
                          )}
                          <div className="space-y-0.5 ml-2">
                            {section.items.map((subItem, subIndex) => (
                              <Link
                                key={subIndex}
                                to={subItem.path}
                                onClick={() => setIsMenuOpen(false)}
                                className="flex items-center gap-2 p-2.5 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                {subItem.icon}
                                {subItem.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                      {item.hubPath && (
                        <Link
                          to={item.hubPath}
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-2 p-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors ml-2"
                        >
                          <Calculator size={14} />
                          View all calculators
                        </Link>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>

        {/* Drawer Footer — Auth */}
        <div className="px-4 py-4 border-t border-slate-100">
          <Link
            to="/itr-filing"
            onClick={() => setIsMenuOpen(false)}
            className="block w-full p-3 mb-3 border-2 border-blue-600 text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors text-center text-sm"
          >
            Start Filing
          </Link>
          {!isLoggedIn ? (
            <Link
              to="/login"
              onClick={() => setIsMenuOpen(false)}
              className="block w-full p-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors text-center"
            >
              Login
            </Link>
          ) : (
            <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
                <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white">
                  <User size={20} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Account</p>
                  <p className="text-sm font-bold text-slate-800">{user?.name || "User"}</p>
                </div>
              </div>
              <Link
                to="/dashboard"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 p-2.5 text-slate-700 hover:bg-white rounded-xl transition-all font-semibold"
              >
                <LayoutDashboard size={18} className="text-blue-600" />
                Dashboard
              </Link>
              <button
                onClick={() => { setIsMenuOpen(false); handleLogout(); }}
                className="w-full flex items-center gap-3 p-2.5 text-red-600 hover:bg-white rounded-xl transition-all font-semibold"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
