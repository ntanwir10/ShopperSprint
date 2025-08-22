import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { connectWebSocket } from './lib/ws';
import { ThemeProvider } from './components/ThemeProvider';
import { Header } from './components/Header';
import LandingPage from './components/LandingPage';
import SearchResults from './components/SearchResults';
import ProductPage from './components/ProductPage';
import ComparePage from './components/ComparePage';
import { VerifyAnonymousAlert } from './components/VerifyAnonymousAlert';
import { ManageAnonymousAlert } from './components/ManageAnonymousAlert';
import TestAnonymousAlert from './components/TestAnonymousAlert';
import ComingSoon from './components/ComingSoon';
import UnsubscribePage from './components/UnsubscribePage';
import ScrollToTop from './components/ScrollToTop';

function App() {
  const isComingSoonMode = import.meta.env.VITE_COMING_SOON_MODE === 'true';

  useEffect(() => {
    if (!isComingSoonMode) {
      connectWebSocket();
    }
  }, [isComingSoonMode]);

  // Show coming soon page if feature flag is enabled
  if (isComingSoonMode) {
    return (
      <HelmetProvider>
        <ThemeProvider>
          <Router>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<ComingSoon />} />
              <Route path="/unsubscribe" element={<UnsubscribePage />} />
              {/* Redirect all other routes to coming soon */}
              <Route path="*" element={<ComingSoon />} />
            </Routes>
          </Router>
        </ThemeProvider>
      </HelmetProvider>
    );
  }

  // Normal app functionality
  return (
    <HelmetProvider>
      <ThemeProvider>
        <Router>
          <ScrollToTop />
          <div className="min-h-screen bg-background">
            <Header />
            <main>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/search" element={<SearchResults />} />
                <Route path="/search/:query" element={<SearchResults />} />
                <Route path="/product/:id" element={<ProductPage />} />
                <Route path="/compare" element={<ComparePage />} />

                {/* Anonymous Alert Routes */}
                <Route
                  path="/verify/:verificationToken"
                  element={<VerifyAnonymousAlert />}
                />
                <Route
                  path="/manage/:managementToken"
                  element={<ManageAnonymousAlert />}
                />

                {/* Test Route */}
                <Route path="/test-alerts" element={<TestAnonymousAlert />} />

                {/* Unsubscribe Route */}
                <Route path="/unsubscribe" element={<UnsubscribePage />} />

                {/* 404 Route */}
                <Route
                  path="*"
                  element={
                    <div className="container mx-auto px-4 py-16 text-center">
                      <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
                      <p className="text-gray-600 mb-8">
                        The page you're looking for doesn't exist.
                      </p>
                      <a
                        href="/"
                        className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Return to Home
                      </a>
                    </div>
                  }
                />
              </Routes>
            </main>
          </div>
        </Router>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;
