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
  availability: 'in_stock' | 'limited' | 'out_of_stock';
  source: string;
  url: string;
  rating?: number;
  reviewCount?: number;
  image?: string;
  priceChange?: number;
  originalPrice?: number;
  category?: string;
  lastScraped: string;
  slug: string; // SEO-friendly URL slug
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
    return this.request<SearchResponse>('/search', {
      method: 'POST',
      body: JSON.stringify(request),
    });
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
