// Lightweight health check utility for frontend
// This avoids burdening the backend with heavy health checks

export interface HealthStatus {
  status: 'healthy' | 'warning' | 'critical' | 'unknown';
  lastCheck: number;
  responseTime: number;
  error?: string;
}

export class HealthChecker {
  private healthStatus: HealthStatus = {
    status: 'unknown',
    lastCheck: 0,
    responseTime: 0,
  };
  private isChecking = false;
  private intervalId: NodeJS.Timeout | null = null;
  private checkInterval: number;

  constructor(checkInterval: number = 30000) {
    this.checkInterval = checkInterval;
  }

  /**
   * Start periodic health checks
   */
  start(): void {
    if (this.intervalId) {
      this.stop();
    }

    // Perform initial check
    this.performHealthCheck();

    // Set up periodic checks
    this.intervalId = setInterval(() => {
      this.performHealthCheck();
    }, this.checkInterval);
  }

  /**
   * Stop periodic health checks
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Get current health status
   */
  getStatus(): HealthStatus {
    return { ...this.healthStatus };
  }

  /**
   * Perform a single health check
   */
  async performHealthCheck(): Promise<HealthStatus> {
    if (this.isChecking) {
      return this.healthStatus;
    }

    this.isChecking = true;
    const startTime = Date.now();

    try {
      // Use the lightweight ping endpoint
      const response = await fetch('/ping', {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
        // Very short timeout to avoid blocking
        signal: AbortSignal.timeout(2000),
      });

      const responseTime = Date.now() - startTime;

      if (response.ok) {
        this.healthStatus = {
          status: 'healthy',
          lastCheck: Date.now(),
          responseTime,
        };
      } else {
        this.healthStatus = {
          status: 'warning',
          lastCheck: Date.now(),
          responseTime,
          error: `HTTP ${response.status}`,
        };
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      this.healthStatus = {
        status: 'critical',
        lastCheck: Date.now(),
        responseTime,
        error: errorMessage,
      };
    } finally {
      this.isChecking = false;
    }

    return this.healthStatus;
  }

  /**
   * Check if the service is healthy
   */
  isHealthy(): boolean {
    return this.healthStatus.status === 'healthy';
  }

  /**
   * Check if the service needs attention
   */
  needsAttention(): boolean {
    return (
      this.healthStatus.status === 'warning' ||
      this.healthStatus.status === 'critical'
    );
  }

  /**
   * Get response time in milliseconds
   */
  getResponseTime(): number {
    return this.healthStatus.responseTime;
  }

  /**
   * Get time since last check
   */
  getTimeSinceLastCheck(): number {
    return Date.now() - this.healthStatus.lastCheck;
  }
}

// Export singleton instance
export const healthChecker = new HealthChecker();
