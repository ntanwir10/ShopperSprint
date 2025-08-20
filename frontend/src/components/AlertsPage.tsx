import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Bell,
  Plus,
  Trash2,
  Edit,
  CheckCircle,
  Clock,
  ChevronUp,
} from 'lucide-react';
import { Button } from './ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Badge } from './ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface PriceAlert {
  id: string;
  productId: string;
  productName: string;
  targetPrice: number;
  currentPrice: number;
  currency: string;
  sourceName: string;
  isActive: boolean;
  createdAt: string;
  triggeredAt?: string;
}

const AlertsPage: React.FC = () => {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState<PriceAlert | null>(null);

  // Mock data for demonstration - in real app, this would come from API
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setAlerts([
        {
          id: '1',
          productId: 'prod1',
          productName: 'iPhone 15 Pro',
          targetPrice: 899,
          currentPrice: 999,
          currency: 'USD',
          sourceName: 'Amazon',
          isActive: true,
          createdAt: '2024-01-15T10:00:00Z',
        },
        {
          id: '2',
          productId: 'prod2',
          productName: 'MacBook Air M2',
          targetPrice: 999,
          currentPrice: 1099,
          currency: 'USD',
          sourceName: 'Best Buy',
          isActive: true,
          createdAt: '2024-01-14T15:30:00Z',
        },
        {
          id: '3',
          productId: 'prod3',
          productName: 'Sony WH-1000XM5',
          targetPrice: 299,
          currentPrice: 349,
          currency: 'USD',
          sourceName: 'Walmart',
          isActive: false,
          createdAt: '2024-01-13T09:15:00Z',
          triggeredAt: '2024-01-15T08:00:00Z',
        },
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleCreateAlert = (alertData: Partial<PriceAlert>) => {
    const newAlert: PriceAlert = {
      id: Date.now().toString(),
      productId: alertData.productId || 'new',
      productName: alertData.productName || 'New Product',
      targetPrice: alertData.targetPrice || 0,
      currentPrice: alertData.currentPrice || 0,
      currency: alertData.currency || 'USD',
      sourceName: alertData.sourceName || 'Unknown Source',
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    setAlerts([...alerts, newAlert]);
    setIsCreateDialogOpen(false);
  };

  const handleToggleAlert = (alertId: string) => {
    setAlerts(
      alerts.map((alert) =>
        alert.id === alertId ? { ...alert, isActive: !alert.isActive } : alert
      )
    );
  };

  const handleDeleteAlert = (alertId: string) => {
    setAlerts(alerts.filter((alert) => alert.id !== alertId));
  };

  const handleEditAlert = (alert: PriceAlert) => {
    setEditingAlert(alert);
  };

  const handleUpdateAlert = (updatedData: Partial<PriceAlert>) => {
    if (editingAlert) {
      setAlerts(
        alerts.map((alert) =>
          alert.id === editingAlert.id ? { ...alert, ...updatedData } : alert
        )
      );
      setEditingAlert(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading alerts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Price Alerts
                </h1>
                <p className="text-muted-foreground">
                  Stay updated on price changes for your favorite products
                </p>
              </div>
            </div>
            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <Button className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Create Alert</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Price Alert</DialogTitle>
                  <DialogDescription>
                    Set up a new price alert to monitor product prices
                  </DialogDescription>
                </DialogHeader>
                <CreateAlertForm onSubmit={handleCreateAlert} />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {alerts.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No alerts yet
            </h3>
            <p className="text-muted-foreground mb-4">
              Create your first price alert to start monitoring product prices
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              Create Your First Alert
            </Button>
          </div>
        ) : (
          <div className="grid gap-6">
            {alerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onToggle={handleToggleAlert}
                onDelete={handleDeleteAlert}
                onEdit={handleEditAlert}
              />
            ))}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      {editingAlert && (
        <Dialog
          open={!!editingAlert}
          onOpenChange={() => setEditingAlert(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Price Alert</DialogTitle>
              <DialogDescription>
                Update your price alert settings
              </DialogDescription>
            </DialogHeader>
            <EditAlertForm
              alert={editingAlert}
              onSubmit={handleUpdateAlert}
              onCancel={() => setEditingAlert(null)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Scroll to top button */}
      <Button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 hover:shadow-xl transition-all duration-300 hover:scale-110"
        aria-label="Scroll to top"
      >
        <ChevronUp className="h-6 w-6" />
      </Button>
    </div>
  );
};

interface CreateAlertFormProps {
  onSubmit: (data: Partial<PriceAlert>) => void;
}

const CreateAlertForm: React.FC<CreateAlertFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    productName: '',
    targetPrice: '',
    currentPrice: '',
    currency: 'USD',
    sourceName: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      productName: formData.productName,
      targetPrice: parseFloat(formData.targetPrice),
      currentPrice: parseFloat(formData.currentPrice),
      currency: formData.currency,
      sourceName: formData.sourceName,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="productName">Product Name</Label>
        <Input
          id="productName"
          value={formData.productName}
          onChange={(e) =>
            setFormData({ ...formData, productName: e.target.value })
          }
          placeholder="e.g., iPhone 15 Pro"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="targetPrice">Target Price</Label>
          <Input
            id="targetPrice"
            type="number"
            step="0.01"
            value={formData.targetPrice}
            onChange={(e) =>
              setFormData({ ...formData, targetPrice: e.target.value })
            }
            placeholder="0.00"
            required
          />
        </div>
        <div>
          <Label htmlFor="currentPrice">Current Price</Label>
          <Input
            id="currentPrice"
            type="number"
            step="0.01"
            value={formData.currentPrice}
            onChange={(e) =>
              setFormData({ ...formData, currentPrice: e.target.value })
            }
            placeholder="0.00"
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="currency">Currency</Label>
          <Select
            value={formData.currency}
            onValueChange={(value) =>
              setFormData({ ...formData, currency: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="EUR">EUR</SelectItem>
              <SelectItem value="GBP">GBP</SelectItem>
              <SelectItem value="CAD">CAD</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="sourceName">Source</Label>
          <Input
            id="sourceName"
            value={formData.sourceName}
            onChange={(e) =>
              setFormData({ ...formData, sourceName: e.target.value })
            }
            placeholder="e.g., Amazon"
            required
          />
        </div>
      </div>
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="submit">Create Alert</Button>
      </div>
    </form>
  );
};

interface EditAlertFormProps {
  alert: PriceAlert;
  onSubmit: (data: Partial<PriceAlert>) => void;
  onCancel: () => void;
}

const EditAlertForm: React.FC<EditAlertFormProps> = ({
  alert,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    productName: alert.productName,
    targetPrice: alert.targetPrice.toString(),
    currentPrice: alert.currentPrice.toString(),
    currency: alert.currency,
    sourceName: alert.sourceName,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      productName: formData.productName,
      targetPrice: parseFloat(formData.targetPrice),
      currentPrice: parseFloat(formData.currentPrice),
      currency: formData.currency,
      sourceName: formData.sourceName,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="editProductName">Product Name</Label>
        <Input
          id="editProductName"
          value={formData.productName}
          onChange={(e) =>
            setFormData({ ...formData, productName: e.target.value })
          }
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="editTargetPrice">Target Price</Label>
          <Input
            id="editTargetPrice"
            type="number"
            step="0.01"
            value={formData.targetPrice}
            onChange={(e) =>
              setFormData({ ...formData, targetPrice: e.target.value })
            }
            required
          />
        </div>
        <div>
          <Label htmlFor="editCurrentPrice">Current Price</Label>
          <Input
            id="editCurrentPrice"
            type="number"
            step="0.01"
            value={formData.currentPrice}
            onChange={(e) =>
              setFormData({ ...formData, currentPrice: e.target.value })
            }
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="editCurrency">Currency</Label>
          <Select
            value={formData.currency}
            onValueChange={(value) =>
              setFormData({ ...formData, currency: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="EUR">EUR</SelectItem>
              <SelectItem value="GBP">GBP</SelectItem>
              <SelectItem value="CAD">CAD</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="editSourceName">Source</Label>
          <Input
            id="editSourceName"
            value={formData.sourceName}
            onChange={(e) =>
              setFormData({ ...formData, sourceName: e.target.value })
            }
            required
          />
        </div>
      </div>
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Update Alert</Button>
      </div>
    </form>
  );
};

interface AlertCardProps {
  alert: PriceAlert;
  onToggle: (alertId: string) => void;
  onDelete: (alertId: string) => void;
  onEdit: (alert: PriceAlert) => void;
}

const AlertCard: React.FC<AlertCardProps> = ({
  alert,
  onToggle,
  onDelete,
  onEdit,
}) => {
  const priceDifference = alert.currentPrice - alert.targetPrice;
  const isPriceBelowTarget = priceDifference <= 0;

  const getStatusIcon = (alert: PriceAlert) => {
    if (alert.triggeredAt) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    if (alert.isActive) {
      return <Bell className="h-5 w-5 text-blue-500" />;
    }
    return <Clock className="h-5 w-5 text-gray-400" />;
  };

  const getStatusText = (alert: PriceAlert) => {
    if (alert.triggeredAt) {
      return 'Triggered';
    }
    if (alert.isActive) {
      return 'Active';
    }
    return 'Inactive';
  };

  const getStatusColor = (alert: PriceAlert) => {
    if (alert.triggeredAt) {
      return 'bg-green-100 text-green-800 border-green-200';
    }
    if (alert.isActive) {
      return 'bg-blue-100 text-blue-800 border-green-200';
    }
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            {getStatusIcon(alert)}
            <div className="flex-1">
              <CardTitle className="text-lg">{alert.productName}</CardTitle>
              <CardDescription className="flex items-center space-x-2 mt-1">
                <span>{alert.sourceName}</span>
                <span>•</span>
                <span>{new Date(alert.createdAt).toLocaleDateString()}</span>
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor(alert)}>
              {getStatusText(alert)}
            </Badge>
            <Button variant="ghost" size="sm" onClick={() => onEdit(alert)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(alert.id)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Target Price</p>
            <p className="text-lg font-semibold text-foreground">
              {alert.currency} {alert.targetPrice.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Current Price</p>
            <p className="text-lg font-semibold text-foreground">
              {alert.currency} {alert.currentPrice.toFixed(2)}
            </p>
          </div>
        </div>

        {isPriceBelowTarget && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                Price target reached! Current price is below your target.
              </span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onToggle(alert.id)}
            >
              {alert.isActive ? 'Deactivate' : 'Activate'}
            </Button>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Price Difference</p>
            <p
              className={`text-sm font-medium ${
                isPriceBelowTarget ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {isPriceBelowTarget ? '-' : '+'}
              {alert.currency} {Math.abs(priceDifference).toFixed(2)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AlertsPage;
