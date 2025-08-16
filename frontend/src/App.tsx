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
import { ThemeProvider } from './components/ThemeProvider';

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
      </Routes>

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
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App;
