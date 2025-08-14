export interface ProductionConfig {
  scraping: {
    enabled: boolean;
    maxConcurrentScrapes: number;
    rateLimitDelay: number;
    timeout: number;
    retryAttempts: number;
    userAgentRotation: boolean;
    proxyRotation: boolean;
    stealthMode: boolean;
  };
  caching: {
    enabled: boolean;
    defaultTTL: number;
    maxCacheSize: number;
    cleanupInterval: number;
  };
  monitoring: {
    enabled: boolean;
    healthCheckInterval: number;
    alertThresholds: {
      successRate: number;
      responseTime: number;
      errorCount: number;
    };
    metricsRetention: number;
  };
  security: {
    rateLimiting: {
      enabled: boolean;
      windowMs: number;
      maxRequests: number;
    };
    cors: {
      allowedOrigins: string[];
      credentials: boolean;
    };
    helmet: {
      enabled: boolean;
      contentSecurityPolicy: boolean;
    };
  };
  database: {
    connectionPool: {
      min: number;
      max: number;
      acquireTimeoutMillis: number;
      createTimeoutMillis: number;
      destroyTimeoutMillis: number;
      idleTimeoutMillis: number;
      reapIntervalMillis: number;
    };
  };
  redis: {
    connectionPool: {
      min: number;
      max: number;
      acquireTimeoutMillis: number;
      createTimeoutMillis: number;
      destroyTimeoutMillis: number;
      idleTimeoutMillis: number;
      reapIntervalMillis: number;
    };
    retryStrategy: {
      retries: number;
      factor: number;
      minDelay: number;
      maxDelay: number;
    };
  };
  logging: {
    level: "error" | "warn" | "info" | "debug";
    format: "json" | "simple";
    destination: "console" | "file" | "both";
    filePath?: string;
    maxSize: string;
    maxFiles: number;
  };
  performance: {
    compression: boolean;
    responseTimeLimit: number;
    maxPayloadSize: string;
    keepAlive: boolean;
    keepAliveTimeout: number;
  };
}

export const productionConfig: ProductionConfig = {
  scraping: {
    enabled: true,
    maxConcurrentScrapes: 3, // Limit concurrent scraping to avoid overwhelming sources
    rateLimitDelay: 2000, // 2 seconds between requests
    timeout: 30000, // 30 seconds timeout for scraping
    retryAttempts: 3,
    userAgentRotation: true,
    proxyRotation: false, // Enable if you have proxy infrastructure
    stealthMode: true,
  },
  caching: {
    enabled: true,
    defaultTTL: 900, // 15 minutes
    maxCacheSize: 1000, // Maximum 1000 cached items
    cleanupInterval: 5 * 60 * 1000, // Clean up every 5 minutes
  },
  monitoring: {
    enabled: true,
    healthCheckInterval: 5 * 60 * 1000, // Check health every 5 minutes
    alertThresholds: {
      successRate: 80, // Alert if success rate drops below 80%
      responseTime: 10000, // Alert if response time exceeds 10 seconds
      errorCount: 5, // Alert if more than 5 consecutive errors
    },
    metricsRetention: 24 * 60 * 60 * 1000, // Keep metrics for 24 hours
  },
  security: {
    rateLimiting: {
      enabled: true,
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 100, // Maximum 100 requests per window
    },
    cors: {
      allowedOrigins: [
        process.env["FRONTEND_URL"] || "http://localhost:5173",
        "https://yourdomain.com", // Add your production domain
      ],
      credentials: true,
    },
    helmet: {
      enabled: true,
      contentSecurityPolicy: true,
    },
  },
  database: {
    connectionPool: {
      min: 2,
      max: 10,
      acquireTimeoutMillis: 30000,
      createTimeoutMillis: 30000,
      destroyTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
      reapIntervalMillis: 1000,
    },
  },
  redis: {
    connectionPool: {
      min: 2,
      max: 10,
      acquireTimeoutMillis: 30000,
      createTimeoutMillis: 30000,
      destroyTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
      reapIntervalMillis: 1000,
    },
    retryStrategy: {
      retries: 3,
      factor: 2,
      minDelay: 1000,
      maxDelay: 10000,
    },
  },
  logging: {
    level: "info", // Use 'info' in production, 'debug' in development
    format: "json",
    destination: "both",
    filePath: "/var/log/price-tracker/app.log",
    maxSize: "10m",
    maxFiles: 5,
  },
  performance: {
    compression: true,
    responseTimeLimit: 30000, // 30 seconds
    maxPayloadSize: "10mb",
    keepAlive: true,
    keepAliveTimeout: 65000,
  },
};

// Environment-specific overrides
export function getConfig(): ProductionConfig {
  const config = { ...productionConfig };

  // Override based on environment variables
  if (process.env["SCRAPING_ENABLED"] === "false") {
    config.scraping.enabled = false;
  }

  if (process.env["CACHING_ENABLED"] === "false") {
    config.caching.enabled = false;
  }

  if (process.env["MONITORING_ENABLED"] === "false") {
    config.monitoring.enabled = false;
  }

  if (process.env["RATE_LIMIT_DISABLED"] === "true") {
    config.security.rateLimiting.enabled = false;
  }

  if (process.env["LOG_LEVEL"]) {
    config.logging.level = process.env["LOG_LEVEL"] as any;
  }

  if (process.env["CACHE_TTL"]) {
    config.caching.defaultTTL = parseInt(process.env["CACHE_TTL"]);
  }

  if (process.env["MAX_CONCURRENT_SCRAPES"]) {
    config.scraping.maxConcurrentScrapes = parseInt(
      process.env["MAX_CONCURRENT_SCRAPES"]
    );
  }

  return config;
}

// Validation function
export function validateConfig(config: ProductionConfig): string[] {
  const errors: string[] = [];

  if (config.scraping.maxConcurrentScrapes < 1) {
    errors.push("maxConcurrentScrapes must be at least 1");
  }

  if (config.scraping.rateLimitDelay < 1000) {
    errors.push("rateLimitDelay must be at least 1000ms");
  }

  if (config.caching.defaultTTL < 60) {
    errors.push("defaultTTL must be at least 60 seconds");
  }

  if (
    config.monitoring.alertThresholds.successRate < 0 ||
    config.monitoring.alertThresholds.successRate > 100
  ) {
    errors.push("successRate threshold must be between 0 and 100");
  }

  if (config.security.rateLimiting.maxRequests < 1) {
    errors.push("maxRequests must be at least 1");
  }

  return errors;
}
