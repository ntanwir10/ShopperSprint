import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiClient, PriceAlert, CreatePriceAlertRequest } from '../lib/api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Loader2, Plus, Bell, Trash2, Edit, AlertTriangle, CheckCircle } from 'lucide-react';

const PriceAlerts: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState<PriceAlert | null>(null);
  const [formData, setFormData] = useState<CreatePriceAlertRequest>({
    productId: '',
    targetPrice: 0,
    currency: 'USD',
    alertType: 'below',
    threshold: undefined,
  });

  useEffect(() => {
    if (isAuthenticated) {
      loadAlerts();
    }
  }, [isAuthenticated]);

  const loadAlerts = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.getPriceAlerts();
      
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        setAlerts(response.data);
      }
    } catch (err) {
      setError('Failed to load price alerts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAlert = async () => {
    if (!formData.productId || formData.targetPrice <= 0) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.createPriceAlert(formData);
      
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        setAlerts(prev => [...prev, response.data]);
        setIsCreateDialogOpen(false);
        setFormData({
          productId: '',
          targetPrice: 0,
          currency: 'USD',
          alertType: 'below',
          threshold: undefined,
        });
      }
    } catch (err) {
      setError('Failed to create price alert');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAlert = async () => {
    if (!editingAlert) return;

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.updatePriceAlert(editingAlert.id, {
        targetPrice: formData.targetPrice,
        alertType: formData.alertType,
        threshold: formData.threshold,
      });
      
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        setAlerts(prev => prev.map(alert => 
          alert.id === editingAlert.id ? response.data : alert
        ));
        setIsEditDialogOpen(false);
        setEditingAlert(null);
      }
    } catch (err) {
      setError('Failed to update price alert');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAlert = async (alertId: string) => {
    if (!confirm('Are you sure you want to delete this alert?')) return;

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.deletePriceAlert(alertId);
      
      if (response.error) {
        setError(response.error);
      } else {
        setAlerts(prev => prev.filter(alert => alert.id !== alertId));
      }
    } catch (err) {
      setError('Failed to delete price alert');
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (alert: PriceAlert) => {
    setEditingAlert(alert);
    setFormData({
      productId: alert.productId,
      targetPrice: alert.targetPrice / 100, // Convert from cents
      currency: alert.currency,
      alertType: alert.alertType,
      threshold: alert.threshold,
    });
    setIsEditDialogOpen(true);
  };

  const getAlertStatusIcon = (alert: PriceAlert) => {
    if (!alert.isActive) {
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
    return <Bell className="h-4 w-4 text-green-500" />;
  };

  const getAlertStatusText = (alert: PriceAlert) => {
    if (!alert.isActive) {
      return 'Paused';
    }
    return 'Active';
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Bell className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Sign in to manage alerts</h2>
          <p className="text-muted-foreground mb-4">
            Create and manage price alerts to never miss a great deal
          </p>
          <Button asChild>
            <a href="/login">Sign In</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Price Alerts</h1>
            <p className="text-muted-foreground mt-2">
              Manage your price alerts and never miss a great deal
            </p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Alert
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Price Alert</DialogTitle>
                <DialogDescription>
                  Set up a new price alert for a product
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="productId">Product ID</Label>
                  <Input
                    id="productId"
                    placeholder="Enter product ID"
                    value={formData.productId}
                    onChange={(e) => setFormData(prev => ({ ...prev, productId: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="targetPrice">Target Price</Label>
                  <Input
                    id="targetPrice"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.targetPrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, targetPrice: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="alertType">Alert Type</Label>
                  <select
                    id="alertType"
                    className="w-full border border-border rounded-lg px-3 py-2 bg-background"
                    value={formData.alertType}
                    onChange={(e) => setFormData(prev => ({ ...prev, alertType: e.target.value }))}
                  >
                    <option value="below">Price drops below</option>
                    <option value="above">Price goes above</option>
                    <option value="percentage">Percentage change</option>
                  </select>
                </div>
                
                {formData.alertType === 'percentage' && (
                  <div className="space-y-2">
                    <Label htmlFor="threshold">Threshold (%)</Label>
                    <Input
                      id="threshold"
                      type="number"
                      step="0.1"
                      placeholder="5.0"
                      value={formData.threshold || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, threshold: parseFloat(e.target.value) || undefined }))}
                    />
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button
                    onClick={handleCreateAlert}
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Alert'
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading && alerts.length === 0 ? (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading price alerts...</p>
          </div>
        ) : alerts.length === 0 ? (
          <Card className="text-center py-12">
            <Bell className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No price alerts yet
            </h3>
            <p className="text-muted-foreground mb-4">
              Create your first price alert to start tracking product prices
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Alert
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4">
            {alerts.map((alert) => (
              <Card key={alert.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {getAlertStatusIcon(alert)}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">Product {alert.productId}</h3>
                          <Badge variant={alert.isActive ? 'default' : 'secondary'}>
                            {getAlertStatusText(alert)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Alert when price {alert.alertType} ${(alert.targetPrice / 100).toFixed(2)}
                          {alert.threshold && ` (${alert.threshold}% threshold)`}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Created: {new Date(alert.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(alert)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteAlert(alert.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Price Alert</DialogTitle>
              <DialogDescription>
                Update your price alert settings
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="edit-targetPrice">Target Price</Label>
                <Input
                  id="edit-targetPrice"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.targetPrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, targetPrice: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-alertType">Alert Type</Label>
                <select
                  id="edit-alertType"
                  className="w-full border border-border rounded-lg px-3 py-2 bg-background"
                  value={formData.alertType}
                  onChange={(e) => setFormData(prev => ({ ...prev, alertType: e.target.value }))}
                >
                  <option value="below">Price drops below</option>
                  <option value="above">Price goes above</option>
                  <option value="percentage">Percentage change</option>
                </select>
              </div>
              
              {formData.alertType === 'percentage' && (
                <div className="space-y-2">
                  <Label htmlFor="edit-threshold">Threshold (%)</Label>
                  <Input
                    id="edit-threshold"
                    type="number"
                    step="0.1"
                    placeholder="5.0"
                    value={formData.threshold || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, threshold: parseFloat(e.target.value) || undefined }))}
                  />
                </div>
              )}
              
              <div className="flex gap-2">
                <Button
                  onClick={handleUpdateAlert}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Alert'
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default PriceAlerts;
