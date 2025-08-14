import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ExternalLink,
  Star,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  BarChart3,
  DollarSign,
  Clock,
  Store,
  Heart,
  Share2,
} from 'lucide-react';
import PriceDisplay from './PriceDisplay';

interface Product {
  id: string;
  name: string;
  price: number;
  currency: string;
  availability: 'in_stock' | 'out_of_stock' | 'limited' | 'unknown';
  source: string;
  imageUrl?: string;
  rating?: number;
  reviewCount?: number;
  url: string;
  lastScraped: string;
}

const ProductComparison: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'detailed' | 'analysis'
  >('overview');

  useEffect(() => {
    if (location.state?.products) {
      setProducts(location.state.products);
    } else {
      // Redirect back to search if no products to compare
      navigate('/search');
    }
  }, [location.state, navigate]);

  if (products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No products to compare</p>
          <button onClick={() => navigate('/search')} className="btn-primary">
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'in_stock':
        return 'text-green-600 bg-green-100 border-green-200';
      case 'out_of_stock':
        return 'text-red-600 bg-red-100 border-red-200';
      case 'limited':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getAvailabilityIcon = (availability: string) => {
    switch (availability) {
      case 'in_stock':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'out_of_stock':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'limited':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  const getBestPrice = () => {
    const inStockProducts = products.filter(
      (p) => p.availability === 'in_stock'
    );
    if (inStockProducts.length === 0) return null;

    return inStockProducts.reduce((best, current) =>
      current.price < best.price ? current : best
    );
  };

  const getPriceDifference = (product: Product, bestPrice: number) => {
    const difference = product.price - bestPrice;
    const percentage = ((difference / bestPrice) * 100).toFixed(1);

    if (difference === 0)
      return { text: 'Best Price', color: 'text-green-600', icon: CheckCircle };
    if (difference > 0)
      return {
        text: `+${percentage}% more`,
        color: 'text-red-600',
        icon: TrendingUp,
      };
    return {
      text: `${percentage}% less`,
      color: 'text-green-600',
      icon: TrendingDown,
    };
  };

  const getSourceDisplayName = (source: string) => {
    if (source.startsWith('Source ')) {
      return source.replace('Source ', '');
    }
    return source;
  };

  const bestPrice = getBestPrice();

  const getPriceRange = () => {
    const prices = products.map((p) => p.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min;
    const rangePercent = ((range / min) * 100).toFixed(1);

    return { min, max, range, rangePercent };
  };

  const priceRange = getPriceRange();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <button
              onClick={() => navigate('/search')}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Search
            </button>
            <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Product Comparison
            </h1>
            <div className="flex items-center space-x-3">
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200">
                <Heart className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200">
                <Share2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Best Price</p>
                {bestPrice && (
                  <PriceDisplay
                    price={bestPrice.price}
                    currency={bestPrice.currency}
                    className="text-2xl font-bold text-gray-900"
                  />
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingDown className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Price Range</p>
                <p className="text-2xl font-bold text-gray-900">
                  {priceRange.rangePercent}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Store className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Sources</p>
                <p className="text-2xl font-bold text-gray-900">
                  {products.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Last Updated
                </p>
                <p className="text-sm font-bold text-gray-900">
                  {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Best Price Alert */}
        {bestPrice && (
          <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-green-800 mb-1">
                  💰 Best Price Found
                </h3>
                <p className="text-green-700">
                  <strong>{getSourceDisplayName(bestPrice.source)}</strong> has
                  the best price at{' '}
                  <PriceDisplay
                    price={bestPrice.price}
                    currency={bestPrice.currency}
                    className="font-bold"
                  />
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'detailed', label: 'Detailed Comparison', icon: Info },
                { id: 'analysis', label: 'Price Analysis', icon: TrendingUp },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors duration-200 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => {
                  const priceDiff = bestPrice
                    ? getPriceDifference(product, bestPrice.price)
                    : null;

                  return (
                    <div
                      key={product.id}
                      className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200"
                    >
                      {/* Product Image */}
                      <div className="h-48 bg-gray-200 flex items-center justify-center relative">
                        <img
                          src={
                            product.imageUrl ||
                            'https://via.placeholder.com/300x200?text=No+Image'
                          }
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                        {priceDiff && (
                          <div className="absolute top-3 right-3">
                            <span
                              className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-white shadow-sm ${priceDiff.color}`}
                            >
                              <priceDiff.icon className="h-3 w-3 mr-1" />
                              {priceDiff.text}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                          {product.name}
                        </h3>

                        {/* Source */}
                        <div className="flex items-center mb-4">
                          <Store className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900">
                            {getSourceDisplayName(product.source)}
                          </span>
                        </div>

                        {/* Price */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between">
                            <PriceDisplay
                              price={product.price}
                              currency={product.currency}
                              className="text-2xl font-bold text-gray-900"
                            />
                            {priceDiff && (
                              <div
                                className={`text-sm ${priceDiff.color} font-medium`}
                              >
                                {priceDiff.text}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Availability */}
                        <div className="mb-4">
                          <div className="flex items-center space-x-2">
                            {getAvailabilityIcon(product.availability)}
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getAvailabilityColor(
                                product.availability
                              )}`}
                            >
                              {product.availability.replace('_', ' ')}
                            </span>
                          </div>
                        </div>

                        {/* Rating */}
                        {product.rating && (
                          <div className="mb-6">
                            <div className="flex items-center space-x-2 mb-2">
                              <Star className="h-4 w-4 text-yellow-400 fill-current" />
                              <span className="text-sm font-medium text-gray-900">
                                {product.rating}
                              </span>
                              {product.reviewCount && (
                                <span className="text-sm text-gray-500">
                                  ({product.reviewCount} reviews)
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full inline-block">
                              Rating from {getSourceDisplayName(product.source)}
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex space-x-3">
                          <a
                            href={product.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 bg-blue-600 text-white text-center py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
                          >
                            <ExternalLink className="h-4 w-4 mr-2 inline" />
                            View
                          </a>
                          <button
                            onClick={() =>
                              navigate(`/product/${product.id}`, {
                                state: { product },
                              })
                            }
                            className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm font-medium"
                          >
                            Details
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === 'detailed' && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Feature
                      </th>
                      {products.map((product) => (
                        <th
                          key={product.id}
                          className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {getSourceDisplayName(product.source)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Product Name
                      </td>
                      {products.map((product) => (
                        <td
                          key={product.id}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                        >
                          {product.name}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Price
                      </td>
                      {products.map((product) => (
                        <td
                          key={product.id}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                        >
                          <PriceDisplay
                            price={product.price}
                            currency={product.currency}
                          />
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Availability
                      </td>
                      {products.map((product) => (
                        <td
                          key={product.id}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                        >
                          <div className="flex items-center space-x-2">
                            {getAvailabilityIcon(product.availability)}
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getAvailabilityColor(
                                product.availability
                              )}`}
                            >
                              {product.availability.replace('_', ' ')}
                            </span>
                          </div>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Rating
                      </td>
                      {products.map((product) => (
                        <td
                          key={product.id}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                        >
                          {product.rating ? (
                            <div className="flex items-center space-x-2">
                              <Star className="h-4 w-4 text-yellow-400 fill-current" />
                              <span>{product.rating}</span>
                              {product.reviewCount && (
                                <span className="text-gray-500">
                                  ({product.reviewCount})
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">No rating</span>
                          )}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Last Updated
                      </td>
                      {products.map((product) => (
                        <td
                          key={product.id}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                        >
                          {new Date(product.lastScraped).toLocaleString()}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'analysis' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Price Analysis
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <div className="text-2xl font-bold text-blue-600">
                        {products[0]?.currency}{' '}
                        {(priceRange.min / 100).toFixed(2)}
                      </div>
                      <div className="text-sm text-blue-600">Lowest Price</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <div className="text-2xl font-bold text-green-600">
                        {products[0]?.currency}{' '}
                        {(priceRange.max / 100).toFixed(2)}
                      </div>
                      <div className="text-sm text-green-600">
                        Highest Price
                      </div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <div className="text-2xl font-bold text-purple-600">
                        {priceRange.rangePercent}%
                      </div>
                      <div className="text-sm text-purple-600">Price Range</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-3">
                    Price Distribution
                  </h4>
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <div className="h-32 flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p>Price distribution chart would be displayed here</p>
                        <p className="text-sm">
                          Showing price spread across all sources
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductComparison;
