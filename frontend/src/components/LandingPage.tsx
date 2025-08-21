import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import SearchInput from './SearchInput';
import PriceAlertSignup from './PriceAlertSignup';
import { TrendingUp, Shield, Zap, BarChart3, Star } from 'lucide-react';

interface LandingPageProps {}

const LandingPage: React.FC<LandingPageProps> = () => {
  const [searchValue, setSearchValue] = useState('');
  // Removed public API health indicator
  const navigate = useNavigate();

  // Removed API health fetch for cleaner UX

  const handleSearch = (query: string) => {
    navigate(`/search/${encodeURIComponent(query)}`);
  };

  const features = [
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: 'Price Tracking',
      description:
        'Monitor product prices across multiple retailers in real-time.',
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Price Alerts',
      description: 'Get notified instantly when prices drop below your target.',
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: 'Smart Comparisons',
      description: 'Compare prices, features, and availability across stores.',
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: 'Price History',
      description: 'View historical price trends to make informed decisions.',
    },
  ];

  const testimonials = [
    {
      name: 'Sarah M.',
      role: 'Smart Shopper',
      content: 'ShopperSprint helped me save over $200 on my laptop purchase!',
      rating: 5,
    },
    {
      name: 'Mike R.',
      role: 'Tech Enthusiast',
      content: 'The price alerts are incredibly accurate and timely.',
      rating: 5,
    },
    {
      name: 'Lisa K.',
      role: 'Budget Conscious',
      content:
        'I never overpay for electronics anymore thanks to ShopperSprint.',
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/20 dark:to-indigo-950/20" />
        <div className="relative container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Never Overpay
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                {' '}
                Again
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Track prices, set alerts, and save money on your favorite
              products. ShopperSprint monitors prices across major retailers so
              you don't have to.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <SearchInput
                value={searchValue}
                onChange={setSearchValue}
                onSearch={handleSearch}
                placeholder="Search for products to track..."
                size="large"
                showSuggestions={true}
              />
            </div>

            {/* API status pill removed */}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/compare')}>
              Start Comparing
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                // Scroll to price alert section
                document
                  .getElementById('price-alerts')
                  ?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Set Price Alerts
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose ShopperSprint?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our comprehensive price tracking platform gives you the tools you
              need to make smart purchasing decisions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-lg border bg-card hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4 text-primary">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Price Alert Signup Section */}
      <section id="price-alerts" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Get Price Alerts
            </h2>
            <p className="text-xl text-muted-foreground">
              Stay informed about price drops without creating an account
            </p>
          </div>

          <PriceAlertSignup />
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of satisfied customers who save money every day
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="p-6 rounded-lg border bg-card">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  "{testimonial.content}"
                </p>
                <div>
                  <p className="font-semibold text-foreground">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-foreground mb-2">
                10K+
              </div>
              <div className="text-muted-foreground">Active Users</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-foreground mb-2">
                $2M+
              </div>
              <div className="text-muted-foreground">Money Saved</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-foreground mb-2">50+</div>
              <div className="text-muted-foreground">Retailers Tracked</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-foreground mb-2">
                99.9%
              </div>
              <div className="text-muted-foreground">Uptime</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
