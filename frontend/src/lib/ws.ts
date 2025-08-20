// Lightweight shared WebSocket client for real-time updates

let socket: WebSocket | null = null;
let isConnecting = false;
const listeners = new Set<(event: MessageEvent) => void>();

function getWsUrl(): string {
  const backendUrl =
    import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
  const wsBase = backendUrl.replace(/^http/, 'ws');
  return `${wsBase}/ws`; // adjust if a dedicated path is used
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
    };

    ws.onmessage = (evt) => {
      listeners.forEach((cb) => cb(evt));
    };

    ws.onclose = () => {
      socket = null;
      isConnecting = false;
      // simple reconnect after delay in dev
      if (import.meta.env.DEV) setTimeout(connectWebSocket, 2000);
    };

    ws.onerror = () => {
      // handled by onclose
    };
  } catch {
    isConnecting = false;
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
