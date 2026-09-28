import { Routes, Route, Navigate } from 'react-router-dom';
import Home from '../pages/frontend/Home';
import Contact from '../pages/frontend/Contact';
import Disclaimar from '../pages/frontend/Disclaimar';
import Privacypolicy from '../pages/frontend/Privacypolicy';
import Refund from '../pages/frontend/Refund';
import Security from '../pages/frontend/Security';
import Login from '../pages/Login';
import Sign_up from '../pages/sign-in/Sign_up';
import UnifiedVerification from '../pages/sign-in/UnifiedVerification';
import UserForm from '../pages/from/UserFrom';
import UserDashboard from '../pages/dashboard/UserDashboard';
import AdminLogin from '../pages/admin/AdminLogin';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminRequestAccess from '../pages/admin/requests/AdminRequestAccess';
import AdminRequestStatus from '../pages/admin/requests/AdminRequestStatus';
import AdminAccessRejected from '../pages/admin/requests/AdminAccessRejected';

// ITR Category Pages (keep existing)
import IndividualITR from '../pages/services/itr/IndividualITR';
import BusinessITR from '../pages/services/itr/BusinessITR';

// Dynamic Service Detail Template
import ServiceDetail from '../pages/services/ServiceDetail';
import PaymentGateway from '../pages/payment/PaymentGateway';
import PaymentSuccess from '../pages/payment/PaymentSuccess';
import PaymentFailure from '../pages/payment/PaymentFailure';

import CalculatorHub from '../pages/calculators/CalculatorHub';
import IncomeTaxCalculator from '../pages/calculators/IncomeTaxCalculator';
import OldVsNewRegimeCalculator from '../pages/calculators/OldVsNewRegimeCalculator';
import SalaryTaxCalculator from '../pages/calculators/SalaryTaxCalculator';
import CapitalGainTaxCalculator from '../pages/calculators/CapitalGainTaxCalculator';
import HRACalculator from '../pages/calculators/HRACalculator';
import TDSCalculator from '../pages/calculators/TDSCalculator';
import HomeLoanEMICalculator from '../pages/calculators/HomeLoanEMICalculator';
import CarLoanEMICalculator from '../pages/calculators/CarLoanEMICalculator';
import PersonalLoanEMICalculator from '../pages/calculators/PersonalLoanEMICalculator';
import BlogList from '../pages/blog/BlogList';
import BlogDetail from '../pages/blog/BlogDetail';
import PrivateRoute from './PrivateRoute';
import OrderDetails from '../pages/dashboard/OrderDetails';
import Navbar from '../pages/frontend/Navbar';
import Footer from '../pages/frontend/Footer';
import WithdrawalPanel from '../pages/admin/WithdrawalPanel';
import ReferralDashboard from '../pages/ReferralDashboard/ReferralDashboard';
import TermsAndConditions from '../pages/frontend/Terms&Condition';
import SelfFilingPage from '../pages/SelfFilingPage';
import ITRFilingForm from '../pages/ITRFilingForm';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/itr-filing" element={<SelfFilingPage />} />
      <Route path="/itr-filing/form" element={<ITRFilingForm />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/login" element={<Login />} />
      <Route path="/privacy-policy" element={<Privacypolicy />} />
      <Route path="/disclaimer" element={<Disclaimar />} />
      <Route path="/refund" element={<Refund />} />
      <Route path="/terms" element={<TermsAndConditions />} />
      <Route path="/security" element={<Security />} />
      <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
      <Route path='/sign_up' element={<Sign_up />} />
      <Route path="/verification" element={<UnifiedVerification />} />
      <Route path="/verify-otp" element={<UnifiedVerification />} />
      <Route
        path="/verify-mobile"
        element={
          <PrivateRoute>
            <UnifiedVerification />
          </PrivateRoute>
        }
      />

      <Route path="/calculators" element={<CalculatorHub />} />
      <Route path="/calculators/income-tax" element={<IncomeTaxCalculator />} />
      <Route path="/calculators/old-new-regime" element={<OldVsNewRegimeCalculator />} />
      <Route path="/calculators/salary-tax" element={<SalaryTaxCalculator />} />
      <Route path="/calculators/capital-gain-tax" element={<CapitalGainTaxCalculator />} />
      <Route path="/calculators/hra-calculator" element={<HRACalculator />} />
      <Route path="/calculators/tds-calculator" element={<TDSCalculator />} />
      <Route path="/calculators/home-loan-emi" element={<HomeLoanEMICalculator />} />
      <Route path="/calculators/car-loan-emi" element={<CarLoanEMICalculator />} />
      <Route path="/calculators/personal-loan-emi" element={<PersonalLoanEMICalculator />} />

      <Route path="/blog" element={<BlogList />} />
      <Route path="/blog/:id" element={<BlogDetail />} />

      {/* ITR Category Routes - Keep existing pages */}
      <Route path="/services/individual" element={<IndividualITR />} />
      <Route path="/services/business" element={<BusinessITR />} />

      {/* Dynamic Service Detail Routes - All individual services use one template */}
      <Route path="/services/:serviceId" element={<ServiceDetail />} />

      {/* {User Form} */}
      <Route
        path="/services/userform"
        element={
          <PrivateRoute>
            <UserForm />
          </PrivateRoute>
        }
      />

      {/* User Dashboard */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <UserDashboard />
          </PrivateRoute>
        }

        
        
      />

      <Route path='/dashboard/referrals' element={<ReferralDashboard/>}/>
      <Route
        path="/order/:orderId"
        element={
          <PrivateRoute>
            <Navbar />
            <OrderDetails />
            <Footer />
          </PrivateRoute>
        }
      />
      <Route path="/orderdetails/:id" element={<><Navbar /><OrderDetails /><Footer /></>} />

      {/* Admin Routes */}
      <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/request-access" element={<AdminRequestAccess />} />
      <Route path="/admin/request-status" element={<AdminRequestStatus />} />
      <Route path="/admin/rejected" element={<AdminAccessRejected />} />
      <Route path="/admin/withdrawals" element={<WithdrawalPanel />} />
      <Route
        path="/admin/dashboard"
        element={
          <PrivateRoute adminOnly={true}>
            <AdminDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/order/:orderId"
        element={
          <PrivateRoute adminOnly={true}>
            <OrderDetails />
          </PrivateRoute>
        }
      />

      {/* Payment Routes */}
      <Route
        path="/payment"
        element={
          <PrivateRoute>
            <PaymentGateway />
          </PrivateRoute>
        }
      />
      <Route path="/payment-success" element={<PaymentSuccess />} />
      <Route path="/payment-failed" element={<PaymentFailure />} />

      {/* Fallback route for any other services */}
      <Route path="/services/*" element={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="text-center"><h1 className="text-3xl font-bold text-slate-900 mb-4">Service Page</h1><p className="text-slate-600">This service page is coming soon!</p></div></div>} />
    </Routes>
  );
}
