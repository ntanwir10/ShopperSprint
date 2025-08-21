import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import { apiClient } from '../lib/api';
import { Badge } from './ui/badge';
import {
  Loader2,
  Bell,
  Edit3,
  Trash2,
  CheckCircle,
  XCircle,
} from 'lucide-react';

interface AnonymousAlert {
  id: string;
  email: string;
  productId: string;
  targetPrice: number;
  currency: string;
  alertType: 'below' | 'above' | 'percentage';
  threshold?: number;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Product {
  id: string;
  name: string;
  currentPrice: number;
}

export const ManageAnonymousAlert: React.FC = () => {
  const { managementToken } = useParams<{ managementToken?: string }>();
  const navigate = useNavigate();

  const [alert, setAlert] = useState<AnonymousAlert | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const [editForm, setEditForm] = useState({
    targetPrice: 0,
    currency: 'USD',
    alertType: 'below' as 'below' | 'above' | 'percentage',
    threshold: 5,
    isActive: true,
  });

  useEffect(() => {
    if (managementToken) {
      fetchAlertDetails();
    }
  }, [managementToken]);

  const fetchAlertDetails = async () => {
    try {
      const response = await apiClient.getAnonymousAlert(
        managementToken as string
      );

      if (response.error) {
        if (response.statusCode === 404) {
          setError(
            'Alert not found. The link may be invalid or the alert may have been deleted.'
          );
        } else {
          throw new Error(response.error || 'Failed to fetch alert details');
        }
        return;
      }

      const data = (response.data as any)?.data || response.data;
      setAlert(data);

      // Set edit form with current values
      setEditForm({
        targetPrice: data.targetPrice / 100,
        currency: data.currency,
        alertType:
          (data.alertType as 'below' | 'above' | 'percentage') || 'below',
        threshold: data.threshold || 5,
        isActive: data.isActive,
      });

      // Fetch product details if we have a product ID
      if (data.productId) {
        await fetchProductDetails(data.productId);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load alert details');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProductDetails = async (productId: string) => {
    try {
      const r = await fetch(`/api/search/products/${productId}`);
      if (r.ok) {
        const result = await r.json();
        setProduct(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch product details:', error);
    }
  };

  const handleUpdate = async () => {
    if (!managementToken) return;

    setIsUpdating(true);
    setError('');
    setSuccess('');

    try {
      const response = await apiClient.updateAnonymousAlert(
        managementToken as string,
        {
          ...editForm,
          targetPrice: editForm.targetPrice,
        }
      );
      if (response.error) throw new Error(response.error);
      setAlert((response.data as any)?.data || response.data);
      setSuccess('Price alert updated successfully!');
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update alert');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (
      !managementToken ||
      !confirm(
        'Are you sure you want to delete this price alert? This action cannot be undone.'
      )
    ) {
      return;
    }

    setIsDeleting(true);
    setError('');

    try {
      const response = await apiClient.deleteAnonymousAlert(managementToken);
      if (response.error) throw new Error(response.error);

      setSuccess('Price alert deleted successfully!');
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to delete alert');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleResendVerification = async () => {
    if (!managementToken) return;

    try {
      const response = await apiClient.resendVerification(
        managementToken as string
      );
      if (!response.error) {
        setSuccess(
          'Verification email sent successfully! Please check your inbox.'
        );
      } else {
        throw new Error(
          response.error || 'Failed to resend verification email'
        );
      }
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification email');
    }
  };

  const handleSendManagementLink = async () => {
    if (!managementToken) return;

    try {
      const response = await apiClient.sendManagementLink(
        managementToken as string
      );
      if (!response.error) {
        setSuccess(
          'Management link email sent successfully! Please check your inbox.'
        );
      } else {
        throw new Error(
          response.error || 'Failed to send management link email'
        );
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send management link email');
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading alert details...</p>
        </div>
      </div>
    );
  }

  if (error && !alert) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Alert className="border-red-200 bg-red-50">
          <XCircle className="h-4 w-4" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
        <div className="mt-4 text-center">
          <Button onClick={() => navigate('/')} variant="outline">
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  if (!alert) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Alert>
          <AlertDescription>Alert not found</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Manage Price Alert</h1>
        <p className="text-gray-600">
          Manage your price alert for {product?.name || 'this product'}
        </p>
      </div>

      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription className="text-green-800">
            {success}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alert Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-600" />
              Alert Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Status</span>
              <div className="flex items-center gap-2">
                <Badge variant={alert.isVerified ? 'default' : 'secondary'}>
                  {alert.isVerified ? 'Verified' : 'Pending Verification'}
                </Badge>
                <Badge variant={alert.isActive ? 'default' : 'destructive'}>
                  {alert.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Email</span>
              <span className="text-sm">{alert.email}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">
                Target Price
              </span>
              <span className="text-sm font-medium">
                {formatPrice(alert.targetPrice, alert.currency)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">
                Alert Type
              </span>
              <span className="text-sm capitalize">{alert.alertType}</span>
            </div>

            {alert.threshold && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">
                  Threshold
                </span>
                <span className="text-sm">{alert.threshold}%</span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Created</span>
              <span className="text-sm">{formatDate(alert.createdAt)}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">
                Last Updated
              </span>
              <span className="text-sm">{formatDate(alert.updatedAt)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Product Information */}
        {product && (
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">
                  Product Name
                </span>
                <span className="text-sm font-medium">{product.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">
                  Current Price
                </span>
                <span className="text-sm font-medium">
                  {formatPrice(product.currentPrice, alert.currency)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">
                  Price Difference
                </span>
                <span
                  className={`text-sm font-medium ${
                    product.currentPrice <= alert.targetPrice
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {formatPrice(
                    Math.abs(product.currentPrice - alert.targetPrice),
                    alert.currency
                  )}
                  {product.currentPrice <= alert.targetPrice
                    ? ' below'
                    : ' above'}{' '}
                  target
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-8 space-y-4">
        {!alert.isVerified && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-medium text-yellow-900 mb-2">
              Verification Required
            </h4>
            <p className="text-sm text-yellow-800 mb-3">
              Your alert is not yet active. Please check your email and click
              the verification link, or request a new one.
            </p>
            <div className="flex gap-2">
              <Button
                onClick={handleResendVerification}
                variant="outline"
                size="sm"
              >
                Resend Verification Email
              </Button>
              <Button
                onClick={handleSendManagementLink}
                variant="outline"
                size="sm"
              >
                Send Management Link
              </Button>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} variant="outline">
              <Edit3 className="mr-2 h-4 w-4" />
              Edit Alert
            </Button>
          ) : (
            <>
              <Button onClick={handleUpdate} disabled={isUpdating}>
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button onClick={() => setIsEditing(false)} variant="outline">
                Cancel
              </Button>
            </>
          )}

          <Button
            onClick={handleDelete}
            variant="destructive"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Alert
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Edit Form */}
      {isEditing && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Edit Alert Settings</CardTitle>
            <CardDescription>
              Update your price alert configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editTargetPrice">Target Price</Label>
                <Input
                  id="editTargetPrice"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={editForm.targetPrice}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      targetPrice: parseFloat(e.target.value) || 0,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="editCurrency">Currency</Label>
                <Select
                  value={editForm.currency}
                  onValueChange={(value) =>
                    setEditForm((prev) => ({ ...prev, currency: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                    <SelectItem value="CAD">CAD (C$)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="editAlertType">Alert Type</Label>
                <Select
                  value={editForm.alertType}
                  onValueChange={(value: 'below' | 'above' | 'percentage') =>
                    setEditForm((prev) => ({ ...prev, alertType: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="below">Below target price</SelectItem>
                    <SelectItem value="above">Above target price</SelectItem>
                    <SelectItem value="percentage">
                      Percentage change
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {editForm.alertType === 'percentage' && (
                <div className="space-y-2">
                  <Label htmlFor="editThreshold">Threshold (%)</Label>
                  <Input
                    id="editThreshold"
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="100"
                    value={editForm.threshold}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        threshold: parseFloat(e.target.value) || 5,
                      }))
                    }
                  />
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="editIsActive"
                checked={editForm.isActive}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    isActive: e.target.checked,
                  }))
                }
                className="rounded"
              />
              <Label htmlFor="editIsActive">Keep alert active</Label>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Information */}
      <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Need Help?</h4>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>
            • Lost your management link? Use the "Send Management Link" button
            above
          </li>
          <li>
            • Haven't received verification email? Check spam folder or request
            a new one
          </li>
          <li>
            • Questions about your alert? Reply to any email from ShopperSprint
          </li>
          <li>
            • Want to create more alerts? Visit our homepage to search for
            products
          </li>
        </ul>
      </div>
    </div>
  );
};
