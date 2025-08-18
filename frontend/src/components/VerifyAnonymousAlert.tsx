import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import {
  Loader2,
  CheckCircle,
  XCircle,
  Bell,
  Mail,
  ExternalLink,
} from 'lucide-react';
import { apiClient } from '../lib/api';

interface VerificationResult {
  id: string;
  email: string;
  targetPrice: number;
  currency: string;
  alertType: string;
  threshold?: number;
  isVerified: boolean;
  managementToken: string;
}

export const VerifyAnonymousAlert: React.FC = () => {
  const { verificationToken } = useParams<{ verificationToken: string }>();
  const navigate = useNavigate();

  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationResult, setVerificationResult] =
    useState<VerificationResult | null>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    if (verificationToken) {
      verifyAlert();
    }
  }, [verificationToken]);

  const verifyAlert = async () => {
    try {
      const res = await apiClient.verifyAnonymousAlert(verificationToken!);
      if (res.error) {
        if (res.statusCode === 400) {
          setError(
            'Invalid verification token. The link may be expired or incorrect.'
          );
        } else {
          throw new Error(res.error || 'Failed to verify alert');
        }
        return;
      }
      setVerificationResult(res.data.data || res.data);
      setSuccess('Price alert verified successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to verify alert');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleManageAlert = () => {
    if (verificationResult?.managementToken) {
      navigate(`/manage/${verificationResult.managementToken}`);
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  if (isVerifying) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Verifying your price alert...</p>
        </div>
      </div>
    );
  }

  if (error && !verificationResult) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="h-5 w-5" />
              Verification Failed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <p className="text-gray-600">
                We couldn't verify your price alert. This could happen if:
              </p>
              <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
                <li>
                  The verification link has expired (links expire after 24
                  hours)
                </li>
                <li>The link was already used</li>
                <li>The alert was deleted</li>
                <li>There was a technical issue</li>
              </ul>

              <div className="pt-4 space-y-3">
                <Button onClick={handleGoHome} className="w-full">
                  Return to Homepage
                </Button>
                <p className="text-sm text-gray-500 text-center">
                  Need help? You can create a new price alert from the homepage.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!verificationResult) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Alert>
          <AlertDescription>No verification result found</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-600">
            Alert Verified!
          </CardTitle>
          <CardDescription>
            Your price alert is now active and will notify you when the price
            reaches your target.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className="text-green-800">
                {success}
              </AlertDescription>
            </Alert>
          )}

          {/* Alert Details */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <h3 className="font-medium text-gray-900">Alert Details</h3>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Email:</span>
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">
                    {verificationResult.email}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-gray-500">Target Price:</span>
                <div className="flex items-center gap-2 mt-1">
                  <Bell className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">
                    {formatPrice(
                      verificationResult.targetPrice,
                      verificationResult.currency
                    )}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-gray-500">Alert Type:</span>
                <Badge variant="outline" className="mt-1 capitalize">
                  {verificationResult.alertType}
                </Badge>
              </div>

              {verificationResult.threshold && (
                <div>
                  <span className="text-gray-500">Threshold:</span>
                  <span className="font-medium block mt-1">
                    {verificationResult.threshold}%
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Status Information */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">
              What happens next?
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Your alert is now active and monitoring prices</li>
              <li>
                • You'll receive an email when the price reaches your target
              </li>
              <li>
                • Use the management link below to update or delete your alert
              </li>
              <li>
                • The management link never expires and can be used anytime
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button onClick={handleManageAlert} className="w-full">
              <ExternalLink className="mr-2 h-4 w-4" />
              Manage Your Alert
            </Button>

            <Button onClick={handleGoHome} variant="outline" className="w-full">
              Return to Homepage
            </Button>
          </div>

          {/* Management Link Info */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2">
              Important Information
            </h4>
            <div className="text-sm text-gray-700 space-y-2">
              <p>
                <strong>Management Link:</strong> Save this link to manage your
                alert later:
              </p>
              <div className="bg-white p-3 rounded border font-mono text-xs break-all">
                {window.location.origin}/manage/
                {verificationResult.managementToken}
              </div>
              <p className="text-gray-600">
                You can also use the "Manage Your Alert" button above, which
                will take you to the same place.
              </p>
            </div>
          </div>

          {/* Help Information */}
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h4 className="font-medium text-yellow-900 mb-2">Need Help?</h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>
                • Lost your management link? Check your email for the original
                message
              </li>
              <li>
                • Want to create more alerts? Visit our homepage to search for
                products
              </li>
              <li>
                • Questions about your alert? Reply to any email from PricePulse
              </li>
              <li>
                • Need to update your alert? Use the management link above
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
