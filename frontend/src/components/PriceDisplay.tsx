import React from 'react';

interface PriceDisplayProps {
  price: number; // Price in cents
  currency: string;
  className?: string;
}

const PriceDisplay: React.FC<PriceDisplayProps> = ({
  price,
  currency,
  className = '',
}) => {
  // Convert cents to dollars
  const dollars = price / 100;
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(dollars);

  return (
    <span className={`font-semibold text-gray-900 ${className}`}>
      {formattedPrice}
    </span>
  );
};

export default PriceDisplay;
