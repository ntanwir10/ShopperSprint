import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Star,
  ExternalLink,
  Store,
  TrendingUp,
  TrendingDown,
  Bell,
  Share2,
  Heart,
} from 'lucide-react';
import Header from './Header';
import PriceDisplay from './PriceDisplay';
import PriceHistoryChart from './PriceHistoryChart';
import PriceAlert from './PriceAlert';
import { type Product } from '../lib/api';

interface ProductDetailProps {}

const ProductDetail: React.FC<ProductDetailProps> = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedTimeRange, setSelectedTimeRange] = useState<
    '7d' | '30d' | '90d' | '1y'
  >('30d');
  const [showPriceAlert, setShowPriceAlert] = useState(false);
  const [existingAlert, setExistingAlert] = useState<any>(null);

  useEffect(() => {
    if (location.state?.product) {
      setProduct(location.state.product);
      setLoading(false);
    } else {
      // In a real app, fetch product by ID from API
      setError('Product not found');
      setLoading(false);
    }
  }, [location.state]);

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

  const getPriceChange = () => {
    // Mock price change data - in real app this would come from price history
    const mockChange = Math.random() * 100 - 50; // Random change between -50 and +50
    return {
      change: mockChange,
      percent: (mockChange / (product?.price || 1)) * 100,
      isPositive: mockChange >= 0,
    };
  };

  const handleSetAlert = async (alertData: any) => {
    // In a real app, this would call the API to create/update the alert
    console.log('Setting price alert:', alertData);
    setExistingAlert({
      id: 'mock-alert-id',
      ...alertData,
      createdAt: new Date().toISOString(),
      isActive: true,
    });
    setShowPriceAlert(false);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.name,
        text: `Check out this product: ${product?.name}`,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-bg-primary dark:to-dark-bg-secondary">
        <Header />
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 dark:border-primary-400 mx-auto"></div>
          <p className="mt-6 text-gray-600 dark:text-dark-text-secondary">
            Loading product...
          </p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-bg-primary dark:to-dark-bg-secondary">
        <Header />
        <div className="text-center py-16">
          <p className="text-gray-600 dark:text-dark-text-secondary">
            {error || 'Product not found'}
          </p>
          <button
            onClick={() => navigate('/search')}
            className="mt-4 px-6 py-2 bg-primary-600 dark:bg-primary-500 text-white rounded-xl hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors duration-200"
          >
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  const priceChange = getPriceChange();
  const mockImages = [
    product.imageUrl || 'https://via.placeholder.com/600x400?text=No+Image',
    'https://via.placeholder.com/600x400?text=Image+2',
    'https://via.placeholder.com/600x400?text=Image+3',
    'https://via.placeholder.com/600x400?text=Image+4',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-bg-primary dark:to-dark-bg-secondary transition-colors duration-200">
      <Header />

      {/* Breadcrumb Navigation */}
      <div className="bg-white dark:bg-dark-bg-secondary shadow-soft border-b border-gray-200 dark:border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center space-x-2 py-4">
            <button
              onClick={() => navigate('/search')}
              className="text-gray-500 dark:text-dark-text-tertiary hover:text-gray-700 dark:hover:text-dark-text-secondary transition-colors duration-200"
            >
              Search
            </button>
            <span className="text-gray-400 dark:text-dark-text-tertiary">
              /
            </span>
            <span className="text-gray-900 dark:text-dark-text-primary font-medium">
              {product.name.length > 50
                ? product.name.substring(0, 50) + '...'
                : product.name}
            </span>
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="bg-white dark:bg-dark-bg-secondary rounded-2xl shadow-soft border border-gray-200 dark:border-dark-border overflow-hidden">
              <img
                src={mockImages[selectedImageIndex]}
                alt={product.name}
                className="w-full h-96 object-cover"
              />
            </div>

            {/* Thumbnail Images */}
            <div className="grid grid-cols-4 gap-3">
              {mockImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                    selectedImageIndex === index
                      ? 'border-primary-500 dark:border-primary-400'
                      : 'border-gray-200 dark:border-dark-border hover:border-gray-300 dark:hover:border-dark-text-tertiary'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            {/* Product Title and Actions */}
            <div className="bg-white dark:bg-dark-bg-secondary rounded-2xl shadow-soft border border-gray-200 dark:border-dark-border p-6">
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-dark-text-primary">
                  {product.name}
                </h1>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleShare}
                    className="p-2 text-gray-400 dark:text-dark-text-tertiary hover:text-gray-600 dark:hover:text-dark-text-secondary transition-colors duration-200"
                  >
                    <Share2 className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-gray-400 dark:text-dark-text-tertiary hover:text-red-500 transition-colors duration-200">
                    <Heart className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Price and Change */}
              <div className="mb-4">
                <div className="flex items-center space-x-4 mb-2">
                  <div className="text-3xl font-bold text-gray-900 dark:text-dark-text-primary">
                    <PriceDisplay
                      price={product.price}
                      currency={product.currency}
                    />
                  </div>
                  {priceChange.change !== 0 && (
                    <div className="flex items-center space-x-1">
                      {priceChange.isPositive ? (
                        <TrendingUp className="h-5 w-5 text-error-500" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-success-500" />
                      )}
                      <span
                        className={`text-sm font-medium ${
                          priceChange.isPositive
                            ? 'text-error-600 dark:text-error-400'
                            : 'text-success-600 dark:text-success-400'
                        }`}
                      >
                        {priceChange.isPositive ? '+' : ''}
                        {priceChange.change.toFixed(2)} (
                        {priceChange.percent.toFixed(1)}%)
                      </span>
                    </div>
                  )}
                </div>

                {/* Best Deal Badge */}
                <div className="inline-flex items-center px-3 py-1 bg-success-100 dark:bg-success-900/20 text-success-800 dark:text-success-200 rounded-full text-sm font-medium">
                  <span>💰 Best Deal Available</span>
                </div>
              </div>

              {/* Source and Availability */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <Store className="h-5 w-5 text-gray-400 dark:text-dark-text-tertiary" />
                  <span className="text-gray-600 dark:text-dark-text-secondary">
                    {getSourceDisplayName(product.source)}
                  </span>
                </div>
                <span
                  className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getAvailabilityColor(
                    product.availability
                  )}`}
                >
                  {product.availability.replace('_', ' ')}
                </span>
              </div>

              {/* Rating */}
              {product.rating && (
                <div className="flex items-center space-x-2 mb-6">
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-400 fill-current" />
                    <span className="ml-1 text-lg font-semibold text-gray-900 dark:text-dark-text-primary">
                      {product.rating}
                    </span>
                  </div>
                  {product.reviewCount && (
                    <span className="text-gray-500 dark:text-dark-text-tertiary">
                      ({product.reviewCount} reviews)
                    </span>
                  )}
                  <span className="text-xs text-gray-400 dark:text-dark-text-tertiary bg-gray-100 dark:bg-dark-bg-tertiary px-2 py-1 rounded-full">
                    {getSourceDisplayName(product.source)}
                  </span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <a
                  href={product.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-primary-600 dark:bg-primary-500 text-white text-center py-3 px-4 rounded-xl hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors duration-200 font-medium flex items-center justify-center space-x-2"
                >
                  <ExternalLink className="h-5 w-5" />
                  <span>View on {getSourceDisplayName(product.source)}</span>
                </a>
                <button
                  onClick={() => setShowPriceAlert(true)}
                  className="px-6 py-3 bg-success-600 dark:bg-success-500 text-white rounded-xl hover:bg-success-700 dark:hover:bg-success-600 transition-colors duration-200 font-medium flex items-center space-x-2"
                >
                  <Bell className="h-5 w-5" />
                  <span>Set Alert</span>
                </button>
              </div>
            </div>

            {/* Product Details */}
            <div className="bg-white dark:bg-dark-bg-secondary rounded-2xl shadow-soft border border-gray-200 dark:border-dark-border p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text-primary mb-4">
                Product Details
              </h2>
              <div className="space-y-3 text-sm text-gray-600 dark:text-dark-text-secondary">
                <div className="flex justify-between">
                  <span>Last Updated:</span>
                  <span className="text-gray-900 dark:text-dark-text-primary">
                    {new Date(product.lastScraped).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Source:</span>
                  <span className="text-gray-900 dark:text-dark-text-primary">
                    {getSourceDisplayName(product.source)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Availability:</span>
                  <span className="text-gray-900 dark:text-dark-text-primary">
                    {product.availability.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Price History Chart */}
        <div className="mt-12">
          <PriceHistoryChart
            productId={product.id}
            data={[
              // Generate mock data for demonstration
              ...Array.from({ length: 30 }, (_, i) => ({
                date: new Date(
                  Date.now() - (29 - i) * 24 * 60 * 60 * 1000
                ).toISOString(),
                price: product.price + (Math.random() - 0.5) * 20,
                currency: product.currency || 'CAD',
              })),
            ]}
            timeRange={selectedTimeRange}
            onTimeRangeChange={setSelectedTimeRange}
            currency={product.currency}
          />
        </div>

        {/* Related Products */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary mb-6">
            Related Products
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Mock related products - in real app this would come from API */}
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-dark-bg-secondary rounded-2xl shadow-soft border border-gray-200 dark:border-dark-border p-4 hover:shadow-medium transition-all duration-200"
              >
                <div className="h-32 bg-gray-100 dark:bg-dark-bg-tertiary rounded-xl mb-3"></div>
                <h3 className="font-medium text-gray-900 dark:text-dark-text-primary mb-2">
                  Related Product {i}
                </h3>
                <p className="text-sm text-gray-600 dark:text-dark-text-secondary">
                  Similar product from different source
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Price Alert Modal */}
      <PriceAlert
        productId={product.id}
        currentPrice={product.price}
        onSetAlert={handleSetAlert}
        existingAlert={existingAlert}
        onClose={() => setShowPriceAlert(false)}
        isOpen={showPriceAlert}
        currency={product.currency}
      />
    </div>
  );
};

export default ProductDetail;
