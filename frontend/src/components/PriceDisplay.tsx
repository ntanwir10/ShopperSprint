import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Badge } from './ui/badge';
import { Product } from '../lib/api';

interface PriceDisplayProps {
  product: Product;
  className?: string;
}

const PriceDisplay: React.FC<PriceDisplayProps> = ({
  product,
  className = '',
}) => {
  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(price);
  };

  const getPriceChangeIcon = (priceChange: number) => {
    if (priceChange > 0) {
      return <TrendingUp className="w-4 h-4 text-destructive" />;
    } else if (priceChange < 0) {
      return <TrendingDown className="w-4 h-4 text-green-600" />;
    }
    return null;
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Current Price */}
      <div className="flex items-center gap-2">
        <span className="text-2xl font-bold text-foreground">
          {formatPrice(product.price, product.currency)}
        </span>

        {/* Price Change Indicator */}
        {product.priceChange && product.priceChange !== 0 && (
          <Badge
            variant={product.priceChange > 0 ? 'destructive' : 'default'}
            className={
              product.priceChange > 0 ? '' : 'bg-green-600 hover:bg-green-700'
            }
          >
            <div className="flex items-center gap-1">
              {getPriceChangeIcon(product.priceChange)}
              <span>{Math.abs(product.priceChange).toFixed(2)}%</span>
            </div>
          </Badge>
        )}
      </div>

      {/* Price Details */}
      <div className="space-y-1">
        {/* Original Price (if different) */}
        {product.originalPrice && product.originalPrice > product.price && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(product.originalPrice, product.currency)}
            </span>
            <Badge variant="secondary" className="text-xs">
              Save{' '}
              {formatPrice(
                product.originalPrice - product.price,
                product.currency
              )}
            </Badge>
          </div>
        )}

        {/* Source and Last Updated */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>from {product.source}</span>
          {product.lastScraped && (
            <span>
              Updated {new Date(product.lastScraped).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default PriceDisplay;
