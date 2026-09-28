import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Helmet } from "react-helmet-async";
import Navbar from "../frontend/Navbar";
import Footer from "../frontend/Footer";

const HomeLoanEMICalculator = () => {
  const [principal, setPrincipal] = useState(5000000);
  const [rate, setRate] = useState(8.5);
  const [tenure, setTenure] = useState(20);

  // EMI Calculation: EMI = P * r * (1+r)^n / ((1+r)^n - 1)
  const monthlyRate = rate / 100 / 12;
  const numberOfPayments = tenure * 12;
  const emi =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

  const totalPayment = emi * numberOfPayments;
  const totalInterest = totalPayment - principal;

  return (
    <>
      <Helmet>
        <title>Home Loan EMI Calculator | Monthly EMI & Interest | LedgerLine</title>
        <meta name="description" content="Calculate your home loan EMI, total interest payable and payment breakdown instantly. Adjust loan amount, interest rate and tenure. Covers Section 24 & 80C tax benefits." />
        <meta name="keywords" content="home loan EMI calculator, home loan calculator, housing loan EMI, mortgage calculator India, home loan interest calculator, ITR filing, income tax return filing, home loan tax benefit Section 24, home loan deduction 80C" />
        <meta property="og:title" content="Home Loan EMI Calculator | LedgerLine" />
        <meta property="og:description" content="Calculate monthly EMI, total interest and payment breakdown for your home loan instantly." />
        <meta property="og:url" content="https://powerfiling.com/calculators/home-loan-emi" />
        <link rel="canonical" href="https://powerfiling.com/calculators/home-loan-emi" />
      </Helmet>
      <Navbar />

      <main className="bg-slate-50 min-h-screen">
        {/* Hero */}
        <div className="bg-gradient-to-br from-slate-900 to-blue-900 text-white py-10 px-4">
          <div className="max-w-4xl mx-auto">
            <Link
              to="/calculators"
              className="inline-flex items-center gap-1.5 text-blue-300 hover:text-white text-sm mb-4 transition-colors"
            >
              <ArrowLeft size={15} />
              Back to Calculators
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold">Home Loan EMI Calculator</h1>
            <p className="text-slate-300 text-sm mt-2">Calculate your monthly EMI and total interest payable</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">

          <div className="grid lg:grid-cols-3 gap-8">

            {/* Input Section */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sticky top-20">
                <h2 className="text-lg font-bold text-slate-900 mb-6">Loan Details</h2>

                {/* Loan Amount */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Loan Amount (₹)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={principal === 0 ? "" : principal}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setPrincipal(val === "" ? 0 : Number(val));
                    }}
                    placeholder="0"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="range"
                    min="100000"
                    max="10000000"
                    step="100000"
                    value={principal}
                    onChange={(e) => setPrincipal(Number(e.target.value))}
                    className="w-full mt-2 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <p className="text-xs text-slate-500 mt-1">₹{(principal / 100000).toFixed(1)} Lakh</p>
                </div>

                {/* Interest Rate */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Interest Rate (% p.a.)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={rate}
                    onChange={(e) => setRate(Number(e.target.value))}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="range"
                    min="3"
                    max="15"
                    step="0.1"
                    value={rate}
                    onChange={(e) => setRate(Number(e.target.value))}
                    className="w-full mt-2 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>

                {/* Tenure */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Loan Tenure (Years)
                  </label>
                  <input
                    type="number"
                    value={tenure}
                    onChange={(e) => setTenure(Number(e.target.value))}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="range"
                    min="1"
                    max="30"
                    step="1"
                    value={tenure}
                    onChange={(e) => setTenure(Number(e.target.value))}
                    className="w-full mt-2 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>
              </div>
            </div>

            {/* Results Section */}
            <div className="lg:col-span-2 space-y-6">

              {/* EMI Summary */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
                <h2 className="text-lg font-bold text-slate-900 mb-6">EMI Breakdown</h2>

                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                    <span className="text-slate-600">Loan Amount</span>
                    <span className="font-semibold text-slate-900">₹{principal.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                    <span className="text-slate-600">Interest Rate</span>
                    <span className="font-semibold text-slate-900">{rate.toFixed(2)}% p.a.</span>
                  </div>

                  <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                    <span className="text-slate-600">Loan Tenure</span>
                    <span className="font-semibold text-slate-900">{tenure} Years ({numberOfPayments} Months)</span>
                  </div>

                  <div className="flex justify-between items-center pt-3 bg-blue-50 px-4 py-3 rounded-lg">
                    <span className="font-semibold text-slate-900">Monthly EMI</span>
                    <span className="text-2xl font-bold text-blue-600">₹{emi.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
                  </div>

                  <div className="flex justify-between items-center pt-3 bg-slate-50 px-4 py-3 rounded-lg">
                    <span className="font-semibold text-slate-900">Total Amount Payable</span>
                    <span className="text-lg font-bold text-slate-900">₹{totalPayment.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
                  </div>

                  <div className="flex justify-between items-center pt-3 bg-amber-50 px-4 py-3 rounded-lg">
                    <span className="font-semibold text-slate-900">Total Interest Payable</span>
                    <span className="text-lg font-bold text-amber-600">₹{totalInterest.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
                  </div>
                </div>
              </div>

              {/* Amortization Summary */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
                <h2 className="text-lg font-bold text-slate-900 mb-6">Payment Summary</h2>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-xl p-4 text-center">
                    <p className="text-sm text-slate-600 mb-1">Principal</p>
                    <p className="text-xl font-bold text-blue-600">₹{(principal / 100000).toFixed(1)}L</p>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-4 text-center">
                    <p className="text-sm text-slate-600 mb-1">Interest</p>
                    <p className="text-xl font-bold text-amber-600">₹{(totalInterest / 100000).toFixed(1)}L</p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4 text-center">
                    <p className="text-sm text-slate-600 mb-1">Total</p>
                    <p className="text-xl font-bold text-green-600">₹{(totalPayment / 100000).toFixed(1)}L</p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-700">
                    <strong>Interest as % of Principal:</strong> {((totalInterest / principal) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>

            </div>

          </div>

        </div>
      </main>

      <Footer />
    </>
  );
};

export default HomeLoanEMICalculator;
