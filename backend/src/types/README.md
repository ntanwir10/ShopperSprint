# Validation Schemas Documentation

This directory contains comprehensive Zod validation schemas for the Product Price Tracker application. The validation system provides type-safe data validation for API requests, responses, database models, and form inputs.

## Overview

The validation system is organized into several modules:

- **`validation.ts`** - Core data model schemas (Product, ProductListing, Search, Source)
- **`api.ts`** - API request/response schemas and WebSocket event schemas
- **`forms.ts`** - Frontend form validation schemas
- **`index.ts`** - Re-exports all schemas and utilities

## Core Data Models

### Product Schema

```typescript
import { createProductSchema, productSchema } from "./types/validation.js";

// For creating new products
const newProduct = {
  name: "iPhone 15 Pro",
  normalizedName: "iphone-15-pro",
  category: "Electronics",
  specifications: { color: "Space Black", storage: "256GB" },
};

const validatedProduct = createProductSchema.parse(newProduct);
```

### ProductListing Schema

```typescript
import { createProductListingSchema } from "./types/validation.js";

const newListing = {
  productId: "clp1234567890abcdef",
  sourceId: "cls1234567890abcdef",
  url: "https://example.com/product/123",
  price: 999.99,
  currency: "USD",
  availability: "in_stock",
  imageUrl: "https://example.com/image.jpg",
  rating: 4.5,
  reviewCount: 100,
};

const validatedListing = createProductListingSchema.parse(newListing);
```

### Search Schema

```typescript
import { createSearchSchema } from "./types/validation.js";

const newSearch = {
  query: "iPhone 15 Pro",
  userId: "user123",
  metadata: {
    totalSources: 5,
    successfulSources: 4,
    searchDuration: 2500,
    cacheHit: false,
  },
};

const validatedSearch = createSearchSchema.parse(newSearch);
```

### Source Schema

```typescript
import { createSourceSchema } from "./types/validation.js";

const newSource = {
  name: "Amazon",
  category: "popular",
  isActive: true,
  configuration: {
    baseUrl: "https://amazon.com",
    searchPath: "/s",
    selectors: {
      productName: ".product-title",
      price: ".price",
      availability: ".availability",
      image: ".product-image",
      rating: ".rating",
    },
    rateLimit: {
      requestsPerMinute: 60,
      concurrent: 3,
    },
  },
};

const validatedSource = createSourceSchema.parse(newSource);
```

## API Schemas

### Search Request/Response

```typescript
import { searchRequestSchema, searchResponseSchema } from './types/api.js';

// Request validation
const searchRequest = {
  query: 'iPhone 15 Pro',
  sources: ['cls1234567890abcdef'],
  maxResults: 25
};

const validatedRequest = searchRequestSchema.parse(searchRequest);

// Response validation
const searchResponse = {
  searchId: 'cls1234567890abcdef',
  results: [...],
  metadata: {
    totalSources: 5,
    successfulSources: 4,
    searchDuration: 1500,
    cacheHit: false,
    timestamp: new Date().toISOString()
  }
};

const validatedResponse = searchResponseSchema.parse(searchResponse);
```

### Refresh Prices Request

```typescript
import { refreshPricesRequestSchema } from "./types/api.js";

const refreshRequest = {
  searchId: "cls1234567890abcdef",
  productIds: ["clp1234567890abcdef", "clp0987654321fedcba"],
};

const validatedRefresh = refreshPricesRequestSchema.parse(refreshRequest);
```

## Form Validation

### Search Form

```typescript
import { searchFormSchema } from "./types/forms.js";

const searchForm = {
  query: "iPhone 15 Pro",
  sources: ["cls1234567890abcdef"],
  maxResults: 25,
};

const validatedForm = searchFormSchema.parse(searchForm);
```

### Product Comparison Form

```typescript
import { comparisonFormSchema } from "./types/forms.js";

const comparisonForm = {
  productIds: ["clp1234567890abcdef", "clp0987654321fedcba"],
};

const validatedComparison = comparisonFormSchema.parse(comparisonForm);
```

## Validation Utilities

### Basic Validation

```typescript
import { validateData, safeValidate } from "./utils/validation.js";

// Returns detailed validation result
const result = validateData(searchRequestSchema, requestData);
if (result.success) {
  console.log("Valid data:", result.data);
} else {
  console.log("Validation errors:", result.errors);
}

// Returns parsed data or null
const validData = safeValidate(searchRequestSchema, requestData);
if (validData) {
  console.log("Valid data:", validData);
} else {
  console.log("Invalid data");
}
```

### Express Middleware

```typescript
import { validateRequest } from "./utils/validation.js";
import { searchRequestSchema } from "./types/api.js";

// Validate request body
app.post(
  "/api/search",
  validateRequest(searchRequestSchema, "body"),
  (req, res) => {
    // Access validated data
    const { query, sources, maxResults } = req.validated;
    // ... handle request
  }
);

// Validate query parameters
app.get("/api/products", validateRequest(querySchema, "query"), (req, res) => {
  const { page, limit } = req.validated;
  // ... handle request
});

// Validate URL parameters
app.get(
  "/api/products/:id",
  validateRequest(paramsSchema, "params"),
  (req, res) => {
    const { id } = req.validated;
    // ... handle request
  }
);
```

### Custom Validation Functions

```typescript
import {
  validatePrice,
  validateProductName,
  validateUrl,
  validateAvailability,
  validateRating,
  validateCurrency,
} from "./utils/validation.js";

// Price validation
const price = validatePrice("$99.99"); // Returns 99.99 or null

// Product name validation
const name = validateProductName("  iPhone 15 Pro  "); // Returns 'iPhone 15 Pro' or null

// URL validation (HTTPS only)
const url = validateUrl("https://example.com"); // Returns URL or null

// Availability validation
const availability = validateAvailability("in_stock"); // Returns 'in_stock' or null

// Rating validation (0-5 scale)
const rating = validateRating(4.5); // Returns 4.5 or null

// Currency validation (ISO 4217)
const currency = validateCurrency("USD"); // Returns 'USD' or null
```

### Batch Validation

```typescript
import { validateBatch } from "./utils/validation.js";

const products = [
  { name: "Product 1", normalizedName: "product-1" },
  { name: "", normalizedName: "invalid" }, // Invalid
  { name: "Product 3", normalizedName: "product-3" },
];

const result = validateBatch(createProductSchema, products);
console.log("Valid products:", result.valid);
console.log("Invalid products:", result.invalid);
```

### Error Handling

```typescript
import { ValidationError, formatZodErrors } from "./utils/validation.js";

try {
  const result = schema.parse(data);
} catch (error) {
  if (error instanceof z.ZodError) {
    const formattedErrors = formatZodErrors(error);
    console.log("Validation errors:", formattedErrors);
  }
}

// Custom validation error
throw new ValidationError("Invalid email format", "EMAIL_INVALID", {
  email: "test@",
});
```

## Type Safety

All schemas provide TypeScript types that can be imported and used throughout your application:

```typescript
import type {
  Product,
  ProductListing,
  Search,
  Source,
  SearchRequest,
  SearchResponse,
  SearchFormData,
  ComparisonFormData,
} from "./types/index.js";

// Use types in your functions
function processProduct(product: Product): void {
  console.log(product.name);
}

function handleSearchRequest(request: SearchRequest): SearchResponse {
  // Implementation
}
```

## Best Practices

1. **Always validate at boundaries** - Validate data when it enters your system (API endpoints, form submissions)

2. **Use middleware for consistent validation** - The `validateRequest` middleware provides consistent error handling

3. **Leverage TypeScript integration** - Use the generated types for better development experience

4. **Handle validation errors gracefully** - Provide meaningful error messages to users

5. **Use safe validation for optional checks** - Use `safeValidate` when you want to handle invalid data without throwing

6. **Validate early and often** - Don't wait until database operations to validate data

7. **Use custom validation functions** - For complex validation logic, use the provided utility functions

8. **Test your validation schemas** - Write comprehensive tests for your validation logic

## Error Response Format

When validation fails, the middleware returns a standardized error response:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": [
      {
        "field": "query",
        "message": "Search query must be at least 3 characters",
        "code": "too_small"
      }
    ],
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

This consistent format makes it easy for frontend applications to handle validation errors appropriately.
