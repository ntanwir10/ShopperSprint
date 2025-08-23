import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, ExternalLink, Store, Clock, TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-react';
import Header from './Header';
import PriceDisplay from './PriceDisplay';
import PriceHistoryChart from './PriceHistoryChart';
import { type Product } from '../lib/api';

interface ProductComparisonProps {}

const ProductComparison: React.FC<ProductComparisonProps> = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    if (location.state?.products) {
      setProducts(location.state.products);
    } else {
      // Fallback: navigate back to search if no products
      navigate('/search');
    }
  }, [location.state, navigate]);

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'in_stock':
        return 'text-success-600 bg-success-50 border-success-200 dark:text-success-400 dark:bg-success-900/20 dark:border-success-800';
      case 'out_of_stock':
        return 'text-error-600 bg-error-50 border-error-200 dark:text-error-400 dark:bg-error-900/20 dark:border-error-800';
      case 'limited':
        return 'text-warning-600 bg-warning-50 border-warning-200 dark:text-warning-400 dark:bg-warning-900/20 dark:border-warning-800';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200 dark:text-dark-text-tertiary dark:bg-dark-bg-tertiary dark:border-dark-border';
    }
  };

  const getSourceDisplayName = (source: string) => {
    if (source.startsWith('Source ')) {
      return source.replace('Source ', '');
    }
    return source;
  };

  const getPriceChange = (product: Product) => {
    // Mock price change data - in real app this would come from price history
    const mockChange = Math.random() * 100 - 50; // Random change between -50 and +50
    return {
      change: mockChange,
      percent: (mockChange / product.price) * 100,
      isPositive: mockChange >= 0
    };
  };

  const getBestDeal = () => {
    if (products.length === 0) return null;
    return products.reduce((best, current) => 
      current.price < best.price ? current : best
    );
  };

  const bestDeal = getBestDeal();

  if (products.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-bg-primary dark:to-dark-bg-secondary">
        <Header />
        <div className="text-center py-16">
          <p className="text-gray-600 dark:text-dark-text-secondary">No products to compare</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-bg-primary dark:to-dark-bg-secondary transition-colors duration-200">
      <Header />

      {/* Sticky Selected Products Bar */}
      <div className="sticky top-0 z-40 bg-white dark:bg-dark-bg-secondary shadow-soft border-b border-gray-200 dark:border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <button
              onClick={() => navigate('/search')}
              className="flex items-center text-gray-600 dark:text-dark-text-secondary hover:text-gray-900 dark:hover:text-dark-text-primary transition-colors duration-200"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Search
            </button>
            
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-dark-text-primary">
                Comparing {products.length} Products
              </h1>
              {bestDeal && (
                <div className="bg-success-100 dark:bg-success-900/20 text-success-800 dark:text-success-200 px-3 py-1 rounded-full text-sm font-medium">
                  Best Deal: {getSourceDisplayName(bestDeal.source)}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-gray-400 dark:text-dark-text-tertiary" />
              <span className="text-sm text-gray-600 dark:text-dark-text-secondary">Time Range:</span>
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value as any)}
                className="border border-gray-300 dark:border-dark-border rounded-lg px-2 py-1 text-sm bg-white dark:bg-dark-bg-secondary text-gray-900 dark:text-dark-text-primary"
              >
                <option value="7d">7 Days</option>
                <option value="30d">30 Days</option>
                <option value="90d">90 Days</option>
                <option value="1y">1 Year</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Comparison Table */}
        <div className="bg-white dark:bg-dark-bg-secondary rounded-2xl shadow-soft border border-gray-200 dark:border-dark-border overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-border">
              <thead className="bg-gray-50 dark:bg-dark-bg-tertiary">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-dark-text-tertiary uppercase tracking-wider">
                    Product
                  </th>
                  {products.map((product) => (
                    <th key={product.id} className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-dark-text-tertiary uppercase tracking-wider">
                      {getSourceDisplayName(product.source)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-dark-bg-secondary divide-y divide-gray-200 dark:divide-dark-border">
                {/* Image Row */}
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-dark-text-primary">
                    Image
                  </td>
                  {products.map((product) => (
                    <td key={product.id} className="px-6 py-4">
                      <div className="h-24 w-24 rounded-xl overflow-hidden border border-gray-200 dark:border-dark-border">
                        <img
                          className="h-full w-full object-cover"
                          src={product.imageUrl || 'https://via.placeholder.com/96x96?text=No+Image'}
                          alt={product.name}
                        />
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Name Row */}
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-dark-text-primary">
                    Product Name
                  </td>
                  {products.map((product) => (
                    <td key={product.id} className="px-6 py-4">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-dark-text-primary line-clamp-2">
                        {product.name}
                      </h3>
                    </td>
                  ))}
                </tr>

                {/* Price Row */}
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-dark-text-primary">
                    Price
                  </td>
                  {products.map((product) => {
                    const priceChange = getPriceChange(product);
                    return (
                      <td key={product.id} className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="text-lg font-bold text-gray-900 dark:text-dark-text-primary">
                            <PriceDisplay
                              price={product.price}
                              currency={product.currency}
                            />
                          </div>
                          <div className="flex items-center space-x-1 text-sm">
                            {priceChange.change !== 0 ? (
                              <>
                                {priceChange.isPositive ? (
                                  <TrendingUp className="h-4 w-4 text-error-500" />
                                ) : (
                                  <TrendingDown className="h-4 w-4 text-success-500" />
                                )}
                                <span className={priceChange.isPositive ? 'text-error-600 dark:text-error-400' : 'text-success-600 dark:text-success-400'}>
                                  {priceChange.isPositive ? '+' : ''}{priceChange.change.toFixed(2)} ({priceChange.percent.toFixed(1)}%)
                                </span>
                              </>
                            ) : (
                              <>
                                <Minus className="h-4 w-4 text-gray-400 dark:text-dark-text-tertiary" />
                                <span className="text-gray-500 dark:text-dark-text-tertiary">No change</span>
                              </>
                            )}
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* Rating Row */}
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-dark-text-primary">
                    Rating
                  </td>
                  {products.map((product) => (
                    <td key={product.id} className="px-6 py-4">
                      {product.rating ? (
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="ml-1 text-sm font-medium text-gray-900 dark:text-dark-text-primary">
                              {product.rating}
                            </span>
                          </div>
                          {product.reviewCount && (
                            <span className="text-xs text-gray-500 dark:text-dark-text-tertiary">
                              ({product.reviewCount})
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400 dark:text-dark-text-tertiary">No rating</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Source Row */}
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-dark-text-primary">
                    Source
                  </td>
                  {products.map((product) => (
                    <td key={product.id} className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Store className="h-4 w-4 text-gray-400 dark:text-dark-text-tertiary" />
                        <span className="text-sm text-gray-900 dark:text-dark-text-primary">
                          {getSourceDisplayName(product.source)}
                        </span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Availability Row */}
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-dark-text-primary">
                    Availability
                  </td>
                  {products.map((product) => (
                    <td key={product.id} className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getAvailabilityColor(
                        product.availability
                      )}`}>
                        {product.availability.replace('_', ' ')}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Last Updated Row */}
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-dark-text-primary">
                    Last Updated
                  </td>
                  {products.map((product) => (
                    <td key={product.id} className="px-6 py-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-dark-text-tertiary">
                        <Clock className="h-4 w-4" />
                        <span>{new Date(product.lastScraped).toLocaleString()}</span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Actions Row */}
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-dark-text-primary">
                    Actions
                  </td>
                  {products.map((product) => (
                    <td key={product.id} className="px-6 py-4">
                      <div className="flex space-x-2">
                        <a
                          href={product.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300 flex items-center text-sm font-medium transition-colors duration-150"
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View
                        </a>
                        <button
                          onClick={() => navigate(`/product/${product.id}`, { state: { product } })}
                          className="text-gray-600 dark:text-dark-text-secondary hover:text-gray-900 dark:hover:text-dark-text-primary text-sm font-medium transition-colors duration-150"
                        >
                          Details
                        </button>
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Price History Comparison Charts */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">
            Price History Comparison
          </h2>
          
          {products.map((product) => (
            <div key={product.id} className="bg-white dark:bg-dark-bg-secondary rounded-2xl shadow-soft border border-gray-200 dark:border-dark-border p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="h-12 w-12 rounded-xl overflow-hidden border border-gray-200 dark:border-dark-border">
                  <img
                    className="h-full w-full object-cover"
                    src={product.imageUrl || 'https://via.placeholder.com/48x48?text=No+Image'}
                    alt={product.name}
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-dark-text-primary">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-dark-text-secondary">
                    {getSourceDisplayName(product.source)}
                  </p>
                </div>
              </div>
              
              {/* Mock price history data - in real app this would come from API */}
              <PriceHistoryChart
                productId={product.id}
                data={[
                  // Generate mock data for demonstration
                  ...Array.from({ length: 30 }, (_, i) => ({
                    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
                    price: product.price + (Math.random() - 0.5) * 20,
                    currency: 'CAD',
                  }))
                ]}
                timeRange={selectedTimeRange}
                onTimeRangeChange={(range: '7d' | '30d' | '90d' | '1y') => setSelectedTimeRange(range)}
                currency={product.currency}
              />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default ProductComparison;
