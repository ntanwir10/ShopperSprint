import { WebSocketService } from '../websocketService';
import { WebSocketServer, WebSocket } from 'ws';

// Mock ws module
jest.mock('ws');

describe('WebSocketService', () => {
  let webSocketService: WebSocketService;
  let mockServer: any;
  let mockWebSocket: any;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Create mock WebSocket server
    mockServer = {
      on: jest.fn(),
    };

    // Create mock WebSocket
    mockWebSocket = {
      readyState: WebSocket.OPEN,
      on: jest.fn(),
      ping: jest.fn(),
      send: jest.fn(),
      close: jest.fn(),
    };

    // Mock WebSocketServer constructor
    (WebSocketServer as jest.MockedClass<typeof WebSocketServer>).mockImplementation(() => mockServer);

    // Create WebSocketService instance
    webSocketService = new WebSocketService();
  });

  describe('initialize', () => {
    it('should initialize WebSocket server with correct configuration', () => {
      // Arrange
      const mockHttpServer = {};

      // Act
      webSocketService.initialize(mockHttpServer);

      // Assert
      expect(WebSocketServer).toHaveBeenCalledWith({
        server: mockHttpServer,
        maxPayload: 1024 * 1024,
        skipUTF8Validation: false,
      });
      expect(mockServer.on).toHaveBeenCalledWith('connection', expect.any(Function));
      expect(mockServer.on).toHaveBeenCalledWith('error', expect.any(Function));
    });

    it('should set up connection handler', () => {
      // Arrange
      const mockHttpServer = {};

      // Act
      webSocketService.initialize(mockHttpServer);

      // Assert
      const connectionCall = mockServer.on.mock.calls.find(call => call[0] === 'connection');
      expect(connectionCall).toBeDefined();
      expect(connectionCall![1]).toBeInstanceOf(Function);
    });
  });

  describe('client management', () => {
    beforeEach(() => {
      webSocketService.initialize({});
    });

    it('should generate unique client IDs', () => {
      // Act
      const clientId1 = (webSocketService as any).generateClientId();
      const clientId2 = (webSocketService as any).generateClientId();

      // Assert
      expect(clientId1).toMatch(/^client_\d+_[a-z0-9]+$/);
      expect(clientId2).toMatch(/^client_\d+_[a-z0-9]+$/);
      expect(clientId1).not.toBe(clientId2);
    });

    it('should handle client connection and disconnection', () => {
      // Arrange
      const connectionHandler = mockServer.on.mock.calls.find(call => call[0] === 'connection')![1];
      const closeHandler = mockWebSocket.on.mock.calls.find(call => call[0] === 'close')![1];

      // Act - Simulate connection
      connectionHandler(mockWebSocket, {});

      // Assert - Client should be added
      expect((webSocketService as any).clients.size).toBe(1);

      // Act - Simulate disconnection
      closeHandler();

      // Assert - Client should be removed
      expect((webSocketService as any).clients.size).toBe(0);
    });
  });

  describe('message handling', () => {
    beforeEach(() => {
      webSocketService.initialize({});
    });

    it('should handle subscribe message', () => {
      // Arrange
      const connectionHandler = mockServer.on.mock.calls.find(call => call[0] === 'connection')![1];
      const messageHandler = mockWebSocket.on.mock.calls.find(call => call[0] === 'message')![1];
      
      connectionHandler(mockWebSocket, {});
      const clientId = Array.from((webSocketService as any).clients.keys())[0];

      // Act
      messageHandler(JSON.stringify({ type: 'subscribe', searchId: 'test-search' }));

      // Assert
      expect((webSocketService as any).clientSubscriptions.get(clientId)).toContain('test-search');
    });

    it('should handle unsubscribe message', () => {
      // Arrange
      const connectionHandler = mockServer.on.mock.calls.find(call => call[0] === 'connection')![1];
      const messageHandler = mockWebSocket.on.mock.calls.find(call => call[0] === 'message')![1];
      
      connectionHandler(mockWebSocket, {});
      const clientId = Array.from((webSocketService as any).clients.keys())[0];

      // Subscribe first
      messageHandler(JSON.stringify({ type: 'subscribe', searchId: 'test-search' }));
      expect((webSocketService as any).clientSubscriptions.get(clientId)).toContain('test-search');

      // Act - Unsubscribe
      messageHandler(JSON.stringify({ type: 'unsubscribe', searchId: 'test-search' }));

      // Assert
      expect((webSocketService as any).clientSubscriptions.get(clientId)).not.toContain('test-search');
    });

    it('should handle invalid JSON messages', () => {
      // Arrange
      const connectionHandler = mockServer.on.mock.calls.find(call => call[0] === 'connection')![1];
      const messageHandler = mockWebSocket.on.mock.calls.find(call => call[0] === 'message')![1];
      
      connectionHandler(mockWebSocket, {});
      const clientId = Array.from((webSocketService as any).clients.keys())[0];

      // Act
      messageHandler('invalid json');

      // Assert
      expect(mockWebSocket.send).toHaveBeenCalledWith(JSON.stringify({
        type: 'error',
        data: { message: 'Invalid message format' },
        timestamp: expect.any(String),
      }));
    });
  });

  describe('broadcasting', () => {
    beforeEach(() => {
      webSocketService.initialize({});
    });

    it('should broadcast to all clients', () => {
      // Arrange
      const connectionHandler = mockServer.on.mock.calls.find(call => call[0] === 'connection')![1];
      connectionHandler(mockWebSocket, {});
      
      const message = {
        type: 'price_update' as const,
        data: { productId: 'test', price: 100 },
        timestamp: new Date(),
      };

      // Act
      webSocketService.broadcastToAll(message);

      // Assert
      expect(mockWebSocket.send).toHaveBeenCalledWith(JSON.stringify(message));
    });

    it('should broadcast to specific search subscribers', () => {
      // Arrange
      const connectionHandler = mockServer.on.mock.calls.find(call => call[0] === 'connection')![1];
      const messageHandler = mockWebSocket.on.mock.calls.find(call => call[0] === 'message')![1];
      
      connectionHandler(mockWebSocket, {});
      const clientId = Array.from((webSocketService as any).clients.keys())[0];

      // Subscribe to search
      messageHandler(JSON.stringify({ type: 'subscribe', searchId: 'test-search' }));

      const message = {
        type: 'search_complete' as const,
        data: { searchId: 'test-search', results: [] },
        timestamp: new Date(),
      };

      // Act
      webSocketService.broadcastToSearch('test-search', message);

      // Assert
      expect(mockWebSocket.send).toHaveBeenCalledWith(JSON.stringify(message));
    });
  });

  describe('error handling', () => {
    beforeEach(() => {
      webSocketService.initialize({});
    });

    it('should handle WebSocket errors gracefully', () => {
      // Arrange
      const connectionHandler = mockServer.on.mock.calls.find(call => call[0] === 'connection')![1];
      const errorHandler = mockWebSocket.on.mock.calls.find(call => call[0] === 'error')![1];
      
      connectionHandler(mockWebSocket, {});
      const initialClientCount = (webSocketService as any).clients.size;

      // Act
      errorHandler(new Error('WebSocket error'));

      // Assert
      expect((webSocketService as any).clients.size).toBe(initialClientCount - 1);
    });

    it('should handle server errors', () => {
      // Arrange
      const errorHandler = mockServer.on.mock.calls.find(call => call[0] === 'error')![1];

      // Act & Assert - Should not throw
      expect(() => errorHandler(new Error('Server error'))).not.toThrow();
    });
  });

  describe('cleanup', () => {
    it('should close all connections on cleanup', () => {
      // Arrange
      webSocketService.initialize({});
      const connectionHandler = mockServer.on.mock.calls.find(call => call[0] === 'connection')![1];
      connectionHandler(mockWebSocket, {});

      // Act
      webSocketService.cleanup();

      // Assert
      expect(mockWebSocket.close).toHaveBeenCalled();
      expect((webSocketService as any).clients.size).toBe(0);
    });
  });
});
