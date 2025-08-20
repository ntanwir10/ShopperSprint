// Lightweight shared WebSocket client for real-time updates

let socket: WebSocket | null = null;
let isConnecting = false;
let reconnectAttempts = 0;
let reconnectTimeout: NodeJS.Timeout | null = null;
const listeners = new Set<(event: MessageEvent) => void>();
const MAX_RECONNECT_ATTEMPTS = 5;
const INITIAL_RECONNECT_DELAY = 2000;

function getWsUrl(): string {
  const backendUrl =
    import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
  const wsBase = backendUrl.replace(/^http/, 'ws');
  return `${wsBase}/ws`; // adjust if a dedicated path is used
}

function scheduleReconnect() {
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
  }

  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    console.log('Max reconnection attempts reached. Stopping reconnection.');
    return;
  }

  // Exponential backoff with jitter
  const delay =
    INITIAL_RECONNECT_DELAY * Math.pow(2, reconnectAttempts) +
    Math.random() * 1000;

  reconnectTimeout = setTimeout(() => {
    reconnectAttempts++;
    console.log(
      `WebSocket reconnection attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}`
    );
    connectWebSocket();
  }, delay);
}

export function connectWebSocket() {
  if (socket || isConnecting) return;
  isConnecting = true;

  try {
    const url = getWsUrl();
    const ws = new WebSocket(url);
    socket = ws;

    ws.onopen = () => {
      isConnecting = false;
      reconnectAttempts = 0; // Reset on successful connection
      console.log('WebSocket connected successfully');
    };

    ws.onmessage = (evt) => {
      listeners.forEach((cb) => cb(evt));
    };

    ws.onclose = (event) => {
      socket = null;
      isConnecting = false;

      // Only attempt reconnection in dev mode and if not a normal closure
      if (import.meta.env.DEV && event.code !== 1000) {
        console.log(
          `WebSocket closed with code ${event.code}. Scheduling reconnection...`
        );
        scheduleReconnect();
      } else {
        console.log('WebSocket connection closed');
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      // Error handling is done in onclose
    };
  } catch (error) {
    console.error('Failed to create WebSocket connection:', error);
    isConnecting = false;
    if (import.meta.env.DEV) {
      scheduleReconnect();
    }
  }
}

export function subscribe(handler: (event: MessageEvent) => void) {
  listeners.add(handler);
  return () => listeners.delete(handler);
}

export function sendJson(data: any) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(data));
  }
}

export function disconnectWebSocket() {
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }

  if (socket) {
    socket.close(1000, 'User disconnected');
    socket = null;
  }

  isConnecting = false;
  reconnectAttempts = 0;
}

export function resetReconnection() {
  reconnectAttempts = 0;
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }
}
