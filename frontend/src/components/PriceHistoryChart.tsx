import React from 'react';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';

interface PriceHistoryPoint {
  date: string;
  price: number;
  currency: string;
}

interface PriceHistoryChartProps {
  data: PriceHistoryPoint[];
  className?: string;
}

const PriceHistoryChart: React.FC<PriceHistoryChartProps> = ({
  data,
  className = '',
}) => {
  if (!data || data.length === 0) {
    return (
      <div
        className={`h-64 bg-muted rounded-lg flex items-center justify-center ${className}`}
      >
        <div className="text-center text-muted-foreground">
          <div className="text-lg font-medium mb-2">No Price History</div>
          <div className="text-sm">
            Price history data is not available for this product
          </div>
        </div>
      </div>
    );
  }

  // Calculate chart dimensions and scaling
  const prices = data.map((p) => p.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice;

  // Create a simple SVG chart
  const chartWidth = 600;
  const chartHeight = 200;
  const padding = 40;
  const chartAreaWidth = chartWidth - padding * 2;
  const chartAreaHeight = chartHeight - padding * 2;

  // Generate SVG path for the price line
  const generatePath = () => {
    if (data.length < 2) return '';

    const points = data.map((point, index) => {
      const x = padding + (index / (data.length - 1)) * chartAreaWidth;
      const y =
        padding +
        chartAreaHeight -
        ((point.price - minPrice) / priceRange) * chartAreaHeight;
      return `${x},${y}`;
    });

    return `M ${points.join(' L ')}`;
  };

  // Generate Y-axis labels
  const generateYAxisLabels = () => {
    const steps = 5;
    const labels = [];

    for (let i = 0; i <= steps; i++) {
      const price = minPrice + (i / steps) * priceRange;
      const y = padding + chartAreaHeight - (i / steps) * chartAreaHeight;
      labels.push(
        <g key={i}>
          <line
            x1={padding}
            y1={y}
            x2={padding - 5}
            y2={y}
            stroke="currentColor"
            strokeWidth="1"
            className="text-muted-foreground"
          />
          <text
            x={padding - 10}
            y={y + 4}
            textAnchor="end"
            className="text-xs text-muted-foreground"
          >
            ${price.toFixed(0)}
          </text>
        </g>
      );
    }

    return labels;
  };

  // Generate X-axis labels (dates)
  const generateXAxisLabels = () => {
    const steps = Math.min(5, data.length - 1);
    const labels = [];

    for (let i = 0; i <= steps; i++) {
      const index = Math.floor((i / steps) * (data.length - 1));
      const point = data[index];
      const x = padding + (index / (data.length - 1)) * chartAreaWidth;
      const date = new Date(point.date);
      const month = date.toLocaleDateString('en-US', { month: 'short' });
      const day = date.getDate();

      labels.push(
        <g key={i}>
          <line
            x1={x}
            y1={chartHeight - padding}
            x2={x}
            y2={chartHeight - padding + 5}
            stroke="currentColor"
            strokeWidth="1"
            className="text-muted-foreground"
          />
          <text
            x={x}
            y={chartHeight - padding + 20}
            textAnchor="middle"
            className="text-xs text-muted-foreground"
          >
            {month} {day}
          </text>
        </g>
      );
    }

    return labels;
  };

  // Calculate price trend
  const getPriceTrend = () => {
    if (data.length < 2) return { direction: 'same', percentage: 0 };

    const firstPrice = data[0].price;
    const lastPrice = data[data.length - 1].price;
    const change = lastPrice - firstPrice;
    const percentage = Math.abs((change / firstPrice) * 100);

    return {
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'same',
      percentage: percentage,
    };
  };

  const trend = getPriceTrend();

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Chart Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-muted-foreground">
            Price Trend
          </span>
          <div className="flex items-center space-x-1">
            {trend.direction === 'up' ? (
              <TrendingUp className="h-4 w-4 text-red-500" />
            ) : trend.direction === 'down' ? (
              <TrendingDown className="h-4 w-4 text-green-500" />
            ) : (
              <Minus className="h-4 w-4 text-muted-foreground" />
            )}
            <span
              className={`text-sm font-medium ${
                trend.direction === 'up'
                  ? 'text-red-500'
                  : trend.direction === 'down'
                  ? 'text-green-500'
                  : 'text-muted-foreground'
              }`}
            >
              {trend.percentage.toFixed(1)}%
            </span>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          {data.length} data points
        </div>
      </div>

      {/* SVG Chart */}
      <div className="w-full overflow-x-auto">
        <svg
          width={chartWidth}
          height={chartHeight}
          className="w-full h-auto"
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        >
          {/* Grid lines */}
          <defs>
            <pattern
              id="grid"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 20 0 L 0 0 0 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-muted-foreground/20"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Chart area background */}
          <rect
            x={padding}
            y={padding}
            width={chartAreaWidth}
            height={chartAreaHeight}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-muted-foreground/30"
          />

          {/* Y-axis labels and lines */}
          {generateYAxisLabels()}

          {/* X-axis labels and lines */}
          {generateXAxisLabels()}

          {/* Price line */}
          <path
            d={generatePath()}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-primary"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {data.map((point, index) => {
            const x = padding + (index / (data.length - 1)) * chartAreaWidth;
            const y =
              padding +
              chartAreaHeight -
              ((point.price - minPrice) / priceRange) * chartAreaHeight;

            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="3"
                fill="currentColor"
                className="text-primary"
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export default PriceHistoryChart;
