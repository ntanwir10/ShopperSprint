import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, TrendingUp, Shield, Zap } from 'lucide-react';
import BannerAd from './BannerAd';
import SearchInput from './SearchInput';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query: string) => {
    if (query.trim().length >= 3) {
      navigate('/search', { state: { query } });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-primary-600" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900">
                PricePulse
              </h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900">
                Features
              </a>
              <a href="#about" className="text-gray-600 hover:text-gray-900">
                About
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Find the Best Prices
              <span className="text-primary-600"> Online</span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              PricePulse searches across multiple e-commerce sites and compares prices in
              real-time. Save money by finding the best deals on the products
              you want.
            </p>

            {/* Search Input */}
            <div className="max-w-2xl mx-auto mb-12">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                onSearch={handleSearch}
                placeholder="Search for products (e.g., iPhone, laptop, headphones)..."
                className="text-lg"
              />
            </div>

            {/* Banner Advertisement */}
            <div className="mb-12">
              <BannerAd />
            </div>
          </div>
        </div>

        {/* Features Section */}
        <section id="features" className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Why Choose PricePulse?
              </h3>
              <p className="text-lg text-gray-600">
                Get comprehensive price comparisons across multiple sources
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-primary-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Search className="h-8 w-8 text-primary-600" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">
                  Smart Search
                </h4>
                <p className="text-gray-600">
                  Find products across popular retailers and alternative sources
                  with intelligent matching.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-primary-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Zap className="h-8 w-8 text-primary-600" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">
                  Real-time Updates
                </h4>
                <p className="text-gray-600">
                  Get the latest prices and availability information in
                  real-time.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-primary-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Shield className="h-8 w-8 text-primary-600" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">
                  Trusted Sources
                </h4>
                <p className="text-gray-600">
                  Compare prices from verified retailers with reliable data
                  validation.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                About PricePulse
              </h3>
              <p className="text-lg text-gray-600 max-w-4xl mx-auto">
                PricePulse is a comprehensive platform that helps you find
                the best prices across multiple online retailers. Our advanced
                web scraping technology ensures you always get the most
                up-to-date pricing information.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2024 PricePulse. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
