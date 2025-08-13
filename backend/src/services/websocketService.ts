import { WebSocketServer, WebSocket } from "ws";

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
  type: "price_update" | "search_complete" | "error" | "ping" | "price_alert";
  data?: any;
  timestamp: Date;
}

export class WebSocketService {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, WebSocket> = new Map();
  private clientSubscriptions: Map<string, Set<string>> = new Map(); // clientId -> Set of searchIds

  constructor() {}

  initialize(server: any) {
    this.wss = new WebSocketServer({
      server,
      // Add connection limits and timeouts
      maxPayload: 1024 * 1024, // 1MB max message size
      skipUTF8Validation: false,
    });

    this.wss.on("connection", (ws: WebSocket, _request: any) => {
      const clientId = this.generateClientId();
      this.clients.set(clientId, ws);

      logger.info(`WebSocket client connected: ${clientId}`);

      // Send welcome message
      this.sendToClient(clientId, {
        type: "ping",
        data: { message: "Connected to PricePulse WebSocket" },
        timestamp: new Date(),
      });

      // Set up ping/pong to keep connection alive
      const pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.ping();
        }
      }, 30000); // Send ping every 30 seconds

      ws.on("message", (message: string) => {
        try {
          const parsedMessage = JSON.parse(message);
          this.handleMessage(clientId, parsedMessage);
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

  private handleMessage(clientId: string, message: any) {
    switch (message.type) {
      case "subscribe":
        this.handleSubscribe(clientId, message.searchId);
        break;
      case "unsubscribe":
        this.handleUnsubscribe(clientId, message.searchId);
        break;
      case "ping":
        this.sendToClient(clientId, {
          type: "ping",
          data: { message: "pong" },
          timestamp: new Date(),
        });
        break;
      default:
        logger.warn(
          `Unknown message type from client ${clientId}:`,
          message.type
        );
    }
  }

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

  private handleClientDisconnect(clientId: string) {
    this.clients.delete(clientId);
    this.clientSubscriptions.delete(clientId);
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
  broadcastPriceUpdate(searchId: string, priceData: any) {
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

  broadcastSearchComplete(searchId: string, results: any) {
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

  broadcastToAll(message: WebSocketMessage) {
    this.clients.forEach((_client, clientId) => {
      this.sendToClient(clientId, message);
    });
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
}
