import React, { useState, useEffect } from 'react';
import { X, Bell, TrendingDown, DollarSign, Calendar, AlertCircle, CheckCircle } from 'lucide-react';

export interface PriceAlert {
  id: string;
  productId: string;
  targetPrice: number;
  currentPrice: number;
  frequency: 'immediate' | 'daily' | 'weekly';
  createdAt: string;
  isActive: boolean;
  lastTriggered?: string;
}

interface PriceAlertProps {
  productId: string;
  currentPrice: number;
  onSetAlert: (alert: Omit<PriceAlert, 'id' | 'createdAt' | 'isActive'>) => void;
  existingAlert?: PriceAlert;
  onClose: () => void;
  isOpen: boolean;
  currency?: string;
}

const PriceAlert: React.FC<PriceAlertProps> = ({
  productId,
  currentPrice,
  onSetAlert,
  existingAlert,
  onClose,
  isOpen,
  currency = 'USD'
}) => {
  const [targetPrice, setTargetPrice] = useState('');
  const [frequency, setFrequency] = useState<'immediate' | 'daily' | 'weekly'>('immediate');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (existingAlert) {
      setTargetPrice(existingAlert.targetPrice.toString());
      setFrequency(existingAlert.frequency);
    } else {
      setTargetPrice('');
      setFrequency('immediate');
    }
    setError('');
    setSuccess(false);
  }, [existingAlert, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!targetPrice || parseFloat(targetPrice) <= 0) {
      setError('Please enter a valid target price');
      return;
    }

    const targetPriceNum = parseFloat(targetPrice);
    
    if (targetPriceNum >= currentPrice) {
      setError('Target price must be lower than current price to set an alert');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onSetAlert({
        productId,
        targetPrice: targetPriceNum,
        currentPrice,
        frequency
      });
      
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError('Failed to set price alert. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  const priceDifference = currentPrice - parseFloat(targetPrice || '0');
  const priceDifferencePercent = ((priceDifference / currentPrice) * 100);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-dark-bg-secondary rounded-2xl shadow-strong border border-gray-200 dark:border-dark-border w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-border">
          <div className="flex items-center space-x-3">
            <div className="bg-primary-100 dark:bg-primary-900/20 rounded-full p-2">
              <Bell className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text-primary">
              {existingAlert ? 'Edit Price Alert' : 'Set Price Alert'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 dark:text-dark-text-tertiary dark:hover:text-dark-text-secondary transition-colors duration-200 disabled:opacity-50"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {success ? (
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 text-success-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary mb-2">
                Price Alert Set Successfully!
              </h3>
              <p className="text-gray-600 dark:text-dark-text-secondary">
                We'll notify you when the price drops to {currency}${targetPrice}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Current Price Display */}
              <div className="bg-gray-50 dark:bg-dark-bg-tertiary rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-dark-text-secondary">Current Price</span>
                  <span className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">
                    {currency}${currentPrice.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Target Price Input */}
              <div>
                <label htmlFor="targetPrice" className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                  Target Price
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-5 w-5 text-gray-400 dark:text-dark-text-tertiary" />
                  </div>
                  <input
                    type="number"
                    id="targetPrice"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    step="0.01"
                    min="0"
                    placeholder="Enter your target price"
                    className="block w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-dark-bg-secondary text-gray-900 dark:text-dark-text-primary placeholder-gray-500 dark:placeholder-dark-text-tertiary transition-colors duration-200"
                    disabled={isSubmitting}
                  />
                </div>
                {targetPrice && parseFloat(targetPrice) > 0 && (
                  <div className="mt-2 text-sm">
                    {parseFloat(targetPrice) < currentPrice ? (
                      <div className="text-success-600 dark:text-success-400 flex items-center space-x-1">
                        <TrendingDown className="h-4 w-4" />
                        <span>You'll save {currency}${priceDifference.toFixed(2)} ({priceDifferencePercent.toFixed(1)}%)</span>
                      </div>
                    ) : (
                      <div className="text-error-600 dark:text-error-400 flex items-center space-x-1">
                        <AlertCircle className="h-4 w-4" />
                        <span>Target price must be lower than current price</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Frequency Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-3">
                  Alert Frequency
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'immediate', label: 'Immediate', icon: Bell, description: 'Get notified instantly' },
                    { value: 'daily', label: 'Daily', icon: Calendar, description: 'Daily summary' },
                    { value: 'weekly', label: 'Weekly', icon: Calendar, description: 'Weekly summary' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFrequency(option.value as any)}
                      className={`p-3 rounded-xl border-2 transition-all duration-200 text-center ${
                        frequency === option.value
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                          : 'border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg-secondary text-gray-700 dark:text-dark-text-secondary hover:border-primary-300 dark:hover:border-primary-600'
                      }`}
                    >
                      <option.icon className="h-5 w-5 mx-auto mb-2" />
                      <div className="text-xs font-medium">{option.label}</div>
                      <div className="text-xs opacity-75">{option.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-xl p-3">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-error-500" />
                    <span className="text-sm text-error-700 dark:text-error-400">{error}</span>
                  </div>
                </div>
              )}

              {/* Info Box */}
              <div className="bg-info-50 dark:bg-info-900/20 border border-info-200 dark:border-info-800 rounded-xl p-3">
                <div className="flex items-start space-x-2">
                  <Bell className="h-5 w-5 text-info-500 mt-0.5" />
                  <div className="text-sm text-info-700 dark:text-info-400">
                    <p className="font-medium mb-1">Anonymous Price Alerts</p>
                    <p>No account required. We'll notify you via browser notifications when the price drops to your target.</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-dark-border rounded-xl text-gray-700 dark:text-dark-text-secondary bg-white dark:bg-dark-bg-secondary hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary transition-colors duration-200 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !targetPrice || parseFloat(targetPrice) >= currentPrice}
                  className="flex-1 px-4 py-3 bg-primary-600 dark:bg-primary-500 text-white rounded-xl hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      <span>Setting...</span>
                    </>
                  ) : (
                    <>
                      <Bell className="h-4 w-4" />
                      <span>{existingAlert ? 'Update Alert' : 'Set Alert'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default PriceAlert;
