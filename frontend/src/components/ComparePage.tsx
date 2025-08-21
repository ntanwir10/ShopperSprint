import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Target,
  Zap,
  ChevronUp,
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Badge } from './ui/badge';

const ComparePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search results with comparison intent
      navigate(`/search/${encodeURIComponent(searchQuery.trim())}`, {
        state: { comparisonMode: true },
      });
    }
  };

  const handleCompareSelected = () => {
    // This would typically open a modal or navigate to a comparison selection page
    // For now, we'll navigate to search to demonstrate the flow
    navigate('/search', { state: { comparisonMode: true } });
  };

  const recentSearches = [
    { query: 'iPhone 15 Pro', count: 3 },
    { query: 'MacBook Air M2', count: 2 },
    { query: 'Sony WH-1000XM5', count: 1 },
  ];

  const comparisonFeatures = [
    {
      icon: <BarChart3 className="h-6 w-6 text-blue-600" />,
      title: 'Price Analysis',
      description: 'Compare prices across multiple retailers and marketplaces',
    },
    {
      icon: <TrendingUp className="h-6 w-6 text-green-600" />,
      title: 'Price History',
      description:
        'View historical price trends and identify the best time to buy',
    },
    {
      icon: <Target className="h-6 w-6 text-purple-600" />,
      title: 'Price Alerts',
      description: 'Set up notifications when prices drop to your target',
    },
    {
      icon: <Zap className="h-6 w-6 text-yellow-600" />,
      title: 'Instant Comparison',
      description: 'Get real-time price comparisons with just one search',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Product Comparison
                </h1>
                <p className="text-muted-foreground">
                  Compare prices, features, and find the best deals
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Search Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>Compare Products</span>
            </CardTitle>
            <CardDescription>
              Search for products to compare prices across different sources
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Search for products to compare (e.g., iPhone 15 Pro, MacBook Air)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" className="px-6">
                  <Search className="h-4 w-4 mr-2" />
                  Search & Compare
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                💡 Tip: You can search for multiple products and compare them
                side by side
              </p>
            </form>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={handleCompareSelected}
          >
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                <span>Compare Selected</span>
              </CardTitle>
              <CardDescription>
                Compare products you've already searched for
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                View Comparison
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingDown className="h-5 w-5 text-green-600" />
                <span>Price Drops</span>
              </CardTitle>
              <CardDescription>
                See products with recent price decreases
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                View Price Drops
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Recent Searches</CardTitle>
              <CardDescription>
                Quickly access your recent product searches
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentSearches.map((search, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => {
                      setSearchQuery(search.query);
                      navigate(`/search/${encodeURIComponent(search.query)}`, {
                        state: { comparisonMode: true },
                      });
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <Search className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{search.query}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">{search.count} results</Badge>
                      <Button variant="ghost" size="sm">
                        Compare
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle>Why Compare with ShopperSprint?</CardTitle>
            <CardDescription>
              Get the most out of your shopping with our powerful comparison
              tools
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {comparisonFeatures.map((feature, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">{feature.icon}</div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">
                      {feature.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* How It Works */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>How Product Comparison Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 font-bold text-lg">1</span>
                </div>
                <h4 className="font-semibold mb-2">Search Products</h4>
                <p className="text-sm text-muted-foreground">
                  Search for the products you want to compare
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-green-600 font-bold text-lg">2</span>
                </div>
                <h4 className="font-semibold mb-2">Select for Comparison</h4>
                <p className="text-sm text-muted-foreground">
                  Choose which products to compare side by side
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-purple-600 font-bold text-lg">3</span>
                </div>
                <h4 className="font-semibold mb-2">Analyze & Decide</h4>
                <p className="text-sm text-muted-foreground">
                  Compare prices, features, and make informed decisions
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scroll to top button */}
      <Button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 hover:shadow-xl transition-all duration-300 hover:scale-110"
        aria-label="Scroll to top"
      >
        <ChevronUp className="h-6 w-6" />
      </Button>
    </div>
  );
};

export default ComparePage;
