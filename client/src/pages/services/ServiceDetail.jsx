import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle, Clock, Shield, AlertCircle, Award, ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import Navbar from '../frontend/Navbar';
import Footer from '../frontend/Footer';
import RelatedLinks from '../../components/RelatedLinks';
import { individualServices, businessServices, registrationServices, otherServices } from '../../data/servicesData';
import { useAuth } from '../../context/AuthContext';
import { planMapping } from '../../data/planMapping';
import api from '../../api/axios';

// Module-level cache for plans to avoid refetching on every navigation
let cachedPlans = null;

const ServiceDetail = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const [loadingPlan, setLoadingPlan] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [hasActivePurchase, setHasActivePurchase] = useState(false);
  const [activePurchaseId, setActivePurchaseId] = useState(null);

  const allServices = [
    ...individualServices,
    ...businessServices,
    ...registrationServices,
    ...otherServices
  ];

  const service = allServices.find(s => s.id === serviceId);

  useEffect(() => {
    const fetchPlanAndStatus = async () => {
      if (!serviceId) return;
      
      const mappedPlan = planMapping[serviceId];
      if (!mappedPlan) return;

      // Step 1: Resolve Plan (use cache or fetch)
      let currentPlan = cachedPlans ? cachedPlans.find(p => p.name === mappedPlan.name) : null;

      if (!currentPlan) {
        setLoadingPlan(true);
        try {
          const { data } = await api.get('/plans');
          if (data.success) {
            cachedPlans = data.data;
            currentPlan = data.data.find(p => p.name === mappedPlan.name);
          }
        } catch (error) {
          console.error("Plan loading error:", error);
        } finally {
          setLoadingPlan(false);
        }
      }

      if (currentPlan) {
        setSelectedPlan(currentPlan);
      }

      // Step 2: Check Purchase Status (only if logged in and plan resolved)
      if (isLoggedIn && currentPlan) {
        setCheckingStatus(true);
        try {
          const statusRes = await api.get('/payments/check-status', { 
            params: { planId: currentPlan._id } 
          });
          if (statusRes.data.success && statusRes.data.hasActivePlan) {
            setHasActivePurchase(true);
            setActivePurchaseId(statusRes.data.purchaseId);
          }
        } catch (e) {
          console.error("Status check error:", e);
        } finally {
          setCheckingStatus(false);
        }
      }
    };

    // Reset status when serviceId changes
    setHasActivePurchase(false);
    setActivePurchaseId(null);
    fetchPlanAndStatus();
  }, [serviceId, isLoggedIn]);

  const handleStartFiling = () => {
    if (!isLoggedIn) { navigate('/login', { state: { from: `/services/${serviceId}` } }); return; }
    if (hasActivePurchase && activePurchaseId) { navigate(`/services/userform?service=${serviceId}&purchaseId=${activePurchaseId}`); return; }
    if (!selectedPlan) { 
      console.error("Plan not resolved for service:", serviceId);
      alert("Plan currently unavailable. Please contact support."); 
      return; 
    }
    
    console.log('Navigating to payment with:', { 
      planId: selectedPlan._id, 
      amount: service.numericPrice || selectedPlan.price,
      planName: service.title
    });

    navigate('/payment', { 
      state: { 
        serviceId, 
        planId: selectedPlan._id, 
        amount: service.numericPrice || selectedPlan.price || 0, 
        planName: service.title 
      } 
    });
  };

  if (!service) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Service Not Found</h1>
          <Link to="/" className="mt-4 inline-block bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold">Go Home</Link>
        </div>
      </div>
    );
  }

  const ServiceIcon = service.icon;
  const displayPrice = service.price;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      <Navbar />

      {/* Hero Banner */}
      <section className="bg-blue-600 text-white pt-10 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-blue-100 hover:text-white text-sm font-semibold mb-8 transition-colors"
          >
            <ArrowLeft size={16} /> Back
          </button>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Title + price + CTA */}
            <div>
              <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest mb-5">
                <ServiceIcon size={14} /> {service.title}
              </div>
              <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight mb-4">
                {service.title}
              </h1>
              <p className="text-blue-100 text-lg mb-8 leading-relaxed">
                {service.description}
              </p>

              {/* Price */}
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-5xl font-extrabold">{displayPrice}</span>
                <span className="text-blue-200 text-base font-medium">/ filing</span>
              </div>

              {hasActivePurchase && (
                <div className="mb-5 p-4 bg-green-500/20 border border-green-400/30 rounded-2xl flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-300 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-white text-sm">Active Plan Found</p>
                    <p className="text-green-100 text-xs mt-0.5">You've already purchased this. Click below to continue.</p>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleStartFiling}
                  disabled={loadingPlan || !selectedPlan}
                  className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-2xl font-extrabold text-base hover:bg-blue-50 transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {loadingPlan ? 'Checking...' : checkingStatus ? 'Verifying...' : hasActivePurchase ? 'Continue Filing' : 'Get Started Now'}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <a
                  href="https://wa.me/+919784799904"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-white px-6 py-4 rounded-2xl font-semibold text-sm hover:bg-white/20 transition-all"
                >
                  Talk to an Expert
                </a>
              </div>
            </div>

            {/* Right: Trust stats */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Award, label: "CA-Assisted Filing", sub: "Every return reviewed by a qualified CA" },
                { icon: Shield, label: "100% Secure", sub: "256-bit encrypted & SSL protected" },
                { icon: Clock, label: "Fast Turnaround", sub: "Filed within 2–5 business days" },
                { icon: CheckCircle, label: "Accurate & Compliant", sub: "Zero-error filing, guaranteed" },
              ].map((stat, i) => (
                <div key={i} className="bg-white/10 border border-white/10 rounded-2xl p-5">
                  <stat.icon size={22} className="text-blue-200 mb-2" />
                  <p className="font-extrabold text-white text-base leading-tight">{stat.label}</p>
                  <p className="text-blue-200 text-xs mt-1 leading-relaxed">{stat.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 -mt-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">

        {/* What's Included — full width */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 mb-8">
              <h2 className="text-xl font-extrabold text-slate-900 mb-6 flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
                  <CheckCircle size={16} className="text-blue-600" />
                </div>
                What's Included
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {service.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/40 transition-all">
                    <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    </div>
                    <span className="text-slate-700 text-sm font-medium leading-snug">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

          {/* Related services & calculators (internal linking) */}
          <RelatedLinks serviceId={serviceId} />

          {/* CTA Banner */}
          <div className="bg-blue-600 rounded-3xl p-10 text-center text-white shadow-xl shadow-blue-900/10">
            <h2 className="text-2xl font-extrabold mb-2">Ready to Get Started?</h2>
            <p className="text-blue-100 mb-8 text-base">
              Join thousands of satisfied customers who trust Powerfiling for their compliance needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleStartFiling}
                disabled={loadingPlan || !selectedPlan}
                className="bg-white text-blue-600 px-10 py-4 rounded-2xl font-extrabold hover:bg-blue-50 transition-colors disabled:opacity-75 disabled:cursor-not-allowed text-base"
              >
                {loadingPlan ? 'Checking...' : checkingStatus ? 'Verifying...' : hasActivePurchase ? 'Continue Filing' : `Get Started — ${displayPrice}`}
              </button>
              <a
                href="https://wa.me/+919784799904"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 border border-white/20 text-white px-8 py-4 rounded-2xl font-semibold hover:bg-white/20 transition-all text-base"
              >
                Get Expert Consultation
              </a>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ServiceDetail;
