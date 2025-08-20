import { v4 as uuidv4 } from "uuid";
import { getDb } from "../database/connection";
import { anonymousPriceAlerts, products } from "../database/schema";
import { eq, and, lt } from "drizzle-orm";
import { EmailService } from "./emailService";

export interface AnonymousPriceAlert {
  id: string;
  email: string;
  productId: string;
  targetPrice: number;
  currency: string;
  alertType: string;
  threshold?: number | null;
  verificationToken: string;
  managementToken: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAnonymousAlertData {
  email: string;
  productId: string;
  targetPrice: number;
  currency?: string;
  alertType?: string;
  threshold?: number | null;
}

export interface UpdateAnonymousAlertData {
  targetPrice?: number;
  currency?: string;
  alertType?: string;
  threshold?: number | null;
  isActive?: boolean;
}

export class AnonymousNotificationService {
  private emailService: EmailService;

  constructor() {
    this.emailService = new EmailService();
  }

  /**
   * Create a new anonymous price alert
   */
  async createAnonymousAlert(
    data: CreateAnonymousAlertData
  ): Promise<AnonymousPriceAlert> {
    // Verify product exists
    const product = await getDb().query.products.findFirst({
      where: eq(products.id, data.productId),
    });

    if (!product) {
      throw new Error("Product not found");
    }

    // Check if user already has an active alert for this product
    const existingAlert = await getDb().query.anonymousPriceAlerts.findFirst({
      where: and(
        eq(anonymousPriceAlerts.email, data.email),
        eq(anonymousPriceAlerts.productId, data.productId),
        eq(anonymousPriceAlerts.isActive, true)
      ),
    });

    if (existingAlert) {
      throw new Error("You already have an active alert for this product");
    }

    // Generate unique tokens
    const verificationToken = uuidv4();
    const managementToken = uuidv4();

    // Create new alert
    const [newAlert] = await getDb()
      .insert(anonymousPriceAlerts)
      .values({
        email: data.email,
        productId: data.productId,
        targetPrice: data.targetPrice,
        currency: data.currency || "USD",
        alertType: data.alertType || "below",
        threshold: data.threshold || null,
        verificationToken,
        managementToken,
        isVerified: false,
        isActive: true,
      })
      .returning();

    if (!newAlert) {
      throw new Error("Failed to create price alert");
    }

    // Send verification email
    try {
      await this.emailService.sendVerificationEmail({
        id: newAlert.id,
        email: newAlert.email,
        productId: newAlert.productId,
        targetPrice: newAlert.targetPrice,
        currency: newAlert.currency,
        alertType: newAlert.alertType,
        threshold: newAlert.threshold,
        verificationToken: newAlert.verificationToken,
        managementToken: newAlert.managementToken,
        isVerified: newAlert.isVerified,
        isActive: newAlert.isActive,
        createdAt: newAlert.createdAt,
        updatedAt: newAlert.updatedAt,
      });
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // Continue without email - user can still verify via management link
    }

    return {
      id: newAlert.id,
      email: newAlert.email,
      productId: newAlert.productId,
      targetPrice: newAlert.targetPrice,
      currency: newAlert.currency,
      alertType: newAlert.alertType,
      threshold: newAlert.threshold,
      verificationToken: newAlert.verificationToken,
      managementToken: newAlert.managementToken,
      isVerified: newAlert.isVerified,
      isActive: newAlert.isActive,
      createdAt: newAlert.createdAt,
      updatedAt: newAlert.updatedAt,
    };
  }

  /**
   * Verify an anonymous price alert via verification token
   */
  async verifyAlert(verificationToken: string): Promise<AnonymousPriceAlert> {
    const [alert] = await getDb()
      .update(anonymousPriceAlerts)
      .set({
        isVerified: true,
        updatedAt: new Date(),
      })
      .where(eq(anonymousPriceAlerts.verificationToken, verificationToken))
      .returning();

    if (!alert) {
      throw new Error("Invalid verification token");
    }

    return {
      id: alert.id,
      email: alert.email,
      productId: alert.productId,
      targetPrice: alert.targetPrice,
      currency: alert.currency,
      alertType: alert.alertType,
      threshold: alert.threshold,
      verificationToken: alert.verificationToken,
      managementToken: alert.managementToken,
      isVerified: alert.isVerified,
      isActive: alert.isActive,
      createdAt: alert.createdAt,
      updatedAt: alert.updatedAt,
    };
  }

  /**
   * Get alert details by management token
   */
  async getAlertByManagementToken(
    managementToken: string
  ): Promise<AnonymousPriceAlert | null> {
    const alert = await getDb().query.anonymousPriceAlerts.findFirst({
      where: eq(anonymousPriceAlerts.managementToken, managementToken),
      with: {
        product: true,
      },
    });

    if (!alert) {
      return null;
    }

    return {
      id: alert.id,
      email: alert.email,
      productId: alert.productId,
      targetPrice: alert.targetPrice,
      currency: alert.currency,
      alertType: alert.alertType,
      threshold: alert.threshold,
      verificationToken: alert.verificationToken,
      managementToken: alert.managementToken,
      isVerified: alert.isVerified,
      isActive: alert.isActive,
      createdAt: alert.createdAt,
      updatedAt: alert.updatedAt,
    };
  }

  /**
   * Update an anonymous price alert
   */
  async updateAlert(
    managementToken: string,
    updates: UpdateAnonymousAlertData
  ): Promise<AnonymousPriceAlert> {
    const alert = await this.getAlertByManagementToken(managementToken);
    if (!alert) {
      throw new Error("Alert not found");
    }

    const [updatedAlert] = await getDb()
      .update(anonymousPriceAlerts)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(anonymousPriceAlerts.managementToken, managementToken))
      .returning();

    if (!updatedAlert) {
      throw new Error("Failed to update alert");
    }

    return {
      id: updatedAlert.id,
      email: updatedAlert.email,
      productId: updatedAlert.productId,
      targetPrice: updatedAlert.targetPrice,
      currency: updatedAlert.currency,
      alertType: updatedAlert.alertType,
      threshold: updatedAlert.threshold,
      verificationToken: updatedAlert.verificationToken,
      managementToken: updatedAlert.managementToken,
      isVerified: updatedAlert.isVerified,
      isActive: updatedAlert.isActive,
      createdAt: updatedAlert.createdAt,
      updatedAt: updatedAlert.updatedAt,
    };
  }

  /**
   * Delete an anonymous price alert
   */
  async deleteAlert(managementToken: string): Promise<void> {
    const alert = await this.getAlertByManagementToken(managementToken);
    if (!alert) {
      throw new Error("Alert not found");
    }

    await getDb()
      .delete(anonymousPriceAlerts)
      .where(eq(anonymousPriceAlerts.managementToken, managementToken));
  }

  /**
   * Get all alerts for an email address
   */
  async getAlertsByEmail(email: string): Promise<AnonymousPriceAlert[]> {
    const alerts = await getDb().query.anonymousPriceAlerts.findMany({
      where: eq(anonymousPriceAlerts.email, email),
      with: {
        product: true,
      },
      orderBy: (anonymousPriceAlerts, { desc }) => [
        desc(anonymousPriceAlerts.createdAt),
      ],
    });

    return alerts.map((alert) => ({
      id: alert.id,
      email: alert.email,
      productId: alert.productId,
      targetPrice: alert.targetPrice,
      currency: alert.currency,
      alertType: alert.alertType,
      threshold: alert.threshold,
      verificationToken: alert.verificationToken,
      managementToken: alert.managementToken,
      isVerified: alert.isVerified,
      isActive: alert.isActive,
      createdAt: alert.createdAt,
      updatedAt: alert.updatedAt,
    }));
  }

  /**
   * Check if price alert should be triggered
   */
  async checkPriceAlert(
    alertId: string,
    currentPrice: number
  ): Promise<boolean> {
    const alert = await getDb().query.anonymousPriceAlerts.findFirst({
      where: eq(anonymousPriceAlerts.id, alertId),
      with: {
        product: true,
      },
    });

    if (!alert || !alert.isActive || !alert.isVerified) {
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
    const alert = await getDb().query.anonymousPriceAlerts.findFirst({
      where: eq(anonymousPriceAlerts.id, alertId),
      with: {
        product: true,
      },
    });

    if (!alert || !alert.isActive || !alert.isVerified) {
      return;
    }

    // Send email notification
    try {
      await this.emailService.sendPriceAlertTriggeredEmail(
        {
          id: alert.id,
          email: alert.email,
          productId: alert.productId,
          targetPrice: alert.targetPrice,
          currency: alert.currency,
          alertType: alert.alertType,
          threshold: alert.threshold,
          verificationToken: alert.verificationToken,
          managementToken: alert.managementToken,
          isVerified: alert.isVerified,
          isActive: alert.isActive,
          createdAt: alert.createdAt,
          updatedAt: alert.updatedAt,
        },
        currentPrice
      );
    } catch (emailError) {
      console.error("Failed to send price alert notification:", emailError);
    }
  }

  /**
   * Get notification statistics
   */
  async getNotificationStats(): Promise<{
    totalAlerts: number;
    activeAlerts: number;
    verifiedAlerts: number;
    totalEmails: number;
  }> {
    const totalAlertsResult = await getDb().select().from(anonymousPriceAlerts);
    const activeAlertsResult = await getDb()
      .select()
      .from(anonymousPriceAlerts)
      .where(eq(anonymousPriceAlerts.isActive, true));
    const verifiedAlertsResult = await getDb()
      .select()
      .from(anonymousPriceAlerts)
      .where(eq(anonymousPriceAlerts.isVerified, true));

    // Count unique emails
    const uniqueEmails = new Set(totalAlertsResult.map((alert) => alert.email));

    return {
      totalAlerts: totalAlertsResult.length,
      activeAlerts: activeAlertsResult.length,
      verifiedAlerts: verifiedAlertsResult.length,
      totalEmails: uniqueEmails.size,
    };
  }

  /**
   * Clean up expired verification tokens (older than 24 hours)
   */
  async cleanupExpiredTokens(): Promise<number> {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Delete all unverified tokens created more than 24 hours ago
    const deleted = await getDb()
      .delete(anonymousPriceAlerts)
      .where(
        and(
          eq(anonymousPriceAlerts.isVerified, false),
          lt(anonymousPriceAlerts.createdAt, twentyFourHoursAgo)
        )
      );

    // Drizzle's delete() without returning doesn't provide count; best-effort return
    return Array.isArray(deleted) ? deleted.length : 0;
  }
}
