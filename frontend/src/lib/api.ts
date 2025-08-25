// API configuration and utilities
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// API endpoints
export const API_ENDPOINTS = {
  waitlist: {
    subscribe: `${API_BASE_URL}/api/waitlist/subscribe`,
    stats: `${API_BASE_URL}/api/waitlist/stats`,
    unsubscribe: `${API_BASE_URL}/api/waitlist/unsubscribe`,
  },
  search: `${API_BASE_URL}/api/search`,
  health: `${API_BASE_URL}/api/health`,
} as const;

// Generic API request function
export async function apiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// Waitlist API functions
export const waitlistAPI = {
  async subscribe(email: string, source: string = 'coming_soon_page') {
    return apiRequest(API_ENDPOINTS.waitlist.subscribe, {
      method: 'POST',
      body: JSON.stringify({ email, source }),
    });
  },

  async getStats() {
    return apiRequest(API_ENDPOINTS.waitlist.stats);
  },

  async unsubscribe(token: string) {
    return apiRequest(API_ENDPOINTS.waitlist.unsubscribe, {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  },
};

// Search API function
export const searchAPI = {
  async search(query: string) {
    const params = new URLSearchParams({ q: query });
    return apiRequest(`${API_ENDPOINTS.search}?${params}`);
  },
};

// Health check API function
export const healthAPI = {
  async check() {
    return apiRequest(API_ENDPOINTS.health);
  },
};
