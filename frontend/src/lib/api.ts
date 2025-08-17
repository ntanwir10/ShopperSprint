// API client configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

// API response types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  statusCode?: number;
  timestamp?: string;
}

export interface SearchRequest {
  query: string;
  maxResults?: number;
  sources?: string[];
}

export interface SearchResponse {
  searchId: string;
  results: Product[];
  metadata: {
    totalSources: number;
    successfulSources: number;
    searchDuration: number;
    cacheHit: boolean;
  };
}

export interface Product {
  id: string;
  name: string;
  price: number;
  currency: string;
  availability: 'in_stock' | 'out_of_stock' | 'limited' | 'unknown';
  source: string;
  imageUrl?: string;
  image?: string;
  rating?: number;
  reviewCount?: number;
  url: string;
  lastScraped: string;
  category?: string;
  slug?: string;
}

export interface PriceHistoryPoint {
  date: string;
  price: number;
  currency: string;
}

// Authentication types
export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  role: 'user' | 'admin' | 'moderator';
  isActive: boolean;
  emailVerified: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  message?: string;
}

export interface PriceAlert {
  id: string;
  userId: string;
  productId: string;
  targetPrice: number;
  currency: string;
  isActive: boolean;
  alertType: string;
  threshold?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePriceAlertRequest {
  productId: string;
  targetPrice: number;
  currency?: string;
  alertType?: string;
  threshold?: number;
}

// API client class
class ApiClient {
  private baseUrl: string;
  private backendUrl: string;

  constructor(
    baseUrl: string = API_BASE_URL,
    backendUrl: string = BACKEND_URL
  ) {
    this.baseUrl = baseUrl;
    this.backendUrl = backendUrl;
  }

  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('auth_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    baseUrl: string = this.baseUrl
  ): Promise<ApiResponse<T>> {
    const url = `${baseUrl}${endpoint}`;

    // Log the request for debugging
    console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`, {
      body: options.body,
      headers: options.headers,
    });

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
          ...options.headers,
        },
        ...options,
      });

      // Log the response for debugging
      console.log(
        `📡 API Response: ${response.status} ${response.statusText}`,
        {
          url: response.url,
          headers: Object.fromEntries(response.headers.entries()),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ API Error Response:', errorData);

        // Auto-logout and redirect on 401 Unauthorized
        if (response.status === 401) {
          try {
            localStorage.removeItem('auth_token');
          } catch {}
          try {
            const from = `${window.location.pathname}${window.location.search}`;
            const to = `/login${
              from && from !== '/login'
                ? `?from=${encodeURIComponent(from)}`
                : ''
            }`;
            window.location.assign(to);
          } catch {}
        }

        return {
          error:
            errorData.message ||
            `HTTP ${response.status}: ${response.statusText}`,
          statusCode: response.status,
          timestamp: new Date().toISOString(),
        };
      }

      const data = await response.json();
      console.log('✅ API Success Response:', data);

      return { data };
    } catch (error) {
      console.error('💥 API Request Failed:', error);

      return {
        error: error instanceof Error ? error.message : 'Network error',
        statusCode: 0,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Search API
  async search(request: SearchRequest): Promise<ApiResponse<SearchResponse>> {
    return this.request<SearchResponse>(
      '/api/search',
      {
        method: 'POST',
        body: JSON.stringify(request),
      },
      this.backendUrl
    );
  }

  // Authentication APIs
  async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>(
      '/api/auth/login',
      {
        method: 'POST',
        body: JSON.stringify(credentials),
      },
      this.backendUrl
    );
  }

  async register(
    userData: RegisterRequest
  ): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>(
      '/api/auth/register',
      {
        method: 'POST',
        body: JSON.stringify(userData),
      },
      this.backendUrl
    );
  }

  async validateToken(token: string): Promise<ApiResponse<User>> {
    return this.request<User>(
      '/api/auth/verify',
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      },
      this.backendUrl
    );
  }

  async verifyEmail(token: string): Promise<ApiResponse<{ user: User }>> {
    return this.request<{ user: User }>(
      '/api/auth/verify-email',
      {
        method: 'POST',
        body: JSON.stringify({ token }),
      },
      this.backendUrl
    );
  }

  async forgotPassword(
    email: string
  ): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(
      '/api/auth/request-password-reset',
      {
        method: 'POST',
        body: JSON.stringify({ email }),
      },
      this.backendUrl
    );
  }

  async resetPassword(
    token: string,
    newPassword: string
  ): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(
      '/api/auth/reset-password',
      {
        method: 'POST',
        body: JSON.stringify({ token, password: newPassword }),
      },
      this.backendUrl
    );
  }

  async updateProfile(
    updates: Partial<User>
  ): Promise<ApiResponse<{ user: User }>> {
    return this.request<{ user: User }>(
      '/auth/profile',
      {
        method: 'PUT',
        body: JSON.stringify(updates),
      },
      this.backendUrl
    );
  }

  // Price Alerts APIs
  async createPriceAlert(
    alertData: CreatePriceAlertRequest
  ): Promise<ApiResponse<PriceAlert>> {
    return this.request<PriceAlert>(
      '/api/notifications/alerts',
      {
        method: 'POST',
        body: JSON.stringify(alertData),
      },
      this.backendUrl
    );
  }

  async getPriceAlerts(): Promise<ApiResponse<PriceAlert[]>> {
    return this.request<PriceAlert[]>(
      '/api/notifications/alerts',
      {
        method: 'GET',
      },
      this.backendUrl
    );
  }

  async updatePriceAlert(
    alertId: string,
    updates: Partial<PriceAlert>
  ): Promise<ApiResponse<PriceAlert>> {
    return this.request<PriceAlert>(
      `/api/notifications/alerts/${alertId}`,
      {
        method: 'PUT',
        body: JSON.stringify(updates),
      },
      this.backendUrl
    );
  }

  async deletePriceAlert(alertId: string): Promise<ApiResponse<void>> {
    return this.request<void>(
      `/api/notifications/alerts/${alertId}`,
      {
        method: 'DELETE',
      },
      this.backendUrl
    );
  }

  // Price History
  async getPriceHistory(
    productId: string,
    timeRange: string = '30d'
  ): Promise<ApiResponse<PriceHistoryPoint[]>> {
    try {
      const response = await fetch(
        `${this.backendUrl}/api/price-history/${productId}?timeRange=${timeRange}`,
        {
          method: 'GET',
          headers: this.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { data: data.priceHistory || data };
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch price history',
      };
    }
  }

  // Lightweight health check - use ping endpoint
  async ping(): Promise<ApiResponse<any>> {
    return this.request('/ping', {}, this.backendUrl);
  }

  // Health check - use backend URL directly
  async health(): Promise<ApiResponse<any>> {
    return this.request('/health', {}, this.backendUrl);
  }

  // Test API connectivity
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.health();
      return !response.error && response.data?.status === 'OK';
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
