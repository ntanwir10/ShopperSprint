import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react';

interface WebSocketMessage {
  type: 'price_update' | 'alert_triggered' | 'system_notification';
  data: any;
  timestamp: string;
}

interface WebSocketContextType {
  isConnected: boolean;
  sendMessage: (message: any) => void;
  lastMessage: WebSocketMessage | null;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined
);

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

interface WebSocketProviderProps {
  children: React.ReactNode;
  url?: string;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({
  children,
  url = 'ws://localhost:3001',
}) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    'connecting' | 'connected' | 'disconnected' | 'error'
  >('disconnected');
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [maxReconnectAttempts] = useState(5);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    // Prevent multiple connection attempts
    if (socket && socket.readyState === WebSocket.CONNECTING) {
      return;
    }

    // Check if we've exceeded max reconnection attempts
    if (reconnectAttempts >= maxReconnectAttempts) {
      console.log(
        '🚫 Max reconnection attempts reached, stopping reconnection'
      );
      setConnectionStatus('error');
      return;
    }

    try {
      console.log('🔌 Attempting WebSocket connection to:', url);
      setConnectionStatus('connecting');

      const ws = new WebSocket(url);

      ws.onopen = () => {
        console.log('✅ WebSocket connected successfully');
        setIsConnected(true);
        setConnectionStatus('connected');
        setReconnectAttempts(0); // Reset reconnection attempts on successful connection
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          console.log('📨 WebSocket message received:', message);
          setLastMessage(message);

          // Handle different message types
          switch (message.type) {
            case 'price_update':
              console.log('Price update received:', message.data);
              // Could emit a custom event or update global state
              break;
            case 'alert_triggered':
              console.log('Price alert triggered:', message.data);
              // Show notification to user
              if (
                'Notification' in window &&
                Notification.permission === 'granted'
              ) {
                new Notification('Price Alert!', {
                  body: message.data.message,
                  icon: '/favicon.ico',
                });
              }
              break;
            case 'system_notification':
              console.log('System notification:', message.data);
              break;
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        console.log('🔌 WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        setConnectionStatus('disconnected');

        // Clear any existing reconnect timeout
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }

        // Only attempt to reconnect if we haven't exceeded max attempts
        if (reconnectAttempts < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 10000); // Exponential backoff, max 10s
          console.log(
            `🔄 Attempting to reconnect WebSocket in ${delay}ms... (attempt ${
              reconnectAttempts + 1
            }/${maxReconnectAttempts})`
          );

          reconnectTimeoutRef.current = setTimeout(() => {
            setReconnectAttempts((prev) => prev + 1);
            connect();
          }, delay);
        } else {
          console.log('🚫 Max reconnection attempts reached');
          setConnectionStatus('error');
        }
      };

      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        setConnectionStatus('error');
        setIsConnected(false);
      };

      setSocket(ws);
    } catch (error) {
      console.error('💥 Failed to create WebSocket connection:', error);
      setConnectionStatus('error');
    }
  }, [url, reconnectAttempts, maxReconnectAttempts, socket]);

  const sendMessage = useCallback(
    (message: any) => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(message));
      } else {
        console.warn('WebSocket is not connected');
      }
    },
    [socket]
  );

  useEffect(() => {
    // Temporarily disable WebSocket connection to prevent infinite loop
    // connect();
    console.log('🔌 WebSocket connection temporarily disabled');

    return () => {
      // Clear reconnect timeout on cleanup
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      if (socket) {
        socket.close();
      }
    };
  }, [connect]);

  const value: WebSocketContextType = {
    isConnected,
    sendMessage,
    lastMessage,
    connectionStatus,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};
