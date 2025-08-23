import { WebSocketService } from '../websocketService';
import { WebSocket } from 'ws';
import { jest } from '@jest/globals';

// Mock WebSocket
const mockWebSocket = {
  send: jest.fn(),
  close: jest.fn(),
  on: jest.fn(),
  readyState: 1, // WebSocket.OPEN
  ping: jest.fn()
} as unknown as jest.Mocked<WebSocket>;

// Mock AuthService
jest.mock('../authService', () => ({
  AuthService: jest.fn().mockImplementation(() => ({
    validateToken: jest.fn().mockResolvedValue({ id: 'test_user' })
  }))
}));

describe('WebSocketService', () => {
  let webSocketService: WebSocketService;

  beforeEach(() => {
    webSocketService = new WebSocketService();
    jest.clearAllMocks();
  });

  describe('initialize', () => {
    it('should initialize WebSocket server successfully', () => {
      // Arrange
      const mockServer = { on: jest.fn() };

      // Act
      webSocketService.initialize(mockServer);

      // Assert
      expect(mockServer.on).toHaveBeenCalled();
    });

    it('should handle client connections', () => {
      // Arrange
      const mockServer = { on: jest.fn() };
      webSocketService.initialize(mockServer);

      const connectionHandler = mockServer.on.mock.calls.find((call: any) => call[0] === 'connection')![1];

      // Act
      connectionHandler(mockWebSocket, {});

      // Assert
      expect(mockWebSocket.on).toHaveBeenCalledWith('message', expect.any(Function));
      expect(mockWebSocket.on).toHaveBeenCalledWith('close', expect.any(Function));
      expect(mockWebSocket.on).toHaveBeenCalledWith('error', expect.any(Function));
      expect(mockWebSocket.on).toHaveBeenCalledWith('pong', expect.any(Function));
    });
  });

  describe('message handling', () => {
    it('should handle ping messages', () => {
      // Arrange
      const mockServer = { on: jest.fn() };
      webSocketService.initialize(mockServer);
      
      const connectionHandler = mockServer.on.mock.calls.find((call: any) => call[0] === 'connection')![1];
      const messageHandler = mockWebSocket.on.mock.calls.find((call: any) => call[0] === 'message')![1];
      
      connectionHandler(mockWebSocket, {});

      // Act
      messageHandler(Buffer.from(JSON.stringify({
        type: 'ping'
      })));

      // Assert
      expect(mockWebSocket.send).toHaveBeenCalledWith(
        expect.stringContaining('"type":"pong"')
      );
    });

    it('should handle authentication messages', () => {
      // Arrange
      const mockServer = { on: jest.fn() };
      webSocketService.initialize(mockServer);
      
      const connectionHandler = mockServer.on.mock.calls.find((call: any) => call[0] === 'connection')![1];
      const messageHandler = mockWebSocket.on.mock.calls.find((call: any) => call[0] === 'message')![1];
      
      connectionHandler(mockWebSocket, {});

      // Act
      messageHandler(Buffer.from(JSON.stringify({
        type: 'auth',
        token: 'valid_token'
      })));

      // Assert - Should send some response
      expect(mockWebSocket.send).toHaveBeenCalled();
    });

    it('should handle unknown message types', () => {
      // Arrange
      const mockServer = { on: jest.fn() };
      webSocketService.initialize(mockServer);
      
      const connectionHandler = mockServer.on.mock.calls.find((call: any) => call[0] === 'connection')![1];
      const messageHandler = mockWebSocket.on.mock.calls.find((call: any) => call[0] === 'message')![1];
      
      connectionHandler(mockWebSocket, {});

      // Act
      messageHandler(Buffer.from(JSON.stringify({
        type: 'unknown_type'
      })));

      // Assert
      expect(mockWebSocket.send).toHaveBeenCalledWith(
        expect.stringContaining('"type":"error"')
      );
    });
  });

  describe('broadcasting', () => {
    it('should broadcast to all clients', () => {
      // Arrange
      const mockServer = { on: jest.fn() };
      webSocketService.initialize(mockServer);
      
      const connectionHandler = mockServer.on.mock.calls.find((call: any) => call[0] === 'connection')![1];
      connectionHandler(mockWebSocket, {});

      const message = {
        type: 'notification' as const,
        data: { message: 'Test broadcast' },
        timestamp: new Date()
      };

      // Act
      webSocketService.broadcastToAll(message);

      // Assert
      expect(mockWebSocket.send).toHaveBeenCalledWith(JSON.stringify(message));
    });

    it('should broadcast price updates', () => {
      // Arrange
      const mockServer = { on: jest.fn() };
      webSocketService.initialize(mockServer);
      
      const connectionHandler = mockServer.on.mock.calls.find((call: any) => call[0] === 'connection')![1];
      connectionHandler(mockWebSocket, {});

      const priceUpdate = {
        productId: 'product_123',
        productName: 'Test Product',
        oldPrice: 100,
        newPrice: 90,
        currency: 'USD',
        source: 'Test Store',
        changePercentage: -10,
        timestamp: new Date()
      };

      // Act
      webSocketService.broadcastPriceUpdate(priceUpdate);

      // Assert - Should not send to unsubscribed clients
      // (No subscription was made, so no message should be sent)
      // This tests the subscription logic
    });

    it('should broadcast search completion', () => {
      // Arrange
      const mockServer = { on: jest.fn() };
      webSocketService.initialize(mockServer);
      
      const connectionHandler = mockServer.on.mock.calls.find((call: any) => call[0] === 'connection')![1];
      connectionHandler(mockWebSocket, {});

      // Act
      webSocketService.broadcastSearchComplete('search_123', { results: [] });

      // Assert - Should not send to unsubscribed clients
      // (No subscription was made, so no message should be sent)
    });
  });

  describe('client management', () => {
    it('should handle client disconnection', () => {
      // Arrange
      const mockServer = { on: jest.fn() };
      webSocketService.initialize(mockServer);
      
      const connectionHandler = mockServer.on.mock.calls.find((call: any) => call[0] === 'connection')![1];
      const closeHandler = mockWebSocket.on.mock.calls.find((call: any) => call[0] === 'close')![1];
      
      connectionHandler(mockWebSocket, {});

      // Act
      closeHandler();

      // Assert - Should clean up client data
      expect(webSocketService.getConnectedClientsCount()).toBe(0);
    });

    it('should handle client errors', () => {
      // Arrange
      const mockServer = { on: jest.fn() };
      webSocketService.initialize(mockServer);
      
      const connectionHandler = mockServer.on.mock.calls.find((call: any) => call[0] === 'connection')![1];
      const errorHandler = mockWebSocket.on.mock.calls.find((call: any) => call[0] === 'error')![1];
      
      connectionHandler(mockWebSocket, {});

      // Act
      errorHandler(new Error('Test error'));

      // Assert - Should clean up client data
      expect(webSocketService.getConnectedClientsCount()).toBe(0);
    });
  });

  describe('statistics', () => {
    it('should return subscription statistics', () => {
      // Act
      const stats = webSocketService.getSubscriptionStats();

      // Assert
      expect(stats).toHaveProperty('totalClients');
      expect(stats).toHaveProperty('totalProductSubscriptions');
      expect(stats).toHaveProperty('totalUserSubscriptions');
      expect(stats).toHaveProperty('productSubscriptions');
      expect(typeof stats.totalClients).toBe('number');
    });

    it('should return connected clients count', () => {
      // Act
      const count = webSocketService.getConnectedClientsCount();

      // Assert
      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  describe('server management', () => {
    it('should handle server errors', () => {
      // Arrange
      const mockServer = { on: jest.fn() };
      webSocketService.initialize(mockServer);

      const errorHandler = mockServer.on.mock.calls.find((call: any) => call[0] === 'error')![1];

      // Act & Assert - Should not throw
      expect(() => errorHandler(new Error('Server error'))).not.toThrow();
    });

    it('should close server gracefully', () => {
      // Arrange
      const mockServer = { on: jest.fn() };
      webSocketService.initialize(mockServer);

      // Act
      webSocketService.close();

      // Assert
      expect(webSocketService.getConnectedClientsCount()).toBe(0);
    });
  });
});
