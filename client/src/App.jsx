import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './context/AuthContext';
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { saveReferralCode } from './utils/referral/referral';
import RouteSEO from './components/RouteSEO';
export const captureReferralFromURL = () => {
    try {
        const params = new URLSearchParams(window.location.search);
        const ref = params.get('ref');
        if (ref) {
            saveReferralCode(ref);
        }
    } catch (err) {
        console.warn('[Referral] Could not capture ref param:', err);
    }
};

const ScrollToTop = () => {
  const { pathname } = useLocation();


  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  return null;
};

const App = () => {
  useEffect(() => {
    captureReferralFromURL(); // ← call it once on app mount
  }, []);
  return (
    <AuthProvider>
      <RouteSEO />
      <ScrollToTop />
      <AppRoutes />
    </AuthProvider>
  );
};

export default App;
