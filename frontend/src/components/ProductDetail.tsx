import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  ExternalLink,
  Star,
  Store,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  Heart,
  Share2,
  BarChart3,
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

interface PriceHistoryPoint {
  date: string;
  price: number;
  source: string;
}

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [priceHistory, setPriceHistory] = useState<PriceHistoryPoint[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'history' | 'specs' | 'reviews'
  >('overview');

  useEffect(() => {
    if (location.state?.product) {
      setProduct(location.state.product);
      generateMockPriceHistory(location.state.product);
      generateMockRelatedProducts(location.state.product);
      setLoading(false);
    } else {
      // In a real app, fetch product by ID from API
      setError('Product not found');
      setLoading(false);
    }
  }, [location.state, id]);

  const generateMockPriceHistory = (product: Product) => {
    const history: PriceHistoryPoint[] = [];
    const sources = ['Amazon', 'Best Buy', 'Walmart', 'Target'];

    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      const basePrice = product.price;
      const variation = (Math.random() - 0.5) * 0.2; // ±10% variation
      const price = Math.round(basePrice * (1 + variation));
      const source = sources[Math.floor(Math.random() * sources.length)];

      history.push({
        date: date.toISOString(),
        price,
        source,
      });
    }

    setPriceHistory(history);
  };

  const generateMockRelatedProducts = (currentProduct: Product) => {
    const related: Product[] = [];
    const basePrice = currentProduct.price;

    for (let i = 1; i <= 4; i++) {
      const priceVariation = (Math.random() - 0.5) * 0.4; // ±20% variation
      const price = Math.round(basePrice * (1 + priceVariation));

      related.push({
        ...currentProduct,
        id: `related-${i}`,
        name: `${currentProduct.name} - Model ${i}`,
        price,
        rating: (currentProduct.rating || 4.5) + (Math.random() - 0.5) * 0.6,
        reviewCount: Math.floor(
          (currentProduct.reviewCount || 100) * (0.5 + Math.random() * 0.5)
        ),
      });
    }

    setRelatedProducts(related);
  };

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

  const getSourceDisplayName = (source: string) => {
    if (source.startsWith('Source ')) {
      return source.replace('Source ', '');
    }
    return source;
  };

  const getPriceTrend = () => {
    if (priceHistory.length < 2) return 'stable';

    const recent = priceHistory.slice(-7);
    const older = priceHistory.slice(-14, -7);

    const recentAvg =
      recent.reduce((sum, p) => sum + p.price, 0) / recent.length;
    const olderAvg = older.reduce((sum, p) => sum + p.price, 0) / older.length;

    if (recentAvg > olderAvg * 1.05) return 'up';
    if (recentAvg < olderAvg * 0.95) return 'down';
    return 'stable';
  };

  const getPriceTrendIcon = () => {
    const trend = getPriceTrend();
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-5 w-5 text-red-500" />;
      case 'down':
        return <TrendingDown className="h-5 w-5 text-green-500" />;
      default:
        return <Minus className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriceTrendText = () => {
    const trend = getPriceTrend();
    switch (trend) {
      case 'up':
        return 'Price trending up';
      case 'down':
        return 'Price trending down';
      default:
        return 'Price stable';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-6 text-gray-600 text-lg">
            Loading product details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <p className="text-lg text-gray-600 mb-4">
            {error || 'Product not found'}
          </p>
          <button
            onClick={() => navigate('/search')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Back to Search
          </button>
        </div>
      </div>
    );
  }

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
            <h1 className="text-2xl font-bold text-gray-900">
              Product Details
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Product Image and Basic Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
              {/* Product Image */}
              <div className="mb-6">
                <img
                  src={
                    product.imageUrl ||
                    'https://via.placeholder.com/400x400?text=No+Image'
                  }
                  alt={product.name}
                  className="w-full h-80 object-cover rounded-lg border border-gray-200"
                />
              </div>

              {/* Product Name */}
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <PriceDisplay
                    price={product.price}
                    currency={product.currency}
                    className="text-3xl font-bold text-gray-900"
                  />
                  <div className="flex items-center space-x-2">
                    {getPriceTrendIcon()}
                    <span className="text-sm text-gray-500">
                      {getPriceTrendText()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Rating */}
              {product.rating && (
                <div className="mb-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <Star className="h-5 w-5 text-yellow-400 fill-current" />
                    <span className="text-lg font-semibold text-gray-900">
                      {product.rating}
                    </span>
                    {product.reviewCount && (
                      <span className="text-gray-500">
                        ({product.reviewCount} reviews)
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Rating from:</span>
                    <span className="text-sm font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded-full">
                      {getSourceDisplayName(product.source)}
                    </span>
                  </div>
                </div>
              )}

              {/* Availability */}
              <div className="mb-6">
                <span
                  className={`inline-flex px-3 py-2 text-sm font-semibold rounded-lg border ${getAvailabilityColor(
                    product.availability
                  )}`}
                >
                  {product.availability.replace('_', ' ')}
                </span>
              </div>

              {/* Source */}
              <div className="mb-6">
                <div className="flex items-center space-x-2 mb-2">
                  <Store className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-500">Available at:</span>
                </div>
                <span className="text-lg font-medium text-gray-900">
                  {getSourceDisplayName(product.source)}
                </span>
              </div>

              {/* Last Updated */}
              <div className="mb-8">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-500">Last updated:</span>
                </div>
                <span className="text-sm text-gray-900">
                  {new Date(product.lastScraped).toLocaleString()}
                </span>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <a
                  href={product.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-blue-600 text-white text-center py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                >
                  <ExternalLink className="h-5 w-5 mr-2 inline" />
                  View on {getSourceDisplayName(product.source)}
                </a>
                <button
                  onClick={() =>
                    navigate('/search', { state: { query: product.name } })
                  }
                  className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
                >
                  Compare Prices
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Tabs and Content */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {[
                    { id: 'overview', label: 'Overview', icon: BarChart3 },
                    { id: 'history', label: 'Price History', icon: TrendingUp },
                    { id: 'specs', label: 'Specifications', icon: AlertCircle },
                    { id: 'reviews', label: 'Reviews', icon: Star },
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
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Product Overview
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        This is a detailed overview of {product.name}. The
                        product is currently available at{' '}
                        {getSourceDisplayName(product.source)}
                        for {product.currency} {product.price / 100}.
                        {product.rating &&
                          ` It has received a rating of ${product.rating} out of 5 stars based on ${product.reviewCount} customer reviews.`}
                      </p>
                    </div>

                    {/* Price Analysis */}
                    <div>
                      <h4 className="text-md font-semibold text-gray-900 mb-3">
                        Price Analysis
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <div className="text-2xl font-bold text-blue-600">
                            {product.currency}{' '}
                            {(product.price / 100).toFixed(2)}
                          </div>
                          <div className="text-sm text-blue-600">
                            Current Price
                          </div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                          <div className="text-2xl font-bold text-green-600">
                            {product.currency}{' '}
                            {((product.price * 0.9) / 100).toFixed(2)}
                          </div>
                          <div className="text-sm text-green-600">
                            Best Price (30 days)
                          </div>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                          <div className="text-2xl font-bold text-purple-600">
                            {product.currency}{' '}
                            {((product.price * 1.1) / 100).toFixed(2)}
                          </div>
                          <div className="text-sm text-purple-600">
                            Highest Price (30 days)
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'history' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Price History
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="h-64 flex items-center justify-center text-gray-500">
                        <div className="text-center">
                          <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                          <p>Price history chart would be displayed here</p>
                          <p className="text-sm">
                            Showing price trends over the last 30 days
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Price History Table */}
                    <div className="mt-6">
                      <h4 className="text-md font-semibold text-gray-900 mb-3">
                        Recent Price Changes
                      </h4>
                      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Date
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Price
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Source
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Change
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {priceHistory
                              .slice(-10)
                              .reverse()
                              .map((point, index) => {
                                const prevPrice =
                                  index < priceHistory.length - 1
                                    ? priceHistory[
                                        priceHistory.length - 2 - index
                                      ]?.price
                                    : point.price;
                                const change = point.price - prevPrice;
                                const changePercent =
                                  (change / prevPrice) * 100;

                                return (
                                  <tr
                                    key={point.date}
                                    className="hover:bg-gray-50"
                                  >
                                    <td className="px-4 py-3 text-sm text-gray-900">
                                      {new Date(
                                        point.date
                                      ).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                      {product.currency}{' '}
                                      {(point.price / 100).toFixed(2)}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                      {point.source}
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                      {change !== 0 ? (
                                        <span
                                          className={`flex items-center ${
                                            change > 0
                                              ? 'text-red-600'
                                              : 'text-green-600'
                                          }`}
                                        >
                                          {change > 0 ? (
                                            <TrendingUp className="h-4 w-4 mr-1" />
                                          ) : (
                                            <TrendingDown className="h-4 w-4 mr-1" />
                                          )}
                                          {changePercent > 0 ? '+' : ''}
                                          {changePercent.toFixed(1)}%
                                        </span>
                                      ) : (
                                        <span className="text-gray-500">-</span>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'specs' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Specifications
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="text-center text-gray-500">
                        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p>Product specifications would be displayed here</p>
                        <p className="text-sm">
                          Detailed technical information and features
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Customer Reviews
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="text-center text-gray-500">
                        <Star className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p>Customer reviews would be displayed here</p>
                        <p className="text-sm">
                          User feedback and ratings from various sources
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Related Products */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Related Products
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {relatedProducts.map((relatedProduct) => (
                  <div
                    key={relatedProduct.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors duration-200 cursor-pointer"
                    onClick={() =>
                      navigate(`/product/${relatedProduct.id}`, {
                        state: { product: relatedProduct },
                      })
                    }
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={
                          relatedProduct.imageUrl ||
                          'https://via.placeholder.com/60x60?text=No+Image'
                        }
                        alt={relatedProduct.name}
                        className="w-15 h-15 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {relatedProduct.name}
                        </h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <PriceDisplay
                            price={relatedProduct.price}
                            currency={relatedProduct.currency}
                            className="text-sm font-semibold text-gray-900"
                          />
                          {relatedProduct.rating && (
                            <div className="flex items-center space-x-1">
                              <Star className="h-3 w-3 text-yellow-400 fill-current" />
                              <span className="text-xs text-gray-600">
                                {relatedProduct.rating}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductDetail;
