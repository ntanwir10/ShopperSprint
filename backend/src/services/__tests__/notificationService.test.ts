import { NotificationService } from "../notificationService";
import { WebSocketService } from "../websocketService";

// Mock WebSocketService
jest.mock("../websocketService");

describe("NotificationService", () => {
  let notificationService: NotificationService;
  let mockWebSocketService: jest.Mocked<WebSocketService>;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Create mock WebSocketService
    mockWebSocketService = {
      broadcastToAll: jest.fn(),
      broadcastPriceUpdate: jest.fn(),
      broadcastSearchComplete: jest.fn(),
      getConnectedClientsCount: jest.fn(),
      close: jest.fn(),
    } as any;

    // Create NotificationService instance
    notificationService = new NotificationService(mockWebSocketService);
  });

  describe("createPriceAlert", () => {
    it("should create a new price alert successfully", async () => {
      // Arrange
      const alertData = {
        productId: "test_product",
        productName: "Test Smartphone",
        targetPrice: 25000,
        sourceId: "test_source",
        sourceName: "Test Store",
        currentPrice: 29999,
      };

      // Act
      const alert = await notificationService.createPriceAlert(
        alertData.productId,
        alertData.productName,
        alertData.targetPrice,
        alertData.sourceId,
        alertData.sourceName,
        alertData.currentPrice
      );

      // Assert
      expect(alert).not.toBeNull();
      expect(alert.id).toMatch(/^alert_\d+$/);
      expect(alert.productId).toBe(alertData.productId);
      expect(alert.productName).toBe(alertData.productName);
      expect(alert.targetPrice).toBe(alertData.targetPrice);
      expect(alert.sourceId).toBe(alertData.sourceId);
      expect(alert.sourceName).toBe(alertData.sourceName);
      expect(alert.currentPrice).toBe(alertData.currentPrice);
      expect(alert.isActive).toBe(true);
      expect(alert.createdAt).toBeInstanceOf(Date);
    });

    it("should generate unique IDs for different alerts", async () => {
      // Arrange
      const alertData = {
        productId: "product1",
        productName: "Product 1",
        targetPrice: 10000,
        sourceId: "source1",
        sourceName: "Store 1",
        currentPrice: 15000,
      };

      // Act
      const alert1 = await notificationService.createPriceAlert(
        alertData.productId,
        alertData.productName,
        alertData.targetPrice,
        alertData.sourceId,
        alertData.sourceName,
        alertData.currentPrice
      );

      // Add a small delay to ensure different timestamps
      await new Promise((resolve) => setTimeout(resolve, 1));

      const alert2 = await notificationService.createPriceAlert(
        alertData.productId,
        "Product 2",
        alertData.targetPrice,
        alertData.sourceId,
        alertData.sourceName,
        alertData.currentPrice
      );

      // Assert
      expect(alert1.id).not.toBe(alert2.id);
    });
  });

  describe("getAllAlerts", () => {
    it("should return all alerts including sample data", async () => {
      // Act
      const alerts = await notificationService.getAllAlerts();

      // Assert
      expect(alerts.length).toBeGreaterThanOrEqual(2); // Sample data + any created during tests
      expect(
        alerts.some((alert) => alert.productName === "Sample Smartphone")
      ).toBe(true);
      expect(
        alerts.some((alert) => alert.productName === "Sample Laptop")
      ).toBe(true);
    });
  });

  describe("updatePriceAlert", () => {
    it("should update an existing alert successfully", async () => {
      // Arrange
      const alert = await notificationService.createPriceAlert(
        "test_product",
        "Test Product",
        25000,
        "test_source",
        "Test Store",
        29999
      );

      const updates = {
        targetPrice: 20000,
        isActive: false,
      };

      // Act
      const updatedAlert = await notificationService.updatePriceAlert(
        alert.id,
        updates
      );

      // Assert
      expect(updatedAlert).not.toBeNull();
      expect(updatedAlert!.targetPrice).toBe(20000);
      expect(updatedAlert!.isActive).toBe(false);
      expect(updatedAlert!.productName).toBe("Test Product"); // Unchanged field
    });

    it("should return null for non-existent alert", async () => {
      // Act
      const result = await notificationService.updatePriceAlert(
        "non_existent_id",
        { isActive: false }
      );

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("deletePriceAlert", () => {
    it("should delete an existing alert successfully", async () => {
      // Arrange
      const alert = await notificationService.createPriceAlert(
        "test_product",
        "Test Product",
        25000,
        "test_source",
        "Test Store",
        29999
      );

      // Act
      const deleted = await notificationService.deletePriceAlert(alert.id);

      // Assert
      expect(deleted).toBe(true);

      // Verify alert is no longer retrievable
      const alerts = await notificationService.getAllAlerts();
      expect(alerts.find((a) => a.id === alert.id)).toBeUndefined();
    });

    it("should return false for non-existent alert", async () => {
      // Act
      const result = await notificationService.deletePriceAlert(
        "non_existent_id"
      );

      // Assert
      expect(result).toBe(false);
    });
  });

  describe("checkPriceAlerts", () => {
    it("should trigger alerts when price drops below target", async () => {
      // Arrange
      const alert = await notificationService.createPriceAlert(
        "test_product",
        "Test Product",
        25000, // Target price
        "test_source",
        "Test Store",
        29999
      );

      const newPrice = 20000; // Below target price
      const sourceId = "test_source";
      const sourceName = "Test Store";

      // Act
      await notificationService.checkPriceAlerts(
        "test_product",
        newPrice,
        sourceId,
        sourceName
      );

      // Assert
      expect(mockWebSocketService.broadcastToAll).toHaveBeenCalledWith({
        type: "price_alert",
        data: expect.objectContaining({
          alertId: alert.id,
          productName: "Test Product",
          targetPrice: 25000,
          currentPrice: 20000,
          sourceName: "Test Store",
        }),
        timestamp: expect.any(Date),
      });
    });

    it("should not trigger alerts when price is above target", async () => {
      // Arrange
      await notificationService.createPriceAlert(
        "test_product",
        "Test Product",
        25000, // Target price
        "test_source",
        "Test Store",
        29999
      );

      const newPrice = 30000; // Above target price
      const sourceId = "test_source";
      const sourceName = "Test Store";

      // Act
      await notificationService.checkPriceAlerts(
        "test_product",
        newPrice,
        sourceId,
        sourceName
      );

      // Assert
      expect(mockWebSocketService.broadcastToAll).not.toHaveBeenCalled();
    });

    it("should deactivate alert after triggering", async () => {
      // Arrange
      const alert = await notificationService.createPriceAlert(
        "test_product",
        "Test Product",
        25000,
        "test_source",
        "Test Store",
        29999
      );

      // Act
      await notificationService.checkPriceAlerts(
        "test_product",
        20000,
        "test_source",
        "Test Store"
      );

      // Assert
      const alerts = await notificationService.getAllAlerts();
      const updatedAlert = alerts.find((a) => a.id === alert.id);
      expect(updatedAlert!.isActive).toBe(false);
      expect(updatedAlert!.triggeredAt).toBeDefined();
      expect(updatedAlert!.currentPrice).toBe(20000);
    });
  });

  describe("getPreferences", () => {
    it("should return default preferences", async () => {
      // Act
      const preferences = await notificationService.getPreferences();

      // Assert
      expect(preferences).not.toBeNull();
      expect(preferences!.id).toBe("default");
      expect(preferences!.emailNotifications).toBe(true);
      expect(preferences!.pushNotifications).toBe(true);
      expect(preferences!.quietHoursStart).toBe("22:00");
      expect(preferences!.quietHoursEnd).toBe("08:00");
      expect(preferences!.timezone).toBe("UTC");
    });
  });

  describe("updatePreferences", () => {
    it("should update preferences successfully", async () => {
      // Arrange
      const updates = {
        quietHoursStart: "23:00",
        quietHoursEnd: "07:00",
        emailNotifications: false,
      };

      // Act
      const updatedPreferences = await notificationService.updatePreferences(
        updates
      );

      // Assert
      expect(updatedPreferences.quietHoursStart).toBe("23:00");
      expect(updatedPreferences.quietHoursEnd).toBe("07:00");
      expect(updatedPreferences.emailNotifications).toBe(false);
      expect(updatedPreferences.pushNotifications).toBe(true); // Unchanged
    });
  });

  describe("getActiveAlertsCount", () => {
    it("should return correct count of active alerts", async () => {
      // Arrange
      await notificationService.createPriceAlert(
        "product1",
        "Product 1",
        25000,
        "source1",
        "Store 1",
        29999
      );

      await notificationService.createPriceAlert(
        "product2",
        "Product 2",
        30000,
        "source2",
        "Store 2",
        35000
      );

      // Act
      const count = await notificationService.getActiveAlertsCount();

      // Assert
      expect(count).toBeGreaterThanOrEqual(3); // 2 sample alerts + 1 new alert (the other one was triggered and deactivated)
    });
  });

  describe("getTriggeredAlertsCount", () => {
    it("should return correct count of triggered alerts", async () => {
      // Arrange
      await notificationService.createPriceAlert(
        "test_product",
        "Test Product",
        25000,
        "test_source",
        "Test Store",
        29999
      );

      // Trigger the alert
      await notificationService.checkPriceAlerts(
        "test_product",
        20000,
        "test_source",
        "Test Store"
      );

      // Act
      const count = await notificationService.getTriggeredAlertsCount();

      // Assert
      expect(count).toBeGreaterThanOrEqual(1);
    });
  });

  describe("quiet hours logic", () => {
    it("should respect quiet hours when sending notifications", async () => {
      // Arrange
      await notificationService.createPriceAlert(
        "test_product",
        "Test Product",
        25000,
        "test_source",
        "Test Store",
        29999
      );

      // Mock the isInQuietHours method to return true
      const originalIsInQuietHours = (notificationService as any).isInQuietHours;
      (notificationService as any).isInQuietHours = jest.fn().mockReturnValue(true);

      // Act
      await notificationService.checkPriceAlerts(
        "test_product",
        20000,
        "test_source",
        "Test Store"
      );

      // Assert
      expect(mockWebSocketService.broadcastToAll).not.toHaveBeenCalled();

      // Restore the original method
      (notificationService as any).isInQuietHours = originalIsInQuietHours;
    });
  });
});
