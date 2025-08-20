import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Bell, CheckCircle, Search } from 'lucide-react';

const PriceAlertSignup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [productQuery, setProductQuery] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !productQuery.trim() || !targetPrice.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      // For now, we'll just collect the information and show success
      // In a real implementation, this would create a general price alert
      // or redirect to search results for the product
      setIsSuccess(true);
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <Card className="text-center">
        <CardContent className="pt-6">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Great! Here's what to do next:
          </h3>
          <p className="text-muted-foreground mb-4">
            Search for "{productQuery}" in the search bar above to find the
            exact product you want to track.
          </p>
          <p className="text-sm text-muted-foreground">
            Once you find the product, click the "Set Alert" button to create
            your price alert for ${targetPrice}.
          </p>
          <Button
            onClick={() => {
              setIsSuccess(false);
              setEmail('');
              setProductQuery('');
              setTargetPrice('');
            }}
            className="mt-4"
          >
            Set Another Alert
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Get Price Alerts
        </CardTitle>
        <CardDescription>
          Never miss a great deal! Set up price alerts for products you're
          interested in.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="productQuery" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              What product are you looking for?
            </Label>
            <Input
              id="productQuery"
              type="text"
              placeholder="e.g., iPhone 15, Samsung TV, MacBook Pro"
              value={productQuery}
              onChange={(e) => setProductQuery(e.target.value)}
              required
              disabled={isLoading}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetPrice" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              What's your target price?
            </Label>
            <Input
              id="targetPrice"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              required
              disabled={isLoading}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="flex gap-2">
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                type="submit"
                disabled={
                  isLoading ||
                  !email.trim() ||
                  !productQuery.trim() ||
                  !targetPrice.trim()
                }
                className="flex-shrink-0"
              >
                {isLoading ? (
                  'Setting up...'
                ) : (
                  <>
                    <Bell className="mr-2 h-4 w-4" />
                    Get Started
                  </>
                )}
              </Button>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            We'll help you find the product and set up your price alert. No
            account required!
          </p>
        </form>
      </CardContent>
    </Card>
  );
};

export default PriceAlertSignup;
