import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Shield,
  Zap,
  AlertCircle,
  Bell,
  BarChart3,
} from 'lucide-react';
import BannerAd from './BannerAd';
import SearchInput from './SearchInput';
import { apiClient } from '../lib/api';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface LandingPageProps {
  onSearch: (query: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onSearch }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [apiStatus, setApiStatus] = useState<
    'checking' | 'connected' | 'disconnected'
  >('checking');

  // Prevent duplicate API status checks
  const statusCheckInProgress = useRef(false);

  // Check API connectivity on component mount
  useEffect(() => {
    const checkApiStatus = async () => {
      if (statusCheckInProgress.current) {
        console.log('🔒 API status check already in progress, skipping...');
        return;
      }

      statusCheckInProgress.current = true;
      console.log('🔍 Checking API status...');

      try {
        const isConnected = await apiClient.testConnection();
        console.log('📡 API connection result:', isConnected);
        setApiStatus(isConnected ? 'connected' : 'disconnected');
      } catch (error) {
        console.error('❌ API status check failed:', error);
        setApiStatus('disconnected');
      } finally {
        statusCheckInProgress.current = false;
      }
    };

    checkApiStatus();
  }, []);

  const handleSearch = (query: string) => {
    if (query.trim().length >= 3) {
      onSearch(query);
    }
  };

  const features = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Smart Search',
      description:
        'Find products across popular retailers and alternative sources with intelligent matching.',
      color: 'text-yellow-600',
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: 'Real-time Updates',
      description:
        'Get the latest prices and availability information in real-time.',
      color: 'text-blue-600',
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Trusted Sources',
      description:
        'Compare prices from verified retailers with reliable data validation.',
      color: 'text-green-600',
    },
  ];

  const popularCategories = [
    'Electronics',
    'Fashion',
    'Home & Garden',
    'Sports',
    'Books',
    'Beauty',
    'Automotive',
    'Health',
  ];

  return (
    <div className="min-h-screen">
      {/* API Status Banner */}
      {apiStatus === 'disconnected' && (
        <div className="bg-red-50 border-b border-red-200 dark:bg-red-900/20 dark:border-red-800">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <p className="text-sm text-red-700 dark:text-red-400">
                ⚠️ Backend API is not accessible. Search functionality may not
                work properly. Please ensure the backend server is running on
                port 3001.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            {/* Status Badge */}
            <Badge className="mb-6 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              Live tracking 1.2M+ products
            </Badge>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Find the Best
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Prices Instantly
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
              Track prices across multiple retailers, get instant alerts on
              price drops, and never overpay again. No account needed,
              completely anonymous.
            </p>

            {/* Search Section */}
            <div className="mb-12">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                onSearch={handleSearch}
                placeholder="Search for products, brands, or categories..."
                className="text-lg"
              />
              {apiStatus === 'disconnected' && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                  ⚠️ Search may not work - backend server is not accessible
                </p>
              )}
            </div>

            {/* Popular Categories */}
            <div className="mb-12">
              <p className="text-sm text-muted-foreground mb-4">
                Popular categories:
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {popularCategories.map((category) => (
                  <Button
                    key={category}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSearch(category)}
                    className="rounded-full hover:bg-[#5482ef]/10 hover:border-[#5482ef] dark:hover:bg-[#5482ef]/20"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            {/* Banner Advertisement */}
            <div className="mb-12">
              <BannerAd />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose PricePulse?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our advanced price tracking technology helps you save money and
              make smarter purchasing decisions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer"
                onClick={() => {
                  if (feature.title === 'Real-time Updates') {
                    navigate('/alerts');
                  } else if (feature.title === 'Smart Search') {
                    const searchElement = document.querySelector(
                      'input[type="text"]'
                    ) as HTMLInputElement;
                    searchElement?.focus();
                  } else if (feature.title === 'Trusted Sources') {
                    navigate('/compare');
                  }
                }}
              >
                <CardContent className="p-6 text-center">
                  <div
                    className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-6 ${feature.color}`}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Start Saving Money Today
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join millions of smart shoppers who use PricePulse to find the best
            deals and save money on every purchase.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-[#5482ef] text-white hover:bg-[#4a75d8] font-semibold px-8"
              onClick={() => {
                const searchElement = document.querySelector(
                  'input[type="text"]'
                ) as HTMLInputElement;
                searchElement?.focus();
              }}
            >
              <Search className="w-5 h-5 mr-2" />
              Start Tracking Prices
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-white hover:bg-white hover:text-[#5482ef] font-semibold px-8"
              onClick={() => navigate('/alerts')}
            >
              <Bell className="w-5 h-5 mr-2" />
              Set Price Alert
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
