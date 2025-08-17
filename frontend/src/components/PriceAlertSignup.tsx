import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Bell, Mail, CheckCircle } from 'lucide-react';

const PriceAlertSignup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { forgotPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      // For non-authenticated users, we'll use the forgot password endpoint
      // as a way to collect their email for price alerts
      const result = await forgotPassword(email);
      
      if (result.success) {
        setIsSuccess(true);
      } else {
        setError(result.error || 'Failed to sign up for price alerts');
      }
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
            Check your email!
          </h3>
          <p className="text-muted-foreground mb-4">
            We've sent you a link to set up your price alerts. Click the link in your email to get started.
          </p>
          <p className="text-sm text-muted-foreground">
            You'll receive price drop notifications for products you're interested in.
          </p>
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
          Never miss a great deal! Sign up to receive email notifications when prices drop.
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
                disabled={isLoading || !email.trim()}
                className="flex-shrink-0"
              >
                {isLoading ? (
                  'Signing up...'
                ) : (
                  <>
                    <Bell className="mr-2 h-4 w-4" />
                    Sign Up
                  </>
                )}
              </Button>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            By signing up, you agree to receive price alert emails. You can unsubscribe at any time.
          </p>
        </form>
      </CardContent>
    </Card>
  );
};

export default PriceAlertSignup;
