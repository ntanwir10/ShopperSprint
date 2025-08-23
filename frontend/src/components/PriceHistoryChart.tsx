import React, { useMemo } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, Minus, Clock, DollarSign } from 'lucide-react';
import { PriceHistoryPoint } from '../lib/api';

interface PriceHistoryProps {
  productId?: string;
  data: PriceHistoryPoint[];
  timeRange?: '7d' | '30d' | '90d' | '1y';
  onTimeRangeChange?: (range: '7d' | '30d' | '90d' | '1y') => void;
  loading?: boolean;
  currency?: string;
  className?: string;
}

const PriceHistoryChart: React.FC<PriceHistoryProps> = ({
  data,
  timeRange,
  onTimeRangeChange,
  loading = false,
  currency = 'USD'
}) => {
  // Process data for chart display
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Sort by date and group by date to show average price per day
    const groupedData = data.reduce((acc, point) => {
      const date = new Date(point.date).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { prices: [], sources: new Set() };
      }
      acc[date].prices.push(point.price);
      // Handle missing source property gracefully
      const source = (point as any).source || 'Unknown';
      acc[date].sources.add(source);
      return acc;
    }, {} as Record<string, { prices: number[], sources: Set<string> }>);

    return Object.entries(groupedData)
      .map(([date, { prices, sources }]) => ({
        date,
        price: prices.reduce((sum, p) => sum + p, 0) / prices.length,
        minPrice: Math.min(...prices),
        maxPrice: Math.max(...prices),
        sourceCount: sources.size,
        formattedDate: new Date(date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        })
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [data]);

  // Calculate price statistics
  const priceStats = useMemo(() => {
    if (chartData.length === 0) return null;

    const prices = chartData.map(d => d.price);
    const currentPrice = prices[prices.length - 1];
    const previousPrice = prices[prices.length - 2] || currentPrice;
    const change = currentPrice - previousPrice;
    const changePercent = (change / previousPrice) * 100;
    const isPositive = change >= 0;

    return {
      currentPrice,
      change,
      changePercent,
      isPositive,
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
      avgPrice: prices.reduce((sum, p) => sum + p, 0) / prices.length
    };
  }, [chartData]);

  // Time range options
  const timeRangeOptions = [
    { value: '7d' as const, label: '7 Days', days: 7 },
    { value: '30d' as const, label: '30 Days', days: 30 },
    { value: '90d' as const, label: '90 Days', days: 90 },
    { value: '1y' as const, label: '1 Year', days: 365 }
  ];

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-dark-bg-secondary border border-gray-200 dark:border-dark-border rounded-xl p-3 shadow-strong">
          <p className="font-semibold text-gray-900 dark:text-dark-text-primary">
            {new Date(data.date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
          <div className="mt-2 space-y-1">
            <p className="text-sm text-gray-600 dark:text-dark-text-secondary">
              Average Price: <span className="font-medium text-gray-900 dark:text-dark-text-primary">
                {currency}${data.price.toFixed(2)}
              </span>
            </p>
            <p className="text-sm text-gray-600 dark:text-dark-text-secondary">
              Range: <span className="font-medium text-gray-900 dark:text-dark-text-primary">
                {currency}${data.minPrice.toFixed(2)} - {currency}${data.maxPrice.toFixed(2)}
              </span>
            </p>
            <p className="text-sm text-gray-600 dark:text-dark-text-secondary">
              Sources: <span className="font-medium text-gray-900 dark:text-dark-text-primary">
                {data.sourceCount}
              </span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-dark-bg-secondary rounded-2xl p-6 shadow-soft border border-gray-200 dark:border-dark-border">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-dark-bg-tertiary rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 dark:bg-dark-bg-tertiary rounded mb-4"></div>
          <div className="flex space-x-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-8 bg-gray-200 dark:bg-dark-bg-tertiary rounded w-16"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-dark-bg-secondary rounded-2xl p-8 shadow-soft border border-gray-200 dark:border-dark-border text-center">
        <Clock className="h-16 w-16 text-gray-400 dark:text-dark-text-tertiary mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary mb-2">
          No Price History Available
        </h3>
        <p className="text-gray-600 dark:text-dark-text-secondary">
          We're collecting price data for this product. Check back soon for historical pricing information.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-dark-bg-secondary rounded-2xl p-6 shadow-soft border border-gray-200 dark:border-dark-border">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-dark-text-primary mb-2">
            Price History
          </h3>
          {priceStats && (
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-gray-500 dark:text-dark-text-tertiary" />
                <span className="text-gray-600 dark:text-dark-text-secondary">Current:</span>
                <span className="font-semibold text-gray-900 dark:text-dark-text-primary">
                  {currency}${priceStats.currentPrice.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {priceStats.isPositive ? (
                  <TrendingUp className="h-4 w-4 text-success-500" />
                ) : priceStats.change < 0 ? (
                  <TrendingDown className="h-4 w-4 text-error-500" />
                ) : (
                  <Minus className="h-4 w-4 text-gray-500 dark:text-dark-text-tertiary" />
                )}
                <span className={`font-medium ${
                  priceStats.isPositive 
                    ? 'text-success-600 dark:text-success-400' 
                    : priceStats.change < 0 
                      ? 'text-error-600 dark:text-error-400'
                      : 'text-gray-600 dark:text-dark-text-secondary'
                }`}>
                  {priceStats.change >= 0 ? '+' : ''}{currency}${priceStats.change.toFixed(2)} 
                  ({priceStats.changePercent >= 0 ? '+' : ''}{priceStats.changePercent.toFixed(1)}%)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center space-x-2 bg-gray-100 dark:bg-dark-bg-tertiary rounded-xl p-1">
          {timeRangeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onTimeRangeChange?.(option.value)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                timeRange === option.value
                  ? 'bg-white dark:bg-dark-bg-secondary text-primary-600 dark:text-primary-400 shadow-soft'
                  : 'text-gray-600 dark:text-dark-text-secondary hover:text-gray-900 dark:hover:text-dark-text-primary'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price Statistics Cards */}
      {priceStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 dark:bg-dark-bg-tertiary rounded-xl p-3">
            <p className="text-xs text-gray-500 dark:text-dark-text-tertiary mb-1">Lowest Price</p>
            <p className="text-lg font-semibold text-success-600 dark:text-success-400">
              {currency}${priceStats.minPrice.toFixed(2)}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-dark-bg-tertiary rounded-xl p-3">
            <p className="text-xs text-gray-500 dark:text-dark-text-tertiary mb-1">Highest Price</p>
            <p className="text-lg font-semibold text-error-600 dark:text-error-400">
              {currency}${priceStats.maxPrice.toFixed(2)}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-dark-bg-tertiary rounded-xl p-3">
            <p className="text-xs text-gray-500 dark:text-dark-text-tertiary mb-1">Average Price</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary">
              {currency}${priceStats.avgPrice.toFixed(2)}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-dark-bg-tertiary rounded-xl p-3">
            <p className="text-xs text-gray-500 dark:text-dark-text-tertiary mb-1">Data Points</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary">
              {chartData.length}
            </p>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#e5e7eb" 
              className="dark:stroke-dark-border" 
            />
            <XAxis 
              dataKey="formattedDate" 
              stroke="#6b7280" 
              className="dark:stroke-dark-text-tertiary"
              fontSize={12}
            />
            <YAxis 
              stroke="#6b7280" 
              className="dark:stroke-dark-text-tertiary"
              fontSize={12}
              tickFormatter={(value) => `${currency}$${value.toFixed(0)}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#priceGradient)"
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Legend */}
      <div className="mt-4 flex items-center justify-center space-x-6 text-sm text-gray-600 dark:text-dark-text-secondary">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
          <span>Average Price</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-success-500 rounded-full"></div>
          <span>Price Drop</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-error-500 rounded-full"></div>
          <span>Price Increase</span>
        </div>
      </div>
    </div>
  );
};

export default PriceHistoryChart;
