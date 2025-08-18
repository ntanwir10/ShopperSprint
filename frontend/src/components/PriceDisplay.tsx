import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
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

  // Price change/original price not available; simplified display

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Current Price */}
      <div className="flex items-center gap-2">
        <span className="text-2xl font-bold text-foreground">
          {formatPrice(product.price, product.currency)}
        </span>

        {/* Price Change Indicator */}
        {/* price change not available in Product; hiding */}
      </div>

      {/* Price Details */}
      <div className="space-y-1">
        {/* Original Price (if different) */}
        {/* original price not provided; hiding */}

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
