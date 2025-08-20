import crypto from "crypto";

export interface AuditEvent {
  id?: string;
  eventType: string;
  userId?: string | undefined;
  sessionId?: string | undefined;
  ipAddress?: string | undefined;
  userAgent?: string | undefined;
  resource?: string | undefined;
  action?: string | undefined;
  details?: any;
  timestamp?: Date;
  severity: "low" | "medium" | "high" | "critical";
  success: boolean;
  errorMessage?: string | undefined;
}

export class AuditService {
  private static instance: AuditService;
  private readonly MAX_BATCH_SIZE = 100;
  private readonly BATCH_TIMEOUT = 5000; // 5 seconds
  private eventQueue: AuditEvent[] = [];
  private batchTimer: NodeJS.Timeout | null = null;

  constructor() {
    // Singleton pattern
    if (AuditService.instance) {
      return AuditService.instance;
    }
    AuditService.instance = this;
  }

  /**
   * Log a security or audit event
   */
  async logEvent(event: AuditEvent): Promise<void> {
    try {
      // Generate event ID
      const eventWithId: AuditEvent = {
        ...event,
        id: crypto.randomBytes(16).toString("hex"),
        timestamp: new Date(),
      };

      // Add to queue for batch processing
      this.eventQueue.push(eventWithId);

      // Log critical events immediately
      if (event.severity === "critical") {
        await this.flushQueue();
        // Also log to console for immediate visibility
        console.error(`[CRITICAL AUDIT] ${event.eventType}:`, eventWithId);
      } else if (this.eventQueue.length >= this.MAX_BATCH_SIZE) {
        await this.flushQueue();
      } else if (!this.batchTimer) {
        this.batchTimer = setTimeout(
          () => this.flushQueue(),
          this.BATCH_TIMEOUT
        );
      }
    } catch (error) {
      console.error("Failed to log audit event:", error);
    }
  }

  /**
   * Flush the event queue to database
   */
  private async flushQueue(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }

    const eventsToProcess = [...this.eventQueue];
    this.eventQueue = [];

    try {
      // In a real implementation, you'd save to a database table
      // For now, we'll log to console with structured format
      for (const event of eventsToProcess) {
        this.logToConsole(event);
      }

      // You could also save to database here:
      // await this.saveToDatabase(eventsToProcess);
    } catch (error) {
      console.error("Failed to flush audit events:", error);
      // Re-queue events on failure
      this.eventQueue.unshift(...eventsToProcess);
    }
  }

  /**
   * Log to console with structured format
   */
  private logToConsole(event: AuditEvent): void {
    const logLevel = this.getSeverityLogLevel(event.severity);
    const logMessage = {
      timestamp: event.timestamp?.toISOString(),
      eventId: event.id,
      type: event.eventType,
      severity: event.severity,
      success: event.success,
      userId: event.userId,
      sessionId: event.sessionId,
      ip: event.ipAddress,
      resource: event.resource,
      action: event.action,
      details: event.details,
      error: event.errorMessage,
    };

    console[logLevel](
      `[AUDIT] ${event.eventType}:`,
      JSON.stringify(logMessage, null, 2)
    );
  }

  /**
   * Map severity to console log level
   */
  private getSeverityLogLevel(severity: string): "info" | "warn" | "error" {
    switch (severity) {
      case "critical":
      case "high":
        return "error";
      case "medium":
        return "warn";
      default:
        return "info";
    }
  }

  /**
   * Log authentication events
   */
  async logAuthEvent(
    eventType:
      | "login"
      | "logout"
      | "failed_login"
      | "registration"
      | "password_change",
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
    success: boolean = true,
    errorMessage?: string
  ): Promise<void> {
    await this.logEvent({
      eventType: `auth_${eventType}`,
      userId,
      ipAddress,
      userAgent,
      severity: success ? "low" : "medium",
      success,
      errorMessage,
      details: { event: eventType },
    });
  }

  /**
   * Log data access events
   */
  async logDataAccess(
    resource: string,
    action: "read" | "create" | "update" | "delete",
    userId?: string,
    ipAddress?: string,
    success: boolean = true,
    details?: any
  ): Promise<void> {
    const severity = action === "delete" ? "medium" : "low";

    await this.logEvent({
      eventType: "data_access",
      userId,
      ipAddress,
      resource,
      action,
      severity,
      success,
      details,
    });
  }

  /**
   * Log security events
   */
  async logSecurityEvent(
    eventType:
      | "csrf_violation"
      | "rate_limit_exceeded"
      | "invalid_token"
      | "suspicious_activity",
    ipAddress?: string,
    userAgent?: string,
    details?: any
  ): Promise<void> {
    await this.logEvent({
      eventType: `security_${eventType}`,
      ipAddress,
      userAgent,
      severity: "high",
      success: false,
      details,
    });
  }

  /**
   * Log system events
   */
  async logSystemEvent(
    eventType: "startup" | "shutdown" | "error" | "maintenance",
    severity: "low" | "medium" | "high" | "critical" = "low",
    details?: any
  ): Promise<void> {
    await this.logEvent({
      eventType: `system_${eventType}`,
      severity,
      success: true,
      details,
    });
  }

  /**
   * Search audit logs (for future implementation)
   */
  async searchLogs(criteria: {
    eventType?: string;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
    severity?: string;
    limit?: number;
  }): Promise<AuditEvent[]> {
    // In a real implementation, this would query the database
    console.log("Audit log search not yet implemented:", criteria);
    return [];
  }

  /**
   * Clean up old audit logs (for maintenance)
   */
  async cleanupOldLogs(olderThanDays: number = 90): Promise<number> {
    // In a real implementation, this would delete old records
    console.log(
      `Audit log cleanup not yet implemented (older than ${olderThanDays} days)`
    );
    return 0;
  }

  /**
   * Force flush any pending events (for graceful shutdown)
   */
  async shutdown(): Promise<void> {
    await this.flushQueue();
  }
}

// Export singleton instance
export const auditService = new AuditService();
