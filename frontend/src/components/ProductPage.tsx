import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  ExternalLink,
  ShoppingCart,
  Bell,
  Share2,
  Star,
  TrendingDown,
  TrendingUp,
  Minus,
} from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { mockProducts, mockPriceHistory } from '../data/mockData';
import { Product } from '../lib/api';
import PriceHistoryChart from './PriceHistoryChart';

interface PriceHistoryPoint {
  date: string;
  price: number;
  currency: string;
}

const ProductPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [product, setProduct] = useState<Product | null>(null);
  const [priceHistory, setPriceHistory] = useState<PriceHistoryPoint[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState<
    '7d' | '30d' | '90d' | '1y'
  >('30d');
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (location.state?.product) {
      setProduct(location.state.product);
    } else if (slug) {
      // Find product from mock data by slug
      const foundProduct = mockProducts.find((p) => p.slug === slug);
      if (foundProduct) {
        setProduct(foundProduct);
      } else {
        // If no product found by slug, try to find by ID as fallback
        const foundById = mockProducts.find((p) => p.id === slug);
        if (foundById) {
          setProduct(foundById);
        }
      }
    }

    // Load price history
    if (product?.id && mockPriceHistory[product.id]) {
      setPriceHistory(mockPriceHistory[product.id]);
    }

    // Load related products (same category)
    if (product?.category) {
      const related = mockProducts
        .filter((p) => p.id !== product.id && p.category === product.category)
        .slice(0, 3);
      setRelatedProducts(related);
    }
  }, [slug, location.state, product?.id, product?.category]);

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">
              Product not found
            </h1>
            <Button onClick={() => navigate('/')} className="mt-4">
              Go Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const calculatePriceStats = () => {
    if (priceHistory.length === 0) return null;

    const prices = priceHistory.map((p) => p.price);
    const currentPrice = product.price;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;

    return {
      current: currentPrice,
      lowest: minPrice,
      highest: maxPrice,
      average: avgPrice,
      currentChange: product.priceChange || 0,
    };
  };

  const priceStats = calculatePriceStats();
  const timeRangeOptions = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: '1y', label: '1 Year' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
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
                <span>Back to Results</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Product Information */}
          <div className="space-y-6">
            {/* Product Image */}
            <div className="relative">
              <img
                src={product.image || '/placeholder-product.jpg'}
                alt={product.name}
                className="w-full h-96 object-cover rounded-lg bg-muted"
              />
              <Badge className="absolute bottom-4 left-4 bg-foreground text-background">
                {product.category}
              </Badge>
            </div>

            {/* Product Details */}
            <div className="space-y-4">
              <h1 className="text-3xl font-bold text-foreground leading-tight">
                {product.name}
              </h1>

              {/* Pricing */}
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <span className="text-4xl font-bold text-foreground">
                    ${product.price.toFixed(2)}
                  </span>
                  {product.originalPrice &&
                    product.originalPrice > product.price && (
                      <span className="text-2xl text-muted-foreground line-through">
                        ${product.originalPrice.toFixed(2)}
                      </span>
                    )}
                </div>

                {product.originalPrice &&
                  product.originalPrice > product.price && (
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-800"
                    >
                      {Math.round(
                        ((product.originalPrice - product.price) /
                          product.originalPrice) *
                          100
                      )}
                      % off
                    </Badge>
                  )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <Button
                  size="lg"
                  className="flex-1 bg-foreground text-background hover:bg-foreground/90"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Buy from {product.source}
                </Button>
                <Button variant="outline" size="lg">
                  <Bell className="h-4 w-4 mr-2" />
                  Set Alert
                </Button>
                <Button variant="outline" size="lg">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Rating & Reviews */}
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(product.rating || 0)
                          ? 'text-yellow-400 fill-current'
                          : 'text-muted-foreground'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-foreground">
                  {product.rating}/5 (
                  {product.reviewCount?.toLocaleString() || 0} reviews)
                </span>
              </div>

              {/* Availability & Source */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span
                    className={`text-sm font-medium ${
                      product.availability === 'in_stock'
                        ? 'text-green-600'
                        : product.availability === 'limited'
                        ? 'text-yellow-600'
                        : 'text-red-600'
                    }`}
                  >
                    {product.availability === 'in_stock'
                      ? 'In Stock'
                      : product.availability === 'limited'
                      ? 'Low Stock'
                      : 'Out of Stock'}
                  </span>
                </div>

                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <span>{product.source}</span>
                  <ExternalLink className="h-3 w-3" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Price History */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <h2 className="text-xl font-semibold text-foreground">
                    Price History
                  </h2>
                </div>

                {priceStats && (
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground">
                        Current
                      </div>
                      <div className="text-lg font-bold text-foreground">
                        ${priceStats.current.toFixed(2)}
                      </div>
                      <div className="flex items-center justify-center space-x-1 text-sm">
                        {priceStats.currentChange > 0 ? (
                          <TrendingUp className="h-3 w-3 text-red-500" />
                        ) : priceStats.currentChange < 0 ? (
                          <TrendingDown className="h-3 w-3 text-green-500" />
                        ) : (
                          <Minus className="h-3 w-3 text-muted-foreground" />
                        )}
                        <span
                          className={
                            priceStats.currentChange > 0
                              ? 'text-red-500'
                              : priceStats.currentChange < 0
                              ? 'text-green-500'
                              : 'text-muted-foreground'
                          }
                        >
                          {Math.abs(priceStats.currentChange).toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground">
                        Lowest
                      </div>
                      <div className="text-lg font-bold text-green-600">
                        ${priceStats.lowest.toFixed(2)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {Math.round(
                          ((priceStats.current - priceStats.lowest) /
                            priceStats.lowest) *
                            100
                        )}
                        % above
                      </div>
                    </div>

                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground">
                        Highest
                      </div>
                      <div className="text-lg font-bold text-red-600">
                        ${priceStats.highest.toFixed(2)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {Math.round(
                          ((priceStats.highest - priceStats.current) /
                            priceStats.current) *
                            100
                        )}
                        % below
                      </div>
                    </div>

                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground">
                        Average
                      </div>
                      <div className="text-lg font-bold text-foreground">
                        ${priceStats.average.toFixed(2)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {priceStats.current < priceStats.average
                          ? 'Below average'
                          : 'Above average'}
                      </div>
                    </div>
                  </div>
                )}

                {/* Time Range Tabs */}
                <Tabs
                  value={selectedTimeRange}
                  onValueChange={(value) => setSelectedTimeRange(value as any)}
                >
                  <TabsList className="grid w-full grid-cols-4">
                    {timeRangeOptions.map((option) => (
                      <TabsTrigger key={option.value} value={option.value}>
                        {option.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>

                {/* Price History Chart */}
                <PriceHistoryChart data={priceHistory} className="mt-6" />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h3 className="text-xl font-semibold text-foreground mb-6">
              Related Products
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Card
                  key={relatedProduct.id}
                  className="cursor-pointer hover:shadow-lg dark:hover:shadow-accent/20 transition-all duration-200 hover:-translate-y-1 hover:border-ring"
                  onClick={() => {
                    if (relatedProduct.slug) {
                      navigate(`/product/${relatedProduct.slug}`, {
                        state: { product: relatedProduct },
                      });
                    }
                  }}
                >
                  <CardContent className="p-4">
                    <img
                      src={relatedProduct.image || '/placeholder-product.jpg'}
                      alt={relatedProduct.name}
                      className="w-full h-32 object-cover rounded-lg mb-3 bg-muted"
                    />
                    <h4 className="font-medium text-foreground mb-2 line-clamp-2">
                      {relatedProduct.name}
                    </h4>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground">
                        ${relatedProduct.price.toFixed(2)}
                      </span>
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3 text-yellow-400 fill-current" />
                        <span className="text-sm text-muted-foreground">
                          {relatedProduct.rating}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductPage;
