import { useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import { Header } from './components/Header';
import LandingPage from './components/LandingPage';
import SearchResults from './components/SearchResults';
import ProductPage from './components/ProductPage';
import ComparePage from './components/ComparePage';
import AlertsPage from './components/AlertsPage';
import ProductComparison from './components/ProductComparison';
import ScrollToTop from './components/ScrollToTop';
import { ThemeProvider } from './components/ThemeProvider';
import { Toaster } from './components/ui/sonner';
import { AuthProvider } from './contexts/AuthContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import UserProfile from './components/auth/UserProfile';
import PriceAlerts from './components/PriceAlerts';
import EmailVerification from './components/auth/EmailVerification';
import ProtectedRoute from './components/auth/ProtectedRoute';
import OAuthCallback from './components/auth/OAuthCallback';

function AppContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    navigate(`/search/${encodeURIComponent(query)}`, {
      state: { searchQuery: query },
    });
  };

  const showSearchBar = location.pathname === '/';

  return (
    <div className="min-h-screen bg-background">
      <Header onSearch={handleSearch} showSearchBar={showSearchBar} />

      <Routes>
        <Route path="/" element={<LandingPage onSearch={handleSearch} />} />
        <Route
          path="/search"
          element={<SearchResults searchQuery={searchQuery} />}
        />
        <Route
          path="/search/:query"
          element={<SearchResults searchQuery={searchQuery} />}
        />
        <Route path="/product/:slug" element={<ProductPage />} />
        <Route path="/compare" element={<ComparePage />} />
        <Route path="/alerts" element={<AlertsPage />} />
        <Route path="/compare-products" element={<ProductComparison />} />

        {/* Authentication Routes */}
        <Route
          path="/login"
          element={
            <ProtectedRoute requireAuth={false}>
              <Login />
            </ProtectedRoute>
          }
        />
        <Route
          path="/register"
          element={
            <ProtectedRoute requireAuth={false}>
              <Register />
            </ProtectedRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <ProtectedRoute requireAuth={false}>
              <ForgotPassword />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <ProtectedRoute requireAuth={false}>
              <ResetPassword />
            </ProtectedRoute>
          }
        />
        <Route path="/email-verification" element={<EmailVerification />} />
        <Route path="/oauth/callback" element={<OAuthCallback />} />

        {/* Protected Routes */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/price-alerts"
          element={
            <ProtectedRoute>
              <PriceAlerts />
            </ProtectedRoute>
          }
        />
      </Routes>

      {/* Scroll to top button */}
      <ScrollToTop />

      {/* Footer */}
      <footer className="bg-muted/50 border-t mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold text-foreground mb-4">PricePulse</h3>
              <p className="text-sm text-muted-foreground">
                Track prices, save money, and never overpay again.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-4">Features</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Price Tracking</li>
                <li>Price Alerts</li>
                <li>Price Comparison</li>
                <li>Price History</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>FAQ</li>
                <li>API Documentation</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Cookie Policy</li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 mt-8 text-center text-sm text-muted-foreground">
            © 2024 PricePulse. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
      <Toaster richColors position="top-center" />
    </ThemeProvider>
  );
}

export default App;
