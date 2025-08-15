import { Router, Request, Response } from "express";
import { monitoringService } from "../services/monitoringService";
import { cachingService } from "../services/cachingService";
import { getRedis } from "../database/connection";

const router = Router();

// GET /api/monitoring/health - Ultra-lightweight health check for frontend
router.get("/health", async (_req: Request, res: Response) => {
  try {
    // Return minimal health info immediately (no async operations)
    const health = {
      timestamp: new Date().toISOString(),
      status: "healthy",
      uptime: process.uptime(),
      version: "1.0.0",
    };

    res.json(health);
  } catch (error) {
    // Even on error, return fast response
    res.json({
      timestamp: new Date().toISOString(),
      status: "unknown",
      uptime: process.uptime(),
      error: "Health check failed",
    });
  }
});

// GET /api/monitoring/health/detailed - Detailed health check (for admin/monitoring)
router.get("/health/detailed", async (_req: Request, res: Response) => {
  try {
    // Quick system health check (in-memory, no Redis calls)
    const systemHealth = await monitoringService.getSystemHealth();

    // Fast Redis ping only (no heavy operations)
    const redisHealth = await checkRedisHealthFast();

    const overallHealth = {
      timestamp: new Date().toISOString(),
      status: determineOverallStatus(systemHealth, redisHealth),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      // Only include critical info, skip detailed metrics
      system: {
        totalSources: systemHealth.totalSources,
        healthySources: systemHealth.healthySources,
        criticalSources: systemHealth.criticalSources,
        overallStatus: systemHealth.overallStatus,
      },
      redis: {
        status: redisHealth.status,
        connected: redisHealth.connected,
      },
    };

    res.json(overallHealth);
  } catch (error) {
    console.error("Detailed health check error:", error);
    // Return minimal health info even on error
    res.json({
      timestamp: new Date().toISOString(),
      status: "unknown",
      uptime: process.uptime(),
      error: "Health check failed",
    });
  }
});

// GET /api/monitoring/metrics - All scraping metrics
router.get("/metrics", async (_req: Request, res: Response) => {
  try {
    const metrics = await monitoringService.getAllMetrics();
    const cacheStats = cachingService.getStats();

    res.json({
      timestamp: new Date().toISOString(),
      scraping: metrics,
      cache: cacheStats,
    });
  } catch (error) {
    console.error("Metrics retrieval error:", error);
    res.status(500).json({
      error: "MetricsError",
      message: "Failed to retrieve metrics",
      statusCode: 500,
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /api/monitoring/metrics/:sourceId - Metrics for specific source
router.get("/metrics/:sourceId", async (req: Request, res: Response) => {
  try {
    const { sourceId } = req.params;

    if (!sourceId) {
      return res.status(400).json({
        error: "BadRequest",
        message: "Source ID is required",
        statusCode: 400,
        timestamp: new Date().toISOString(),
      });
    }

    const metrics = await monitoringService.getSourceMetrics(sourceId);

    if (!metrics) {
      return res.status(404).json({
        error: "SourceNotFound",
        message: `No metrics found for source ${sourceId}`,
        statusCode: 404,
        timestamp: new Date().toISOString(),
      });
    }

    return res.json({
      timestamp: new Date().toISOString(),
      sourceId,
      metrics,
    });
  } catch (error) {
    console.error("Source metrics error:", error);
    return res.status(500).json({
      error: "SourceMetricsError",
      message: "Failed to retrieve source metrics",
      statusCode: 500,
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /api/monitoring/alerts - All active alerts
router.get("/alerts", async (_req: Request, res: Response) => {
  try {
    const alerts = await monitoringService.getActiveAlerts();

    return res.json({
      timestamp: new Date().toISOString(),
      alerts,
      count: alerts.length,
    });
  } catch (error) {
    console.error("Alerts retrieval error:", error);
    return res.status(500).json({
      error: "AlertsError",
      message: "Failed to retrieve alerts",
      statusCode: 500,
      timestamp: new Date().toISOString(),
    });
  }
});

// POST /api/monitoring/alerts/:alertId/acknowledge - Acknowledge an alert
router.post(
  "/alerts/:alertId/acknowledge",
  async (req: Request, res: Response) => {
    try {
      const { alertId } = req.params;
      const { acknowledgedBy } = req.body;

      if (!alertId) {
        return res.status(400).json({
          error: "BadRequest",
          message: "Alert ID is required",
          statusCode: 400,
          timestamp: new Date().toISOString(),
        });
      }

      if (!acknowledgedBy) {
        return res.status(400).json({
          error: "MissingParameter",
          message: "acknowledgedBy is required",
          statusCode: 400,
          timestamp: new Date().toISOString(),
        });
      }

      const success = await monitoringService.acknowledgeAlert(
        alertId,
        acknowledgedBy
      );

      if (!success) {
        return res.status(404).json({
          error: "AlertNotFound",
          message: `Alert ${alertId} not found`,
          statusCode: 404,
          timestamp: new Date().toISOString(),
        });
      }

      return res.json({
        message: "Alert acknowledged successfully",
        alertId,
        acknowledgedBy,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Alert acknowledgement error:", error);
      return res.status(500).json({
        error: "AlertAcknowledgementError",
        message: "Failed to acknowledge alert",
        statusCode: 500,
        timestamp: new Date().toISOString(),
      });
    }
  }
);

// GET /api/monitoring/cache - Cache information and statistics
router.get("/cache", async (_req: Request, res: Response) => {
  try {
    const stats = cachingService.getStats();
    const keys = await cachingService.getKeys();

    return res.json({
      timestamp: new Date().toISOString(),
      stats,
      totalKeys: keys.length,
      sampleKeys: keys.slice(0, 10), // Show first 10 keys as sample
    });
  } catch (error) {
    console.error("Cache info error:", error);
    return res.status(500).json({
      error: "CacheInfoError",
      message: "Failed to retrieve cache information",
      statusCode: 500,
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /api/monitoring/cache/:key - Detailed cache item information
router.get("/cache/:key", async (req: Request, res: Response) => {
  try {
    const { key } = req.params;

    if (!key) {
      return res.status(400).json({
        error: "BadRequest",
        message: "Cache key is required",
        statusCode: 400,
        timestamp: new Date().toISOString(),
      });
    }

    const itemInfo = await cachingService.getItemInfo(key);

    if (!itemInfo) {
      return res.status(404).json({
        error: "CacheItemNotFound",
        message: `Cache item ${key} not found`,
        statusCode: 404,
        timestamp: new Date().toISOString(),
      });
    }

    return res.json({
      timestamp: new Date().toISOString(),
      key,
      itemInfo,
    });
  } catch (error) {
    console.error("Cache item info error:", error);
    return res.status(500).json({
      error: "CacheItemInfoError",
      message: "Failed to retrieve cache item information",
      statusCode: 500,
      timestamp: new Date().toISOString(),
    });
  }
});

// DELETE /api/monitoring/cache/:key - Remove specific cache item
router.delete("/cache/:key", async (req: Request, res: Response) => {
  try {
    const { key } = req.params;

    if (!key) {
      return res.status(400).json({
        error: "BadRequest",
        message: "Cache key is required",
        statusCode: 400,
        timestamp: new Date().toISOString(),
      });
    }

    const success = await cachingService.invalidate(key);

    if (!success) {
      return res.status(404).json({
        error: "CacheItemNotFound",
        message: `Cache item ${key} not found or could not be removed`,
        statusCode: 404,
        timestamp: new Date().toISOString(),
      });
    }

    return res.json({
      message: "Cache item removed successfully",
      key,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Cache item removal error:", error);
    return res.status(500).json({
      error: "CacheItemRemovalError",
      message: "Failed to remove cache item",
      statusCode: 500,
      timestamp: new Date().toISOString(),
    });
  }
});

// POST /api/monitoring/cache/clear - Clear all cache
router.post("/cache/clear", async (_req: Request, res: Response) => {
  try {
    const success = await cachingService.clearAll();

    if (!success) {
      return res.status(500).json({
        error: "CacheClearError",
        message: "Failed to clear cache",
        statusCode: 500,
        timestamp: new Date().toISOString(),
      });
    }

    return res.json({
      message: "Cache cleared successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Cache clear error:", error);
    return res.status(500).json({
      error: "CacheClearError",
      message: "Failed to clear cache",
      statusCode: 500,
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /api/monitoring/redis - Redis connection health
router.get("/redis", async (_req: Request, res: Response) => {
  try {
    const redisHealth = await checkRedisHealth();

    return res.json({
      timestamp: new Date().toISOString(),
      redis: redisHealth,
    });
  } catch (error) {
    console.error("Redis health check error:", error);
    return res.status(500).json({
      error: "RedisHealthError",
      message: "Failed to check Redis health",
      statusCode: 500,
      timestamp: new Date().toISOString(),
    });
  }
});

// Fast Redis health check (lightweight)
async function checkRedisHealthFast(): Promise<{
  status: string;
  connected: boolean;
}> {
  const redis = getRedis();

  if (!redis) {
    return {
      status: "disconnected",
      connected: false,
    };
  }

  try {
    // Only ping, no heavy operations
    await redis.ping();
    return {
      status: "connected",
      connected: true,
    };
  } catch (error) {
    return {
      status: "error",
      connected: false,
    };
  }
}

// Helper function to check Redis health
async function checkRedisHealth(): Promise<{
  status: string;
  connected: boolean;
  latency: number;
  memory: any;
  info: any;
}> {
  const redis = getRedis();

  if (!redis) {
    return {
      status: "disconnected",
      connected: false,
      latency: 0,
      memory: null,
      info: null,
    };
  }

  try {
    const startTime = Date.now();
    await redis.ping();
    const latency = Date.now() - startTime;

    // Note: redis.memory() might not be available in all Redis clients
    let memory = null;
    try {
      memory = await (redis as any).memory("USAGE");
    } catch {
      // Memory command not available, skip it
    }
    const info = await redis.info();

    return {
      status: "connected",
      connected: true,
      latency,
      memory,
      info: info
        ? info.split("\r\n").reduce((acc: any, line: string) => {
            const [key, value] = line.split(":");
            if (key && value) {
              acc[key] = value;
            }
            return acc;
          }, {})
        : null,
    };
  } catch (error) {
    return {
      status: "error",
      connected: false,
      latency: 0,
      memory: null,
      info: null,
    };
  }
}

// Helper function to determine overall system status
function determineOverallStatus(systemHealth: any, redisHealth: any): string {
  if (
    systemHealth.overallStatus === "critical" ||
    redisHealth.status === "error"
  ) {
    return "critical";
  } else if (
    systemHealth.overallStatus === "warning" ||
    redisHealth.status === "disconnected"
  ) {
    return "warning";
  } else if (systemHealth.overallStatus === "unknown") {
    return "unknown";
  }
  return "healthy";
}

export { router as monitoringRouter };
