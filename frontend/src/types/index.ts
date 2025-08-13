// Core data types for the Product Price Tracker application

export interface Product {
  id: string;
  name: string;
  normalizedName: string;
  category?: string;
  specifications?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductListing {
  id: string;
  productId: string;
  name?: string; // Product name from the listing
  sourceId: string;
  url: string;
  price: number;
  currency: string;
  availability: 'in_stock' | 'out_of_stock' | 'limited' | 'unknown';
  imageUrl?: string;
  rating?: number;
  reviewCount?: number;
  lastScraped: Date | string; // Can be Date or ISO string from API
  isValid: boolean;
}

export interface Search {
  id: string;
  query: string;
  userId?: string;
  results: ProductListing[];
  metadata: SearchMetadata;
  createdAt: Date;
}

export interface SearchMetadata {
  totalSources: number;
  successfulSources: number;
  searchDuration: number;
  cacheHit: boolean;
}

export interface Source {
  id: string;
  name: string;
  category: 'popular' | 'alternative';
  isActive: boolean;
  lastSuccessfulScrape: Date;
  errorCount: number;
  averageResponseTime: number;
}

// API Response types
export interface SearchResponse {
  searchId: string;
  results: ProductListing[];
  metadata: SearchMetadata;
}

export interface RefreshPricesResponse {
  jobId: string;
  estimatedCompletion: Date;
}

// Component prop types
export interface SearchInputProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
}

export interface ProductTableProps {
  results: ProductListing[];
  onSort: (field: string, direction: 'asc' | 'desc') => void;
  onRefresh: () => void;
  onCompare: (productIds: string[]) => void;
  isLoading?: boolean;
}
