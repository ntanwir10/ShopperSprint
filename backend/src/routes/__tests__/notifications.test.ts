import request from 'supertest';
import express from 'express';
import notificationsRouter from '../notifications';
import { NotificationService } from '../../services/notificationService';

// Mock NotificationService
jest.mock('../../services/notificationService');

describe('Notifications Routes', () => {
  let app: express.Application;
  let mockNotificationService: jest.Mocked<NotificationService>;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Create mock NotificationService
    mockNotificationService = {
      createPriceAlert: jest.fn(),
      getAllAlerts: jest.fn(),
      updatePriceAlert: jest.fn(),
      deletePriceAlert: jest.fn(),
      getPreferences: jest.fn(),
      updatePreferences: jest.fn(),
      getActiveAlertsCount: jest.fn(),
      getTriggeredAlertsCount: jest.fn(),
    } as any;

    // Create Express app
    app = express();
    app.use(express.json());
    app.use('/api/notifications', notificationsRouter);

    // Mock the NotificationService in the router
    (notificationsRouter as any).notificationService = mockNotificationService;
  });

  describe('POST /api/notifications/alerts', () => {
    it('should create a new price alert successfully', async () => {
      // Arrange
      const alertData = {
        productId: 'test_product',
        productName: 'Test Smartphone',
        targetPrice: 25000,
        sourceId: 'test_source',
        sourceName: 'Test Store',
        currentPrice: 29999,
      };

      const mockAlert = {
        id: 'alert_123',
        ...alertData,
        isActive: true,
        createdAt: new Date(),
        triggeredAt: null,
      };

      mockNotificationService.createPriceAlert.mockResolvedValue(mockAlert);

      // Act
      const response = await request(app)
        .post('/api/notifications/alerts')
        .send(alertData)
        .expect(201);

      // Assert
      expect(response.body).toEqual(mockAlert);
      expect(mockNotificationService.createPriceAlert).toHaveBeenCalledWith(
        alertData.productId,
        alertData.productName,
        alertData.targetPrice,
        alertData.sourceId,
        alertData.sourceName,
        alertData.currentPrice
      );
    });

    it('should validate required fields', async () => {
      // Arrange
      const invalidAlertData = {
        productId: 'test_product',
        // Missing required fields
      };

      // Act & Assert
      await request(app)
        .post('/api/notifications/alerts')
        .send(invalidAlertData)
        .expect(400);
    });

    it('should handle service errors gracefully', async () => {
      // Arrange
      const alertData = {
        productId: 'test_product',
        productName: 'Test Smartphone',
        targetPrice: 25000,
        sourceId: 'test_source',
        sourceName: 'Test Store',
        currentPrice: 29999,
      };

      mockNotificationService.createPriceAlert.mockRejectedValue(new Error('Service error'));

      // Act & Assert
      await request(app)
        .post('/api/notifications/alerts')
        .send(alertData)
        .expect(500);
    });
  });

  describe('GET /api/notifications/alerts', () => {
    it('should return all alerts', async () => {
      // Arrange
      const mockAlerts = [
        {
          id: 'alert_1',
          productId: 'product_1',
          productName: 'Smartphone 1',
          targetPrice: 25000,
          sourceId: 'source_1',
          sourceName: 'Store 1',
          currentPrice: 29999,
          isActive: true,
          createdAt: new Date(),
          triggeredAt: null,
        },
        {
          id: 'alert_2',
          productId: 'product_2',
          productName: 'Laptop 1',
          targetPrice: 80000,
          sourceId: 'source_2',
          sourceName: 'Store 2',
          currentPrice: 89999,
          isActive: true,
          createdAt: new Date(),
          triggeredAt: null,
        },
      ];

      mockNotificationService.getAllAlerts.mockResolvedValue(mockAlerts);

      // Act
      const response = await request(app)
        .get('/api/notifications/alerts')
        .expect(200);

      // Assert
      expect(response.body).toEqual(mockAlerts);
      expect(mockNotificationService.getAllAlerts).toHaveBeenCalled();
    });

    it('should handle service errors gracefully', async () => {
      // Arrange
      mockNotificationService.getAllAlerts.mockRejectedValue(new Error('Service error'));

      // Act & Assert
      await request(app)
        .get('/api/notifications/alerts')
        .expect(500);
    });
  });

  describe('PUT /api/notifications/alerts/:alertId', () => {
    it('should update an existing alert successfully', async () => {
      // Arrange
      const alertId = 'alert_123';
      const updates = {
        targetPrice: 20000,
        isActive: false,
      };

      const mockUpdatedAlert = {
        id: alertId,
        productId: 'test_product',
        productName: 'Test Smartphone',
        targetPrice: 20000,
        sourceId: 'test_source',
        sourceName: 'Test Store',
        currentPrice: 29999,
        isActive: false,
        createdAt: new Date(),
        triggeredAt: null,
      };

      mockNotificationService.updatePriceAlert.mockResolvedValue(mockUpdatedAlert);

      // Act
      const response = await request(app)
        .put(`/api/notifications/alerts/${alertId}`)
        .send(updates)
        .expect(200);

      // Assert
      expect(response.body).toEqual(mockUpdatedAlert);
      expect(mockNotificationService.updatePriceAlert).toHaveBeenCalledWith(alertId, updates);
    });

    it('should return 404 for non-existent alert', async () => {
      // Arrange
      const alertId = 'non_existent_alert';
      const updates = { targetPrice: 20000 };

      mockNotificationService.updatePriceAlert.mockResolvedValue(null);

      // Act & Assert
      await request(app)
        .put(`/api/notifications/alerts/${alertId}`)
        .send(updates)
        .expect(404);
    });

    it('should validate update data', async () => {
      // Arrange
      const alertId = 'alert_123';
      const invalidUpdates = {
        invalidField: 'invalid_value',
      };

      // Act & Assert
      await request(app)
        .put(`/api/notifications/alerts/${alertId}`)
        .send(invalidUpdates)
        .expect(400);
    });
  });

  describe('DELETE /api/notifications/alerts/:alertId', () => {
    it('should delete an existing alert successfully', async () => {
      // Arrange
      const alertId = 'alert_123';
      mockNotificationService.deletePriceAlert.mockResolvedValue(true);

      // Act
      const response = await request(app)
        .delete(`/api/notifications/alerts/${alertId}`)
        .expect(200);

      // Assert
      expect(response.body).toEqual({ message: 'Alert deleted successfully' });
      expect(mockNotificationService.deletePriceAlert).toHaveBeenCalledWith(alertId);
    });

    it('should return 404 for non-existent alert', async () => {
      // Arrange
      const alertId = 'non_existent_alert';
      mockNotificationService.deletePriceAlert.mockResolvedValue(false);

      // Act & Assert
      await request(app)
        .delete(`/api/notifications/alerts/${alertId}`)
        .expect(404);
    });
  });

  describe('GET /api/notifications/preferences', () => {
    it('should return system preferences', async () => {
      // Arrange
      const mockPreferences = {
        id: 'default',
        emailNotifications: true,
        pushNotifications: true,
        quietHoursStart: '22:00',
        quietHoursEnd: '08:00',
        timezone: 'UTC',
      };

      mockNotificationService.getPreferences.mockResolvedValue(mockPreferences);

      // Act
      const response = await request(app)
        .get('/api/notifications/preferences')
        .expect(200);

      // Assert
      expect(response.body).toEqual(mockPreferences);
      expect(mockNotificationService.getPreferences).toHaveBeenCalled();
    });

    it('should return 404 when no preferences exist', async () => {
      // Arrange
      mockNotificationService.getPreferences.mockResolvedValue(null);

      // Act & Assert
      await request(app)
        .get('/api/notifications/preferences')
        .expect(404);
    });
  });

  describe('PUT /api/notifications/preferences', () => {
    it('should update system preferences successfully', async () => {
      // Arrange
      const updates = {
        quietHoursStart: '23:00',
        quietHoursEnd: '07:00',
        emailNotifications: false,
      };

      const mockUpdatedPreferences = {
        id: 'default',
        emailNotifications: false,
        pushNotifications: true,
        quietHoursStart: '23:00',
        quietHoursEnd: '07:00',
        timezone: 'UTC',
      };

      mockNotificationService.updatePreferences.mockResolvedValue(mockUpdatedPreferences);

      // Act
      const response = await request(app)
        .put('/api/notifications/preferences')
        .send(updates)
        .expect(200);

      // Assert
      expect(response.body).toEqual(mockUpdatedPreferences);
      expect(mockNotificationService.updatePreferences).toHaveBeenCalledWith(updates);
    });

    it('should validate preference updates', async () => {
      // Arrange
      const invalidUpdates = {
        quietHoursStart: '25:00', // Invalid hour
        quietHoursEnd: '08:00',
      };

      // Act & Assert
      await request(app)
        .put('/api/notifications/preferences')
        .send(invalidUpdates)
        .expect(400);
    });
  });

  describe('GET /api/notifications/stats', () => {
    it('should return notification statistics', async () => {
      // Arrange
      const mockStats = {
        activeAlerts: 5,
        triggeredAlerts: 2,
        totalAlerts: 7,
      };

      mockNotificationService.getActiveAlertsCount.mockResolvedValue(5);
      mockNotificationService.getTriggeredAlertsCount.mockResolvedValue(2);

      // Act
      const response = await request(app)
        .get('/api/notifications/stats')
        .expect(200);

      // Assert
      expect(response.body).toEqual(mockStats);
      expect(mockNotificationService.getActiveAlertsCount).toHaveBeenCalled();
      expect(mockNotificationService.getTriggeredAlertsCount).toHaveBeenCalled();
    });

    it('should handle service errors gracefully', async () => {
      // Arrange
      mockNotificationService.getActiveAlertsCount.mockRejectedValue(new Error('Service error'));

      // Act & Assert
      await request(app)
        .get('/api/notifications/stats')
        .expect(500);
    });
  });

  describe('Error handling', () => {
    it('should handle malformed JSON', async () => {
      // Act & Assert
      await request(app)
        .post('/api/notifications/alerts')
        .set('Content-Type', 'application/json')
        .send('{"productId": "test", "productName": "Test"') // Malformed JSON
        .expect(400);
    });

    it('should handle unsupported content type', async () => {
      // Act & Assert
      await request(app)
        .post('/api/notifications/alerts')
        .set('Content-Type', 'text/plain')
        .send('productId=test&productName=Test')
        .expect(400);
    });

    it('should handle invalid alert ID format', async () => {
      // Arrange
      const invalidAlertId = 'invalid-id-format';

      // Act & Assert
      await request(app)
        .get(`/api/notifications/alerts/${invalidAlertId}`)
        .expect(400);
    });

    it('should handle very long input data', async () => {
      // Arrange
      const longString = 'a'.repeat(1000);
      const alertData = {
        productId: 'test_product',
        productName: longString, // Very long name
        targetPrice: 25000,
        sourceId: 'test_source',
        sourceName: 'Test Store',
        currentPrice: 29999,
      };

      // Act & Assert
      await request(app)
        .post('/api/notifications/alerts')
        .send(alertData)
        .expect(400);
    });
  });

  describe('Input validation', () => {
    it('should validate price ranges', async () => {
      // Arrange
      const alertData = {
        productId: 'test_product',
        productName: 'Test Product',
        targetPrice: -100, // Invalid negative price
        sourceId: 'test_source',
        sourceName: 'Test Store',
        currentPrice: 29999,
      };

      // Act & Assert
      await request(app)
        .post('/api/notifications/alerts')
        .send(alertData)
        .expect(400);
    });

    it('should validate time formats', async () => {
      // Arrange
      const updates = {
        quietHoursStart: '25:00', // Invalid hour
        quietHoursEnd: '08:00',
      };

      // Act & Assert
      await request(app)
        .put('/api/notifications/preferences')
        .send(updates)
        .expect(400);
    });

    it('should validate time ranges', async () => {
      // Arrange
      const updates = {
        quietHoursStart: '08:00',
        quietHoursEnd: '07:00', // End time before start time
      };

      // Act & Assert
      await request(app)
        .put('/api/notifications/preferences')
        .send(updates)
        .expect(400);
    });
  });
});
