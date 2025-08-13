import { WebSocketService } from "./websocketService";
import { getDb } from "../database/connection";
import {
  priceAlerts,
  userPreferences,
  products,
  users,
} from "../database/schema";
import { eq, and } from "drizzle-orm";

export interface PriceAlert {
  id: string;
  userId: string;
  productId: string;
  targetPrice: number;
  currency: string;
  alertType: string;
  threshold?: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationPreferences {
  id: string;
  userId: string;
  notificationEmail: boolean;
  notificationPush: boolean;
  quietHoursStart?: string | null; // HH:MM format
  quietHoursEnd?: string | null; // HH:MM format
  timezone: string;
  language: string;
  currency: string;
}

export class NotificationService {
  private webSocketService: WebSocketService;

  constructor(webSocketService: WebSocketService) {
    this.webSocketService = webSocketService;
  }

  /**
   * Create a new price alert for a user
   */
  async createPriceAlert(
    userId: string,
    productId: string,
    targetPrice: number,
    currency: string = "USD",
    alertType: string = "below",
    threshold?: number
  ): Promise<PriceAlert> {
    // Verify product exists
    const product = await getDb().query.products.findFirst({
      where: eq(products.id, productId),
    });

    if (!product) {
      throw new Error("Product not found");
    }

    // Check if user already has an alert for this product
    const existingAlert = await getDb().query.priceAlerts.findFirst({
      where: and(
        eq(priceAlerts.userId, userId),
        eq(priceAlerts.productId, productId),
        eq(priceAlerts.isActive, true)
      ),
    });

    if (existingAlert) {
      throw new Error("User already has an active alert for this product");
    }

    // Create new alert
    const [newAlert] = await getDb()
      .insert(priceAlerts)
      .values({
        userId,
        productId,
        targetPrice,
        currency,
        alertType,
        threshold: threshold || null,
        isActive: true,
      })
      .returning();

    if (!newAlert) {
      throw new Error("Failed to create price alert");
    }

    return {
      id: newAlert.id,
      userId: newAlert.userId,
      productId: newAlert.productId,
      targetPrice: newAlert.targetPrice,
      currency: newAlert.currency,
      alertType: newAlert.alertType,
      threshold: newAlert.threshold,
      isActive: newAlert.isActive,
      createdAt: newAlert.createdAt,
      updatedAt: newAlert.updatedAt,
    };
  }

  /**
   * Get all active price alerts for a user
   */
  async getUserAlerts(userId: string): Promise<PriceAlert[]> {
    const alerts = await getDb().query.priceAlerts.findMany({
      where: and(
        eq(priceAlerts.userId, userId),
        eq(priceAlerts.isActive, true)
      ),
      with: {
        product: true,
      },
    });

    return alerts.map((alert) => ({
      id: alert.id,
      userId: alert.userId,
      productId: alert.productId,
      targetPrice: alert.targetPrice,
      currency: alert.currency,
      alertType: alert.alertType,
      threshold: alert.threshold,
      isActive: alert.isActive,
      createdAt: alert.createdAt,
      updatedAt: alert.updatedAt,
    }));
  }

  /**
   * Update a price alert
   */
  async updatePriceAlert(
    alertId: string,
    userId: string,
    updates: Partial<
      Pick<
        PriceAlert,
        "targetPrice" | "currency" | "alertType" | "threshold" | "isActive"
      >
    >
  ): Promise<PriceAlert> {
    // Verify ownership
    const existingAlert = await getDb().query.priceAlerts.findFirst({
      where: and(eq(priceAlerts.id, alertId), eq(priceAlerts.userId, userId)),
    });

    if (!existingAlert) {
      throw new Error("Alert not found or access denied");
    }

    const [updatedAlert] = await getDb()
      .update(priceAlerts)
      .set({
        ...updates,
        threshold: updates.threshold || null,
        updatedAt: new Date(),
      })
      .where(eq(priceAlerts.id, alertId))
      .returning();

    if (!updatedAlert) {
      throw new Error("Failed to update alert");
    }

    return {
      id: updatedAlert.id,
      userId: updatedAlert.userId,
      productId: updatedAlert.productId,
      targetPrice: updatedAlert.targetPrice,
      currency: updatedAlert.currency,
      alertType: updatedAlert.alertType,
      threshold: updatedAlert.threshold,
      isActive: updatedAlert.isActive,
      createdAt: updatedAlert.createdAt,
      updatedAt: updatedAlert.updatedAt,
    };
  }

  /**
   * Delete a price alert
   */
  async deletePriceAlert(alertId: string, userId: string): Promise<void> {
    // Verify ownership
    const existingAlert = await getDb().query.priceAlerts.findFirst({
      where: and(eq(priceAlerts.id, alertId), eq(priceAlerts.userId, userId)),
    });

    if (!existingAlert) {
      throw new Error("Alert not found or access denied");
    }

    await getDb().delete(priceAlerts).where(eq(priceAlerts.id, alertId));
  }

  /**
   * Get user notification preferences
   */
  async getUserPreferences(
    userId: string
  ): Promise<NotificationPreferences | null> {
    const preferences = await getDb().query.userPreferences.findFirst({
      where: eq(userPreferences.userId, userId),
    });

    if (!preferences) {
      return null;
    }

    return {
      id: preferences.id,
      userId: preferences.userId,
      notificationEmail: preferences.notificationEmail,
      notificationPush: preferences.notificationPush,
      quietHoursStart: preferences.quietHoursStart,
      quietHoursEnd: preferences.quietHoursEnd,
      timezone: preferences.timezone,
      language: preferences.language,
      currency: preferences.currency,
    };
  }

  /**
   * Check if price alert should be triggered
   */
  async checkPriceAlert(
    alertId: string,
    currentPrice: number
  ): Promise<boolean> {
    const alert = await getDb().query.priceAlerts.findFirst({
      where: eq(priceAlerts.id, alertId),
      with: {
        product: true,
      },
    });

    if (!alert || !alert.isActive) {
      return false;
    }

    // Check if alert should be triggered based on type
    switch (alert.alertType) {
      case "below":
        return currentPrice <= alert.targetPrice;
      case "above":
        return currentPrice >= alert.targetPrice;
      case "percentage":
        if (alert.threshold) {
          const priceChange =
            ((currentPrice - alert.targetPrice) / alert.targetPrice) * 100;
          return Math.abs(priceChange) >= alert.threshold;
        }
        return false;
      default:
        return false;
    }
  }

  /**
   * Send notification for triggered price alert
   */
  async sendPriceAlertNotification(
    alertId: string,
    currentPrice: number
  ): Promise<void> {
    const alert = await getDb().query.priceAlerts.findFirst({
      where: eq(priceAlerts.id, alertId),
      with: {
        product: true,
        user: true,
      },
    });

    if (!alert || !alert.isActive) {
      return;
    }

    // Get user preferences
    const preferences = await this.getUserPreferences(alert.userId);
    if (!preferences) {
      return;
    }

    // Check quiet hours
    if (this.isInQuietHours(preferences)) {
      return;
    }

    // Send WebSocket notification if enabled
    if (preferences.notificationPush) {
      // Use broadcastToAll as a fallback since sendToUser doesn't exist
      this.webSocketService.broadcastToAll({
        type: "price_alert",
        data: {
          alertId: alert.id,
          productId: alert.productId,
          productName: alert.product.name,
          targetPrice: alert.targetPrice,
          currentPrice,
          currency: alert.currency,
          alertType: alert.alertType,
          threshold: alert.threshold,
        },
        timestamp: new Date(),
      });
    }

    // TODO: Send email notification if enabled
    if (preferences.notificationEmail) {
      // Implement email notification logic
      console.log(
        `Email notification sent to user ${alert.userId} for product ${alert.product.name}`
      );
    }
  }

  /**
   * Check if current time is within quiet hours
   */
  private isInQuietHours(preferences: NotificationPreferences): boolean {
    if (!preferences.quietHoursStart || !preferences.quietHoursEnd) {
      return false;
    }

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const startTime = this.parseTime(preferences.quietHoursStart);
    const endTime = this.parseTime(preferences.quietHoursEnd);

    if (startTime <= endTime) {
      // Same day range (e.g., 09:00 to 17:00)
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // Overnight range (e.g., 22:00 to 08:00)
      return currentTime >= startTime || currentTime <= endTime;
    }
  }

  /**
   * Parse time string (HH:MM) to minutes since midnight
   */
  private parseTime(timeString: string): number {
    const [hoursStr, minutesStr] = timeString.split(":");
    const hours = parseInt(hoursStr || "0", 10);
    const minutes = parseInt(minutesStr || "0", 10);
    return hours * 60 + minutes;
  }

  /**
   * Get notification statistics
   */
  async getNotificationStats(): Promise<{
    totalAlerts: number;
    activeAlerts: number;
    totalUsers: number;
  }> {
    // Use simple count queries instead of db.fn.count()
    const totalAlertsResult = await getDb().select().from(priceAlerts);
    const activeAlertsResult = await getDb()
      .select()
      .from(priceAlerts)
      .where(eq(priceAlerts.isActive, true));
    const totalUsersResult = await getDb().select().from(users);

    return {
      totalAlerts: totalAlertsResult.length,
      activeAlerts: activeAlertsResult.length,
      totalUsers: totalUsersResult.length,
    };
  }
}
