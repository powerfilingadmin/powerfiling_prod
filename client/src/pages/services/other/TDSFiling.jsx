import React from 'react';
import { CreditCard, FileText } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import Navbar from '../../frontend/Navbar';

const TDSFiling = () => {
  return (
    <>
      <Helmet>
        <title>TDS Filing Services Online | TDS Return Filing | LedgerLine</title>
        <meta name="description" content="File TDS returns online — Form 24Q, 26Q, 27Q and 27EQ. Expert TDS filing services for businesses, individuals and employers. Avoid notices with timely filing." />
        <meta name="keywords" content="TDS filing, TDS return filing, TDS filing online, TDS return filing online, TDS filing services, income tax TDS, ITR filing, TDS on salary, TDS refund, Form 26Q filing India" />
        <meta property="og:title" content="TDS Filing Services Online | LedgerLine" />
        <meta property="og:description" content="Expert TDS return filing — Form 24Q, 26Q, 27Q — online, fast and penalty-free." />
        <meta property="og:url" content="https://powerfiling.com/services/tds-filing" />
        <link rel="canonical" href="https://powerfiling.com/services/tds-filing" />
      </Helmet>
      <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CreditCard className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4">
            TDS Filing
          </h1>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 text-white mb-6">
                <FileText className="w-6 h-6" />
                <span className="text-2xl font-bold">Powerfiling</span>
              </div>
              <p className="text-sm leading-relaxed mb-6">
                India's leading cloud-based tax filing and business compliance platform.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6">Services</h4>
              <ul className="space-y-4 text-sm">
                <li><a href="/services/salary-basic-itr" className="hover:text-white">Individual ITR</a></li>
                <li><a href="/services/gst-filing" className="hover:text-white">GST Filing</a></li>
                <li><a href="#" className="hover:text-white">Tax Planning</a></li>
                <li><a href="/services/gst-registration" className="hover:text-white">Business Registration</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6">Legal</h4>
              <ul className="space-y-4 text-sm">
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white">Refund Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6">Support</h4>
              <ul className="space-y-4 text-sm">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Live Chat</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-12 border-t border-slate-800 text-center">
            <p className="text-sm">© 2025 Powerfiling. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
    </>
  );
};

export default TDSFiling;