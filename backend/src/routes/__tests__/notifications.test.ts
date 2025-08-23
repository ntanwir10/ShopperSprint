import request from 'supertest';
import express from 'express';
import { jest } from '@jest/globals';
import { NotificationService } from '../../services/notificationService';

// Mock the notification service
const mockNotificationService = {
  createPriceAlert: jest.fn(),
  getUserAlerts: jest.fn(),
  updatePriceAlert: jest.fn(),
  deletePriceAlert: jest.fn(),
  getUserPreferences: jest.fn(),
  getNotificationStats: jest.fn(),
} as jest.Mocked<Partial<NotificationService>>;

// Mock the service module
jest.mock('../../services/notificationService', () => ({
  NotificationService: jest.fn().mockImplementation(() => mockNotificationService)
}));

// Create test app
const app = express();
app.use(express.json());

// Mock routes (simplified for testing)
app.post('/api/notifications/alerts', async (req, res) => {
  try {
    const { productId, targetPrice, currency, alertType } = req.body;
    const userId = 'test_user'; // Mock user ID
    
    const alert = await mockNotificationService.createPriceAlert!(
      userId, productId, targetPrice, currency, alertType
    );
    
    res.status(201).json(alert);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/notifications/alerts', async (req, res) => {
  try {
    const userId = 'test_user'; // Mock user ID
    const alerts = await mockNotificationService.getUserAlerts!(userId);
    res.json(alerts);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/notifications/alerts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = 'test_user'; // Mock user ID
    const updates = req.body;
    
    const alert = await mockNotificationService.updatePriceAlert!(id, userId, updates);
    res.json(alert);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

app.delete('/api/notifications/alerts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = 'test_user'; // Mock user ID
    
    await mockNotificationService.deletePriceAlert!(id, userId);
    res.status(204).send();
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

app.get('/api/notifications/preferences', async (req, res) => {
  try {
    const userId = 'test_user'; // Mock user ID
    const preferences = await mockNotificationService.getUserPreferences!(userId);
    res.json(preferences);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/notifications/stats', async (req, res) => {
  try {
    const stats = await mockNotificationService.getNotificationStats!();
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

describe('Notification Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/notifications/alerts', () => {
    it('should create price alert successfully', async () => {
      // Arrange
      const alertData = {
        productId: 'product_123',
        targetPrice: 25000,
        currency: 'USD',
        alertType: 'below'
      };

      const mockAlert = {
        id: 'alert_123',
        userId: 'test_user',
        productId: 'product_123',
        targetPrice: 25000,
        currency: 'USD',
        alertType: 'below',
        threshold: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockNotificationService.createPriceAlert!.mockResolvedValue(mockAlert);

      // Act
      const response = await request(app)
        .post('/api/notifications/alerts')
        .send(alertData)
        .expect(201);

      // Assert
      expect(response.body).toEqual(mockAlert);
      expect(mockNotificationService.createPriceAlert).toHaveBeenCalledWith(
        'test_user', 'product_123', 25000, 'USD', 'below'
      );
    });

    it('should handle creation errors', async () => {
      // Arrange
      const alertData = {
        productId: 'invalid_product',
        targetPrice: 25000,
        currency: 'USD',
        alertType: 'below'
      };

      mockNotificationService.createPriceAlert!.mockRejectedValue(new Error('Product not found'));

      // Act & Assert
      await request(app)
        .post('/api/notifications/alerts')
        .send(alertData)
        .expect(400);
    });
  });

  describe('GET /api/notifications/alerts', () => {
    it('should get user alerts successfully', async () => {
      // Arrange
      const mockAlerts = [
        {
          id: 'alert_1',
          userId: 'test_user',
          productId: 'product_1',
          targetPrice: 25000,
          currency: 'USD',
          alertType: 'below',
          threshold: null,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockNotificationService.getUserAlerts!.mockResolvedValue(mockAlerts);

      // Act
      const response = await request(app)
        .get('/api/notifications/alerts')
        .expect(200);

      // Assert
      expect(response.body).toEqual(mockAlerts);
      expect(mockNotificationService.getUserAlerts).toHaveBeenCalledWith('test_user');
    });

    it('should handle service errors gracefully', async () => {
      // Arrange
      mockNotificationService.getUserAlerts!.mockRejectedValue(new Error('Service error'));

      // Act & Assert
      await request(app)
        .get('/api/notifications/alerts')
        .expect(500);
    });
  });

  describe('PUT /api/notifications/alerts/:id', () => {
    it('should update price alert successfully', async () => {
      // Arrange
      const alertId = 'alert_123';
      const updates = {
        targetPrice: 20000,
        isActive: false
      };

      const mockUpdatedAlert = {
        id: alertId,
        userId: 'test_user',
        productId: 'product_123',
        targetPrice: 20000,
        currency: 'USD',
        alertType: 'below',
        threshold: null,
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockNotificationService.updatePriceAlert!.mockResolvedValue(mockUpdatedAlert);

      // Act
      const response = await request(app)
        .put(`/api/notifications/alerts/${alertId}`)
        .send(updates)
        .expect(200);

      // Assert
      expect(response.body).toEqual(mockUpdatedAlert);
      expect(mockNotificationService.updatePriceAlert).toHaveBeenCalledWith(alertId, 'test_user', updates);
    });

    it('should handle update errors', async () => {
      // Arrange
      const alertId = 'nonexistent_alert';
      const updates = { targetPrice: 20000 };

      mockNotificationService.updatePriceAlert!.mockRejectedValue(new Error('Alert not found'));

      // Act & Assert
      await request(app)
        .put(`/api/notifications/alerts/${alertId}`)
        .send(updates)
        .expect(404);
    });
  });

  describe('DELETE /api/notifications/alerts/:id', () => {
    it('should delete price alert successfully', async () => {
      // Arrange
      const alertId = 'alert_123';

      mockNotificationService.deletePriceAlert!.mockResolvedValue(undefined);

      // Act
      await request(app)
        .delete(`/api/notifications/alerts/${alertId}`)
        .expect(204);

      // Assert
      expect(mockNotificationService.deletePriceAlert).toHaveBeenCalledWith(alertId, 'test_user');
    });

    it('should handle deletion errors', async () => {
      // Arrange
      const alertId = 'nonexistent_alert';

      mockNotificationService.deletePriceAlert!.mockRejectedValue(new Error('Alert not found'));

      // Act & Assert
      await request(app)
        .delete(`/api/notifications/alerts/${alertId}`)
        .expect(404);
    });
  });

  describe('GET /api/notifications/preferences', () => {
    it('should get user preferences successfully', async () => {
      // Arrange
      const mockPreferences = {
        id: 'pref_123',
        userId: 'test_user',
        notificationEmail: true,
        notificationPush: false,
        quietHoursStart: '22:00',
        quietHoursEnd: '08:00',
        timezone: 'America/Toronto',
        language: 'en',
        currency: 'CAD'
      };

      mockNotificationService.getUserPreferences!.mockResolvedValue(mockPreferences);

      // Act
      const response = await request(app)
        .get('/api/notifications/preferences')
        .expect(200);

      // Assert
      expect(response.body).toEqual(mockPreferences);
      expect(mockNotificationService.getUserPreferences).toHaveBeenCalledWith('test_user');
    });

    it('should handle missing preferences', async () => {
      // Arrange
      mockNotificationService.getUserPreferences!.mockResolvedValue(null);

      // Act
      const response = await request(app)
        .get('/api/notifications/preferences')
        .expect(200);

      // Assert
      expect(response.body).toBeNull();
    });
  });

  describe('GET /api/notifications/stats', () => {
    it('should get notification statistics successfully', async () => {
      // Arrange
      const mockStats = {
        totalAlerts: 10,
        activeAlerts: 5,
        totalUsers: 3
      };

      mockNotificationService.getNotificationStats!.mockResolvedValue(mockStats);

      // Act
      const response = await request(app)
        .get('/api/notifications/stats')
        .expect(200);

      // Assert
      expect(response.body).toEqual(mockStats);
      expect(mockNotificationService.getNotificationStats).toHaveBeenCalled();
    });

    it('should handle stats errors', async () => {
      // Arrange
      mockNotificationService.getNotificationStats!.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await request(app)
        .get('/api/notifications/stats')
        .expect(500);
    });
  });
});
