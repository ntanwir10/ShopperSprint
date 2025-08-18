import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, Bell, Mail, DollarSign, Percent } from 'lucide-react';
import { apiClient } from '../lib/api';

interface AnonymousPriceAlertProps {
  productId: string;
  productName: string;
  currentPrice: number;
  onSuccess?: () => void;
  compact?: boolean;
}

interface CreateAlertData {
  email: string;
  productId: string;
  targetPrice: number;
  currency: string;
  alertType: 'below' | 'above' | 'percentage';
  threshold?: number;
}

export const AnonymousPriceAlert: React.FC<AnonymousPriceAlertProps> = ({
  productId,
  productName,
  currentPrice,
  onSuccess,
  compact = false,
}) => {
  const [formData, setFormData] = useState<CreateAlertData>({
    email: '',
    productId: productId,
    targetPrice: Math.round(currentPrice * 0.9), // Default to 90% of current price
    currency: 'USD',
    alertType: 'below',
    threshold: 5,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const handleInputChange = (
    field: keyof CreateAlertData,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const res = await apiClient.createAnonymousAlert({
        email: formData.email,
        productId: formData.productId,
        targetPrice: formData.targetPrice / 100,
        currency: formData.currency,
        alertType: formData.alertType,
        threshold: formData.threshold,
      });

      if (res.error) throw new Error(res.error);

      setSuccess(
        'Price alert created successfully! Please check your email to verify.'
      );

      // Reset form
      setFormData({
        email: '',
        productId: productId,
        targetPrice: Math.round(currentPrice * 0.9),
        currency: 'USD',
        alertType: 'below',
        threshold: 5,
      });

      // Notify parent component
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: formData.currency,
    }).format(price / 100); // Convert from cents
  };

  if (compact) {
    return (
      <div className="space-y-3">
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-800 text-sm">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50">
            <AlertDescription className="text-green-800 text-sm">
              {success}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Email Input */}
          <div className="space-y-1">
            <Label htmlFor="email" className="text-sm">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
              className="text-sm"
            />
          </div>

          {/* Target Price Input */}
          <div className="space-y-1">
            <Label htmlFor="targetPrice" className="text-sm">
              Target Price
            </Label>
            <Input
              id="targetPrice"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={formData.targetPrice / 100}
              onChange={(e) =>
                handleInputChange(
                  'targetPrice',
                  Math.round(parseFloat(e.target.value) * 100) || 0
                )
              }
              required
              className="text-sm"
            />
            <p className="text-xs text-gray-500">
              Current: {formatPrice(currentPrice)}
            </p>
          </div>

          {/* Alert Type Selection */}
          <div className="space-y-1">
            <Label htmlFor="alertType" className="text-sm">
              Alert Type
            </Label>
            <Select
              value={formData.alertType}
              onValueChange={(value: 'below' | 'above' | 'percentage') =>
                handleInputChange('alertType', value)
              }
            >
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="below">Below target</SelectItem>
                <SelectItem value="above">Above target</SelectItem>
                <SelectItem value="percentage">Percentage change</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Threshold Input (for percentage alerts) */}
          {formData.alertType === 'percentage' && (
            <div className="space-y-1">
              <Label htmlFor="threshold" className="text-sm">
                Threshold (%)
              </Label>
              <Input
                id="threshold"
                type="number"
                step="0.1"
                min="0.1"
                max="100"
                placeholder="5.0"
                value={formData.threshold || ''}
                onChange={(e) =>
                  handleInputChange(
                    'threshold',
                    parseFloat(e.target.value) || 0
                  )
                }
                required
                className="text-sm"
              />
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            size="sm"
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Bell className="mr-2 h-3 w-3" />
                Create Alert
              </>
            )}
          </Button>
        </form>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-blue-600" />
          Create Price Alert
        </CardTitle>
        <CardDescription>
          Get notified when the price of {productName} reaches your target
        </CardDescription>
      </CardHeader>

      <CardContent>
        {error && (
          <Alert className="mb-4 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">
              {success}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Input */}
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
              className="w-full"
            />
          </div>

          {/* Target Price Input */}
          <div className="space-y-2">
            <Label htmlFor="targetPrice" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Target Price
            </Label>
            <Input
              id="targetPrice"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={formData.targetPrice / 100}
              onChange={(e) =>
                handleInputChange(
                  'targetPrice',
                  Math.round(parseFloat(e.target.value) * 100) || 0
                )
              }
              required
              className="w-full"
            />
            <p className="text-sm text-gray-500">
              Current price: {formatPrice(currentPrice)}
            </p>
          </div>

          {/* Alert Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="alertType">Alert Type</Label>
            <Select
              value={formData.alertType}
              onValueChange={(value: 'below' | 'above' | 'percentage') =>
                handleInputChange('alertType', value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select alert type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="below">Below target price</SelectItem>
                <SelectItem value="above">Above target price</SelectItem>
                <SelectItem value="percentage">Percentage change</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Threshold Input (for percentage alerts) */}
          {formData.alertType === 'percentage' && (
            <div className="space-y-2">
              <Label htmlFor="threshold" className="flex items-center gap-2">
                <Percent className="h-4 w-4" />
                Threshold (%)
              </Label>
              <Input
                id="threshold"
                type="number"
                step="0.1"
                min="0.1"
                max="100"
                placeholder="5.0"
                value={formData.threshold || ''}
                onChange={(e) =>
                  handleInputChange(
                    'threshold',
                    parseFloat(e.target.value) || 0
                  )
                }
                required
                className="w-full"
              />
              <p className="text-sm text-gray-500">
                Alert when price changes by this percentage
              </p>
            </div>
          )}

          {/* Currency Selection */}
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Select
              value={formData.currency}
              onValueChange={(value) => handleInputChange('currency', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
                <SelectItem value="GBP">GBP (£)</SelectItem>
                <SelectItem value="CAD">CAD (C$)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Submit Button */}
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Alert...
              </>
            ) : (
              <>
                <Bell className="mr-2 h-4 w-4" />
                Create Price Alert
              </>
            )}
          </Button>
        </form>

        {/* Information Box */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">How it works:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Enter your email and target price</li>
            <li>• We'll send you a verification email</li>
            <li>• Click the link to activate your alert</li>
            <li>• Get notified when the price reaches your target</li>
            <li>• No account required - completely anonymous</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnonymousPriceAlert;
