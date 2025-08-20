import { EventEmitter } from "events";
import { getRedis } from "../database/connection";

export interface ScrapingHealthMetrics {
  sourceId: string;
  sourceName: string;
  status: "healthy" | "warning" | "critical" | "unknown";
  lastSuccessfulScrape: Date | null;
  lastError: string | null;
  successRate: number;
  averageResponseTime: number;
  totalRequests: number;
  errorCount: number;
  lastCheck: Date;
}

export interface AlertConfig {
  successRateThreshold: number; // Below this percentage triggers warning
  responseTimeThreshold: number; // Above this milliseconds triggers warning
  errorCountThreshold: number; // Above this count triggers warning
  checkInterval: number; // How often to check health (in milliseconds)
}

export interface Alert {
  id: string;
  sourceId: string;
  sourceName: string;
  type: "warning" | "critical" | "recovery";
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
}

export class MonitoringService extends EventEmitter {
  private metrics: Map<string, ScrapingHealthMetrics> = new Map();
  private alerts: Alert[] = [];
  private config: AlertConfig;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private redis: any;

  constructor(config: Partial<AlertConfig> = {}) {
    super();
    this.config = {
      successRateThreshold: 80, // 80% success rate threshold
      responseTimeThreshold: 10000, // 10 seconds response time threshold
      errorCountThreshold: 5, // 5 consecutive errors
      checkInterval: 5 * 60 * 1000, // Check every 5 minutes
      ...config,
    };

    // Don't initialize Redis immediately - lazy initialize when needed
    this.redis = null;
  }

  /**
   * Lazy initialize Redis connection
   */
  private async ensureRedis(): Promise<void> {
    if (!this.redis) {
      try {
        this.redis = getRedis();
        this.startHealthChecks();
      } catch (error) {
        console.error("Failed to initialize Redis in MonitoringService:", error);
        this.redis = null;
      }
    }
  }

  /**
   * Update metrics for a scraping source
   */
  async updateMetrics(
    sourceId: string,
    metrics: Partial<ScrapingHealthMetrics>
  ): Promise<void> {
    await this.ensureRedis(); // Ensure Redis is initialized

    const current = this.metrics.get(sourceId) || {
      sourceId,
      sourceName: "Unknown",
      status: "unknown",
      lastSuccessfulScrape: null,
      lastError: null,
      successRate: 100,
      averageResponseTime: 0,
      totalRequests: 0,
      errorCount: 0,
      lastCheck: new Date(),
    };

    const updated = { ...current, ...metrics, lastCheck: new Date() };

    // Calculate success rate
    if (updated.totalRequests > 0) {
      updated.successRate =
        ((updated.totalRequests - updated.errorCount) / updated.totalRequests) *
        100;
    }

    // Determine status
    updated.status = this.calculateStatus(updated);

    this.metrics.set(sourceId, updated);

    // Store in Redis for persistence
    await this.persistMetrics(sourceId, updated);

    // Emit metrics update event
    this.emit("metricsUpdated", sourceId, updated);

    // Check if we need to create alerts
    this.checkForAlerts(updated);
  }

  /**
   * Check if metrics warrant creating alerts
   */
  private checkForAlerts(metrics: ScrapingHealthMetrics): void {
    // Check for critical status
    if (metrics.status === "critical") {
      this.createAlert({
        sourceId: metrics.sourceId,
        sourceName: metrics.sourceName,
        type: "critical",
        message: `Source ${
          metrics.sourceName
        } is in critical state. Success rate: ${metrics.successRate.toFixed(
          1
        )}%, Last error: ${metrics.lastError || "None"}`,
      });
    }
    // Check for warning status
    else if (metrics.status === "warning") {
      this.createAlert({
        sourceId: metrics.sourceId,
        sourceName: metrics.sourceName,
        type: "warning",
        message: `Source ${
          metrics.sourceName
        } is showing warning signs. Success rate: ${metrics.successRate.toFixed(
          1
        )}%, Response time: ${metrics.averageResponseTime}ms`,
      });
    }
  }

  /**
   * Get health metrics for all sources
   */
  async getAllMetrics(): Promise<ScrapingHealthMetrics[]> {
    await this.ensureRedis(); // Ensure Redis is initialized
    return Array.from(this.metrics.values());
  }

  /**
   * Get health metrics for a specific source
   */
  async getSourceMetrics(sourceId: string): Promise<ScrapingHealthMetrics | null> {
    await this.ensureRedis(); // Ensure Redis is initialized
    return this.metrics.get(sourceId) || null;
  }

  /**
   * Get all active alerts
   */
  async getActiveAlerts(): Promise<Alert[]> {
    await this.ensureRedis(); // Ensure Redis is initialized
    return this.alerts.filter((alert) => !alert.acknowledged);
  }

  /**
   * Acknowledge an alert
   */
  async acknowledgeAlert(alertId: string, acknowledgedBy: string): Promise<boolean> {
    await this.ensureRedis(); // Ensure Redis is initialized
    const alert = this.alerts.find((a) => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      alert.acknowledgedBy = acknowledgedBy;
      alert.acknowledgedAt = new Date();
      this.emit("alertAcknowledged", alertId, acknowledgedBy);
      return true;
    }
    return false;
  }

  /**
   * Start periodic health checks
   */
  private startHealthChecks(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck();
    }, this.config.checkInterval);

    // Perform initial health check
    this.performHealthCheck();
  }

  /**
   * Perform a comprehensive health check
   */
  private async performHealthCheck(): Promise<void> {
    await this.ensureRedis(); // Ensure Redis is initialized
    try {
      const sources = Array.from(this.metrics.values());

      for (const source of sources) {
        const healthStatus = await this.checkSourceHealth(source);

        if (healthStatus.status !== source.status) {
          await this.updateMetrics(source.sourceId, { status: healthStatus.status });

          // Create status change alert
          if (healthStatus.status === "critical") {
            this.createAlert({
              sourceId: source.sourceId,
              sourceName: source.sourceName,
              type: "critical",
              message: `Source ${
                source.sourceName
              } is in critical state. Success rate: ${source.successRate.toFixed(
                1
              )}%, Last error: ${source.lastError || "None"}`,
            });
          } else if (healthStatus.status === "warning") {
            this.createAlert({
              sourceId: source.sourceId,
              sourceName: source.sourceName,
              type: "warning",
              message: `Source ${
                source.sourceName
              } is showing warning signs. Success rate: ${source.successRate.toFixed(
                1
              )}%, Response time: ${source.averageResponseTime}ms`,
            });
          } else if (
            healthStatus.status === "healthy" &&
            source.status !== "healthy"
          ) {
            this.createAlert({
              sourceId: source.sourceId,
              sourceName: source.sourceName,
              type: "recovery",
              message: `Source ${
                source.sourceName
              } has recovered and is now healthy. Success rate: ${source.successRate.toFixed(
                1
              )}%`,
            });
          }
        }
      }

      this.emit("healthCheckCompleted", sources);
    } catch (error) {
      console.error("Health check failed:", error);
      this.emit("healthCheckFailed", error);
    }
  }

  /**
   * Check health of a specific source
   */
  private async checkSourceHealth(
    source: ScrapingHealthMetrics
  ): Promise<{ status: "healthy" | "warning" | "critical" | "unknown" }> {
    await this.ensureRedis(); // Ensure Redis is initialized
    const now = new Date();

    // Check if source is too old (no recent activity)
    if (source.lastCheck) {
      // Ensure lastCheck is a Date object
      const lastCheckDate =
        source.lastCheck instanceof Date
          ? source.lastCheck
          : new Date(source.lastCheck);
      if (now.getTime() - lastCheckDate.getTime() > 30 * 60 * 1000) {
        return { status: "unknown" };
      }
    }

    // Check success rate
    if (source.successRate < 50) {
      return { status: "critical" };
    } else if (source.successRate < this.config.successRateThreshold) {
      return { status: "warning" };
    }

    // Check response time
    if (source.averageResponseTime > this.config.responseTimeThreshold * 2) {
      return { status: "critical" };
    } else if (source.averageResponseTime > this.config.responseTimeThreshold) {
      return { status: "warning" };
    }

    // Check error count
    if (source.errorCount > this.config.errorCountThreshold * 2) {
      return { status: "critical" };
    } else if (source.errorCount > this.config.errorCountThreshold) {
      return { status: "warning" };
    }

    return { status: "healthy" };
  }

  /**
   * Create a new alert
   */
  private createAlert(
    alertData: Omit<Alert, "id" | "timestamp" | "acknowledged">
  ): void {
    const alert: Alert = {
      ...alertData,
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      acknowledged: false,
    };

    this.alerts.push(alert);

    // Store in Redis
    this.persistAlert(alert);

    // Emit alert event
    this.emit("alertCreated", alert);

    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }
  }

  /**
   * Calculate overall status based on metrics
   */
  private calculateStatus(
    metrics: ScrapingHealthMetrics
  ): "healthy" | "warning" | "critical" | "unknown" {
    if (
      metrics.successRate < 50 ||
      metrics.averageResponseTime > this.config.responseTimeThreshold * 2
    ) {
      return "critical";
    } else if (
      metrics.successRate < this.config.successRateThreshold ||
      metrics.averageResponseTime > this.config.responseTimeThreshold ||
      metrics.errorCount > this.config.errorCountThreshold
    ) {
      return "warning";
    }
    return "healthy";
  }

  /**
   * Persist metrics to Redis
   */
  private async persistMetrics(
    sourceId: string,
    metrics: ScrapingHealthMetrics
  ): Promise<void> {
    await this.ensureRedis(); // Ensure Redis is initialized
    try {
      if (this.redis) {
        await this.redis.setEx(
          `scraping:metrics:${sourceId}`,
          3600, // 1 hour TTL
          JSON.stringify(metrics)
        );
      }
    } catch (error) {
      console.error("Failed to persist metrics to Redis:", error);
    }
  }

  /**
   * Persist alert to Redis
   */
  private async persistAlert(alert: Alert): Promise<void> {
    await this.ensureRedis(); // Ensure Redis is initialized
    try {
      if (this.redis) {
        await this.redis.setEx(
          `scraping:alert:${alert.id}`,
          86400, // 24 hours TTL
          JSON.stringify(alert)
        );
      }
    } catch (error) {
      console.error("Failed to persist alert to Redis:", error);
    }
  }

  /**
   * Load metrics from Redis on startup
   */
  async loadPersistedData(): Promise<void> {
    await this.ensureRedis(); // Ensure Redis is initialized
    try {
      if (!this.redis) return;

      // Load metrics
      const metricKeys = await this.redis.keys("scraping:metrics:*");
      for (const key of metricKeys) {
        const data = await this.redis.get(key);
        if (data) {
          const metrics: ScrapingHealthMetrics = JSON.parse(data);
          this.metrics.set(metrics.sourceId, metrics);
        }
      }

      // Load alerts
      const alertKeys = await this.redis.keys("scraping:alert:*");
      for (const key of alertKeys) {
        const data = await this.redis.get(key);
        if (data) {
          const alert: Alert = JSON.parse(data);
          this.alerts.push(alert);
        }
      }

      console.log(
        `Loaded ${this.metrics.size} metrics and ${this.alerts.length} alerts from Redis`
      );
    } catch (error) {
      console.error("Failed to load persisted data from Redis:", error);
    }
  }

  /**
   * Get system health summary
   */
  async getSystemHealth(): Promise<{
    totalSources: number;
    healthySources: number;
    warningSources: number;
    criticalSources: number;
    unknownSources: number;
    activeAlerts: number;
    overallStatus: string;
  }> {
    await this.ensureRedis(); // Ensure Redis is initialized
    const sources = Array.from(this.metrics.values());
    const healthy = sources.filter((s) => s.status === "healthy").length;
    const warning = sources.filter((s) => s.status === "warning").length;
    const critical = sources.filter((s) => s.status === "critical").length;
    const unknown = sources.filter((s) => s.status === "unknown").length;
    const activeAlerts = (await this.getActiveAlerts()).length;

    let overallStatus = "healthy";
    if (critical > 0) overallStatus = "critical";
    else if (warning > 0) overallStatus = "warning";
    else if (unknown > sources.length * 0.5) overallStatus = "unknown";

    return {
      totalSources: sources.length,
      healthySources: healthy,
      warningSources: warning,
      criticalSources: critical,
      unknownSources: unknown,
      activeAlerts,
      overallStatus,
    };
  }

  /**
   * Stop health checks and cleanup
   */
  stop(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    this.removeAllListeners();
  }
}

// Export singleton instance
export const monitoringService = new MonitoringService();
