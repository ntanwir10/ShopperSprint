import { WebSocketServer, WebSocket } from "ws";
import { AuthService } from "./authService";

// Simple logger utility
const logger = {
  info: (message: string, ...args: any[]) =>
    console.log(`[INFO] ${message}`, ...args),
  error: (message: string, ...args: any[]) =>
    console.error(`[ERROR] ${message}`, ...args),
  warn: (message: string, ...args: any[]) =>
    console.warn(`[WARN] ${message}`, ...args),
  debug: (message: string, ...args: any[]) =>
    console.debug(`[DEBUG] ${message}`, ...args),
};

export interface WebSocketMessage {
  type:
    | "price_update"
    | "search_complete"
    | "error"
    | "ping"
    | "pong"
    | "price_alert"
    | "product_update"
    | "notification"
    | "subscription_confirmed";
  data?: any;
  timestamp: Date;
  clientId?: string;
}

export interface PriceUpdateMessage {
  productId: string;
  productName: string;
  oldPrice: number;
  newPrice: number;
  currency: string;
  source: string;
  changePercentage: number;
  timestamp: Date;
}

export interface PriceAlertMessage {
  alertId: string;
  productId: string;
  productName: string;
  currentPrice: number;
  targetPrice: number;
  alertType: string;
  message: string;
}

export interface NotificationMessage {
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  actionUrl?: string;
}

interface AuthenticatedClient {
  ws: WebSocket;
  userId: string;
  authenticated: boolean;
  lastActivity: number;
  messageCount: number;
  rateLimit: {
    count: number;
    resetTime: number;
  };
}

export class WebSocketService {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, WebSocket> = new Map();
  private authenticatedClients: Map<string, AuthenticatedClient> = new Map();
  private clientSubscriptions: Map<string, Set<string>> = new Map(); // clientId -> Set of searchIds
  private productSubscriptions: Map<string, Set<string>> = new Map(); // productId -> Set of clientIds
  private userSubscriptions: Map<string, string> = new Map(); // clientId -> userId
  private authService: AuthService;

  // Rate limiting configuration
  private readonly RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
  private readonly MAX_MESSAGES_PER_MINUTE = 100; // Maximum messages per client per minute
  private readonly MAX_PAYLOAD_SIZE = 8 * 1024; // 8KB max message size

  constructor() {
    this.authService = new AuthService();
  }

  initialize(server: any) {
    this.wss = new WebSocketServer({
      server,
      maxPayload: this.MAX_PAYLOAD_SIZE,
      skipUTF8Validation: false,
      verifyClient: (_info: { origin: string; secure: boolean; req: any }) => {
        // Basic connection limit per IP (could be enhanced)
        return true; // For now, allow all connections but require auth after
      },
    });

    this.wss.on("connection", (ws: WebSocket, _request: any) => {
      const clientId = this.generateClientId();

      // Initialize unauthenticated client
      this.clients.set(clientId, ws);
      this.authenticatedClients.set(clientId, {
        ws,
        userId: "",
        authenticated: false,
        lastActivity: Date.now(),
        messageCount: 0,
        rateLimit: {
          count: 0,
          resetTime: Date.now() + this.RATE_LIMIT_WINDOW,
        },
      });

      logger.info(`WebSocket client connected (unauthenticated): ${clientId}`);

      // Send authentication required message
      this.sendToClient(clientId, {
        type: "ping",
        data: {
          message:
            "Connected to ShopperSprint WebSocket. Please authenticate within 30 seconds.",
          requiresAuth: true,
        },
        timestamp: new Date(),
      });

      // Set authentication timeout - allow anonymous connections for public features
      const authTimeout = setTimeout(() => {
        const client = this.authenticatedClients.get(clientId);
        if (client && !client.authenticated) {
          // Instead of disconnecting, mark as anonymous user
          logger.info(
            `Client ${clientId} continuing as anonymous user (no authentication provided)`
          );

          // Update client to anonymous mode
          client.userId = "anonymous";
          client.authenticated = false; // Keep as false to indicate anonymous

          // Send anonymous confirmation
          this.sendToClient(clientId, {
            type: "ping",
            data: {
              message:
                "Connected as anonymous user. Some features may be limited.",
              authenticated: false,
              anonymous: true,
            },
            timestamp: new Date(),
          });
        }
      }, 60000); // Extended to 60 seconds for better UX

      // Set up ping/pong to keep connection alive
      const pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.ping();
        }
      }, 30000); // Send ping every 30 seconds

      ws.on("message", (message: Buffer) => {
        try {
          // Check message size
          if (message.length > this.MAX_PAYLOAD_SIZE) {
            logger.warn(
              `Client ${clientId} sent oversized message: ${message.length} bytes`
            );
            ws.close(1009, "Message too large");
            return;
          }

          // Check rate limiting
          if (!this.checkRateLimit(clientId)) {
            logger.warn(`Client ${clientId} exceeded rate limit`);
            this.sendToClient(clientId, {
              type: "error",
              data: { message: "Rate limit exceeded" },
              timestamp: new Date(),
            });
            return;
          }

          const parsedMessage = JSON.parse(message.toString());
          this.handleMessage(clientId, parsedMessage, authTimeout);
        } catch (error) {
          logger.error(
            `Failed to parse WebSocket message from ${clientId}:`,
            error
          );
          this.sendToClient(clientId, {
            type: "error",
            data: { message: "Invalid message format" },
            timestamp: new Date(),
          });
        }
      });

      ws.on("close", () => {
        clearInterval(pingInterval);
        this.handleClientDisconnect(clientId);
      });

      ws.on("error", (error) => {
        clearInterval(pingInterval);
        logger.error(`WebSocket error for client ${clientId}:`, error);
        this.handleClientDisconnect(clientId);
      });

      ws.on("pong", () => {
        // Client responded to ping, connection is healthy
        logger.debug(`WebSocket client ${clientId} responded to ping`);
      });
    });

    // Handle WebSocket server errors
    this.wss.on("error", (error) => {
      logger.error("WebSocket server error:", error);
    });

    logger.info("WebSocket server initialized");
  }

  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Check rate limiting for WebSocket messages
   */
  private checkRateLimit(clientId: string): boolean {
    const client = this.authenticatedClients.get(clientId);
    if (!client) return false;

    const now = Date.now();

    // Reset rate limit if window has expired
    if (now > client.rateLimit.resetTime) {
      client.rateLimit.count = 0;
      client.rateLimit.resetTime = now + this.RATE_LIMIT_WINDOW;
    }

    // Check if limit exceeded
    if (client.rateLimit.count >= this.MAX_MESSAGES_PER_MINUTE) {
      return false;
    }

    // Increment count
    client.rateLimit.count++;
    client.lastActivity = now;
    client.messageCount++;

    return true;
  }

  /**
   * Authenticate WebSocket client using JWT token
   */
  private async authenticateClient(
    clientId: string,
    token: string
  ): Promise<boolean> {
    try {
      const userProfile = await this.authService.validateToken(token);
      if (!userProfile) {
        return false;
      }

      const client = this.authenticatedClients.get(clientId);
      if (client) {
        client.authenticated = true;
        client.userId = userProfile.id;
        logger.info(
          `Client ${clientId} authenticated as user ${userProfile.id}`
        );
        return true;
      }

      return false;
    } catch (error) {
      logger.error(`Authentication failed for client ${clientId}:`, error);
      return false;
    }
  }

  /**
   * Check if client is authenticated for protected operations
   */
  private isClientAuthenticated(clientId: string): boolean {
    const client = this.authenticatedClients.get(clientId);
    return client?.authenticated || false;
  }

  // Enhanced message handling for real-time features
  private async handleMessage(
    clientId: string,
    message: any,
    authTimeout?: NodeJS.Timeout
  ) {
    switch (message.type) {
      case "auth":
        await this.handleAuthentication(clientId, message.token, authTimeout);
        break;
      case "ping":
        this.sendToClient(clientId, {
          type: "pong",
          data: { timestamp: new Date().toISOString() },
          timestamp: new Date(),
        });
        break;
      case "subscribe":
      case "unsubscribe":
      case "subscribe_product":
      case "unsubscribe_product":
      case "subscribe_user":
      case "unsubscribe_user":
        // Require authentication for all subscription operations
        if (!this.isClientAuthenticated(clientId)) {
          this.sendToClient(clientId, {
            type: "error",
            data: { message: "Authentication required for this operation" },
            timestamp: new Date(),
          });
          return;
        }

        // Handle authenticated operations
        switch (message.type) {
          case "subscribe":
            this.handleSubscribe(clientId, message.searchId);
            break;
          case "unsubscribe":
            this.handleUnsubscribe(clientId, message.searchId);
            break;
          case "subscribe_product":
            this.handleProductSubscription(clientId, message.productId);
            break;
          case "unsubscribe_product":
            this.handleProductUnsubscription(clientId, message.productId);
            break;
          case "subscribe_user":
            this.handleUserSubscription(clientId, message.userId);
            break;
          case "unsubscribe_user":
            this.handleUserUnsubscription(clientId);
            break;
        }
        break;
      default:
        logger.warn(
          `Unknown message type from client ${clientId}: ${message.type}`
        );
        this.sendToClient(clientId, {
          type: "error",
          data: { message: "Unknown message type" },
          timestamp: new Date(),
        });
    }
  }

  /**
   * Handle authentication message
   */
  private async handleAuthentication(
    clientId: string,
    token: string,
    authTimeout?: NodeJS.Timeout
  ) {
    if (!token) {
      this.sendToClient(clientId, {
        type: "error",
        data: { message: "Token required for authentication" },
        timestamp: new Date(),
      });
      return;
    }

    const success = await this.authenticateClient(clientId, token);

    if (success) {
      // Clear auth timeout
      if (authTimeout) {
        clearTimeout(authTimeout);
      }

      this.sendToClient(clientId, {
        type: "ping",
        data: {
          message: "Authentication successful",
          authenticated: true,
        },
        timestamp: new Date(),
      });
    } else {
      this.sendToClient(clientId, {
        type: "error",
        data: { message: "Authentication failed" },
        timestamp: new Date(),
      });

      // Close connection on auth failure
      const client = this.clients.get(clientId);
      if (client) {
        client.close(1008, "Authentication failed");
      }
    }
  }

  // Product subscription management
  private handleProductSubscription(clientId: string, productId: string) {
    if (!this.productSubscriptions.has(productId)) {
      this.productSubscriptions.set(productId, new Set());
    }
    this.productSubscriptions.get(productId)!.add(clientId);

    logger.info(`Client ${clientId} subscribed to product ${productId}`);

    this.sendToClient(clientId, {
      type: "subscription_confirmed",
      data: { productId, message: "Subscribed to product updates" },
      timestamp: new Date(),
    });
  }

  private handleProductUnsubscription(clientId: string, productId: string) {
    const subscriptions = this.productSubscriptions.get(productId);
    if (subscriptions) {
      subscriptions.delete(clientId);
      if (subscriptions.size === 0) {
        this.productSubscriptions.delete(productId);
      }
    }

    logger.info(`Client ${clientId} unsubscribed from product ${productId}`);
  }

  // User subscription management
  private handleUserSubscription(clientId: string, userId: string) {
    this.userSubscriptions.set(clientId, userId);
    logger.info(
      `Client ${clientId} subscribed to user ${userId} notifications`
    );
  }

  private handleUserUnsubscription(clientId: string) {
    this.userSubscriptions.delete(clientId);
    logger.info(`Client ${clientId} unsubscribed from user notifications`);
  }

  private handleClientDisconnect(clientId: string) {
    // Clean up client data
    this.clients.delete(clientId);
    this.authenticatedClients.delete(clientId);
    this.clientSubscriptions.delete(clientId);
    this.userSubscriptions.delete(clientId);

    // Clean up product subscriptions
    this.productSubscriptions.forEach((subscribers, productId) => {
      subscribers.delete(clientId);
      if (subscribers.size === 0) {
        this.productSubscriptions.delete(productId);
      }
    });

    logger.info(`WebSocket client disconnected: ${clientId}`);
  }

  private sendToClient(clientId: string, message: WebSocketMessage) {
    const client = this.clients.get(clientId);
    if (client && client.readyState === WebSocket.OPEN) {
      try {
        client.send(JSON.stringify(message));
      } catch (error) {
        logger.error(`Failed to send message to client ${clientId}:`, error);
        this.handleClientDisconnect(clientId);
      }
    }
  }

  // Public methods for broadcasting messages
  public broadcastPriceUpdate(priceUpdate: PriceUpdateMessage) {
    const productId = priceUpdate.productId;
    const subscribers = this.productSubscriptions.get(productId);

    if (subscribers) {
      const message: WebSocketMessage = {
        type: "price_update",
        data: priceUpdate,
        timestamp: new Date(),
      };

      subscribers.forEach((clientId) => {
        this.sendToClient(clientId, message);
      });

      logger.info(
        `Broadcasted price update for product ${productId} to ${subscribers.size} clients`
      );
    }
  }

  // Price alert broadcasting
  public broadcastPriceAlert(alert: PriceAlertMessage, userId: string) {
    const message: WebSocketMessage = {
      type: "price_alert",
      data: alert,
      timestamp: new Date(),
    };

    // Find all clients subscribed to this user
    this.userSubscriptions.forEach((subscribedUserId, clientId) => {
      if (subscribedUserId === userId) {
        this.sendToClient(clientId, message);
      }
    });

    logger.info(`Broadcasted price alert ${alert.alertId} to user ${userId}`);
  }

  // Notification broadcasting
  public broadcastNotification(
    notification: NotificationMessage,
    userId?: string
  ) {
    const message: WebSocketMessage = {
      type: "notification",
      data: notification,
      timestamp: new Date(),
    };

    if (userId) {
      // Send to specific user
      this.userSubscriptions.forEach((subscribedUserId, clientId) => {
        if (subscribedUserId === userId) {
          this.sendToClient(clientId, message);
        }
      });
    } else {
      // Broadcast to all clients
      this.clients.forEach((_, clientId) => {
        this.sendToClient(clientId, message);
      });
    }
  }

  // Product update broadcasting
  public broadcastProductUpdate(productId: string, updateData: any) {
    const subscribers = this.productSubscriptions.get(productId);

    if (subscribers) {
      const message: WebSocketMessage = {
        type: "product_update",
        data: { productId, ...updateData },
        timestamp: new Date(),
      };

      subscribers.forEach((clientId) => {
        this.sendToClient(clientId, message);
      });

      logger.info(
        `Broadcasted product update for ${productId} to ${subscribers.size} clients`
      );
    }
  }

  // Get subscription statistics
  public getSubscriptionStats() {
    return {
      totalClients: this.clients.size,
      totalProductSubscriptions: this.productSubscriptions.size,
      totalUserSubscriptions: this.userSubscriptions.size,
      productSubscriptions: Object.fromEntries(
        Array.from(this.productSubscriptions.entries()).map(
          ([productId, clients]) => [productId, clients.size]
        )
      ),
    };
  }

  getConnectedClientsCount(): number {
    return this.clients.size;
  }

  close() {
    if (this.wss) {
      this.wss.close();
      this.wss = null;
      this.clients.clear();
      this.clientSubscriptions.clear();
      logger.info("WebSocket server closed");
    }
  }

  // Legacy methods for backward compatibility
  public broadcastSearchComplete(searchId: string, results: any) {
    const message: WebSocketMessage = {
      type: "search_complete",
      data: { searchId, results },
      timestamp: new Date(),
    };

    // Send to all clients subscribed to this search
    this.clientSubscriptions.forEach((subscriptions, clientId) => {
      if (subscriptions.has(searchId)) {
        this.sendToClient(clientId, message);
      }
    });
  }

  public broadcastToAll(message: WebSocketMessage) {
    this.clients.forEach((_client, clientId) => {
      this.sendToClient(clientId, message);
    });
  }

  // Legacy subscription methods
  private handleSubscribe(clientId: string, searchId: string) {
    if (!this.clientSubscriptions.has(clientId)) {
      this.clientSubscriptions.set(clientId, new Set());
    }

    this.clientSubscriptions.get(clientId)!.add(searchId);
    logger.info(`Client ${clientId} subscribed to search ${searchId}`);

    this.sendToClient(clientId, {
      type: "ping",
      data: { message: `Subscribed to search ${searchId}` },
      timestamp: new Date(),
    });
  }

  private handleUnsubscribe(clientId: string, searchId: string) {
    const subscriptions = this.clientSubscriptions.get(clientId);
    if (subscriptions) {
      subscriptions.delete(searchId);
      logger.info(`Client ${clientId} unsubscribed from search ${searchId}`);
    }
  }

  // Legacy price update method
  public broadcastPriceUpdateLegacy(searchId: string, priceData: any) {
    const message: WebSocketMessage = {
      type: "price_update",
      data: { searchId, ...priceData },
      timestamp: new Date(),
    };

    // Send to all clients subscribed to this search
    this.clientSubscriptions.forEach((subscriptions, clientId) => {
      if (subscriptions.has(searchId)) {
        this.sendToClient(clientId, message);
      }
    });
  }
}

// Export a shared singleton instance to be initialized by the HTTP server
export const webSocketService = new WebSocketService();
