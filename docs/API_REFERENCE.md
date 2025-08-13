# 🔌 API Reference

The PricePulse API provides comprehensive endpoints for product search, price comparison, and price alerts. **The system works without user authentication - all features are available anonymously.**

## Base URL

```url
http://localhost:3001/api
```

## Authentication

**No authentication required** - The system operates anonymously without user accounts.

## Endpoints

### GET /health

Check application health status.

**Response:**

```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### POST /api/search

Search for products across multiple sources.

**Request Body:**

```json
{
  "query": "laptop",
  "maxResults": 50,
  "filters": {
    "minPrice": 100,
    "maxPrice": 2000,
    "sources": ["amazon", "walmart"],
    "availability": "in_stock"
  }
}
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "results": [
      {
        "id": "1",
        "name": "MacBook Pro 13-inch",
        "price": 1299.99,
        "currency": "USD",
        "availability": "in_stock",
        "source": "Amazon",
        "imageUrl": "https://example.com/image.jpg",
        "rating": 4.5,
        "reviewCount": 1250,
        "url": "https://amazon.com/product",
        "lastScraped": "2024-01-01T00:00:00Z"
      }
    ],
    "totalResults": 1,
    "searchId": "search_123",
    "cached": false
  }
}
```

### GET /api/search/:id

Get search results by search ID.

**Parameters:**

- `id` (string): Search ID from previous search

**Response:**

```json
{
  "status": "success",
  "data": {
    "searchId": "search_123",
    "query": "laptop",
    "results": [...],
    "createdAt": "2024-01-01T00:00:00Z",
    "lastUpdated": "2024-01-01T00:00:00Z"
  }
}
```

### POST /api/search/refresh-prices

Refresh prices for existing search results.

**Request Body:**

```json
{
  "searchId": "search_123",
  "productIds": ["1", "2", "3"]
}
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "jobId": "job_456",
    "message": "Price refresh job queued successfully",
    "estimatedCompletion": "2024-01-01T00:05:00Z"
  }
}
```

### GET /api/search/status/:jobId

Get the status of a background job.

**Parameters:**

- `jobId` (string): Job ID from price refresh or search operation

**Response:**

```json
{
  "status": "success",
  "data": {
    "jobId": "job_456",
    "status": "completed",
    "progress": 100,
    "result": {
      "updatedProducts": 3,
      "errors": []
    },
    "createdAt": "2024-01-01T00:00:00Z",
    "completedAt": "2024-01-01T00:05:00Z"
  }
}
```

### GET /api/ads

Get advertisements for display.

**Query Parameters:**

- `category` (string, optional): Product category for targeted ads
- `limit` (number, optional): Maximum number of ads to return (default: 5)

**Response:**

```json
{
  "status": "success",
  "data": {
    "ads": [
      {
        "id": "ad_1",
        "title": "Special Offer on Electronics",
        "description": "Get 20% off on all electronics",
        "imageUrl": "https://example.com/ad.jpg",
        "targetUrl": "https://example.com/offer",
        "category": "electronics",
        "priority": 1,
        "active": true
      }
    ]
  }
}
```

### POST /api/ads/track

Track advertisement events (clicks, impressions, etc.).

**Request Body:**

```json
{
  "adId": "ad_1",
  "eventType": "click",
  "userId": "user_123",
  "sessionId": "session_456",
  "metadata": {
    "userAgent": "Mozilla/5.0...",
    "referrer": "https://example.com",
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "tracked": true,
    "eventId": "event_789"
  }
}
```

### GET /api/ads/stats/:adId

Get statistics for a specific advertisement.

**Parameters:**

- `adId` (string): Advertisement ID

**Query Parameters:**

- `startDate` (string, optional): Start date for statistics (ISO 8601)
- `endDate` (string, optional): End date for statistics (ISO 8601)

**Response:**

```json
{
  "status": "success",
  "data": {
    "adId": "ad_1",
    "title": "Special Offer on Electronics",
    "stats": {
      "impressions": 1500,
      "clicks": 75,
      "clickThroughRate": 5.0,
      "revenue": 150.00,
      "costPerClick": 2.00
    },
    "period": {
      "startDate": "2024-01-01T00:00:00Z",
      "endDate": "2024-01-31T23:59:59Z"
    }
  }
}
```

### GET /api/ads/stats

Get overall advertisement statistics.

**Query Parameters:**

- `startDate` (string, optional): Start date for statistics (ISO 8601)
- `endDate` (string, optional): End date for statistics (ISO 8601)
- `groupBy` (string, optional): Group by category, source, etc.

**Response:**

```json
{
  "status": "success",
  "data": {
    "overview": {
      "totalImpressions": 5000,
      "totalClicks": 250,
      "overallCTR": 5.0,
      "totalRevenue": 500.00,
      "averageCPC": 2.00
    },
    "byCategory": [
      {
        "category": "electronics",
        "impressions": 2000,
        "clicks": 100,
        "ctr": 5.0,
        "revenue": 200.00
      }
    ],
    "period": {
      "startDate": "2024-01-01T00:00:00Z",
      "endDate": "2024-01-31T23:59:59Z"
    }
  }
}
```

## 🔌 WebSocket API

### Connection

Connect to WebSocket server for real-time updates:

```javascript
const ws = new WebSocket('ws://localhost:3001');

ws.onopen = () => {
  console.log('Connected to WebSocket server');
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
};
```

### Message Types

#### Price Update

```json
{
  "type": "price_update",
  "data": {
    "productId": "1",
    "newPrice": 1199.99,
    "oldPrice": 1299.99,
    "source": "Amazon",
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

#### Search Progress

```json
{
  "type": "search_progress",
  "data": {
    "searchId": "search_123",
    "progress": 75,
    "status": "in_progress",
    "message": "Scraping Walmart..."
  }
}
```

#### Job Status

```json
{
  "type": "job_status",
  "data": {
    "jobId": "job_456",
    "status": "completed",
    "result": {
      "updatedProducts": 3
    }
  }
}
```

## 🚨 Error Codes

| Status Code | Error Type            | Description               |
| ----------- | --------------------- | ------------------------- |
| 400         | `ValidationError`     | Request validation failed |
| 401         | `UnauthorizedError`   | Authentication required   |
| 403         | `ForbiddenError`      | Access denied             |
| 404         | `NotFoundError`       | Resource not found        |
| 409         | `ConflictError`       | Resource conflict         |
| 429         | `RateLimitError`      | Too many requests         |
| 500         | `InternalServerError` | Server error              |

## 📊 Rate Limiting

- **Window**: 15 minutes
- **Limit**: 100 requests per IP address
- **Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

## 🔒 CORS Configuration

- **Origin**: Configurable via `FRONTEND_URL` environment variable
- **Credentials**: Supported
- **Methods**: GET, POST, PUT, DELETE, OPTIONS
- **Headers**: Content-Type, Authorization

## 📝 Data Types

### Product

```typescript
interface Product {
  id: string;
  name: string;
  price: number;
  currency: string;
  availability: 'in_stock' | 'limited' | 'out_of_stock';
  source: string;
  imageUrl: string;
  rating?: number;
  reviewCount?: number;
  url: string;
  lastScraped: string;
}
```

### Search Filters

```typescript
interface SearchFilters {
  minPrice?: number;
  maxPrice?: number;
  sources?: string[];
  availability?: 'in_stock' | 'limited' | 'out_of_stock';
  rating?: number;
  category?: string;
}
```

### Advertisement

```typescript
interface Advertisement {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  targetUrl: string;
  category: string;
  priority: number;
  active: boolean;
}
```

## 🧪 Testing

Test the API endpoints using the provided test suite:

```bash
# Backend tests
cd backend
npm run test

# Frontend tests
cd frontend
npm run test
```

## 📚 Additional Resources

- **[Environment Setup](ENVIRONMENT_SETUP.md)** - Configuration guide
- **[Development Workflow](DEVELOPMENT_WORKFLOW.md)** - Development process
- **[README.md](../README.md)** - Main project documentation

## 🔔 Notifications API

### POST /api/notifications/alerts

Create a new price alert (anonymous, no user account required).

**Request Body:**

```json
{
  "productId": "string",
  "productName": "string",
  "targetPrice": "number",
  "sourceId": "string",
  "sourceName": "string",
  "currentPrice": "number"
}
```

**Response:**

```json
{
  "message": "Price alert created successfully",
  "alert": {
    "id": "alert_123",
    "productId": "product_1",
    "productName": "Sample Product",
    "targetPrice": 25000,
    "sourceId": "source_1",
    "sourceName": "Mock Source",
    "currentPrice": 29999,
    "isActive": true,
    "createdAt": "2025-08-13T18:30:00.000Z"
  }
}
```

### GET /api/notifications/alerts

Get all price alerts (anonymous system).

**Response:**

```json
{
  "message": "Alerts retrieved successfully",
  "alerts": [
    {
      "id": "alert_123",
      "productId": "product_1",
      "productName": "Sample Product",
      "targetPrice": 25000,
      "sourceId": "source_1",
      "sourceName": "Mock Source",
      "currentPrice": 29999,
      "isActive": true,
      "createdAt": "2025-08-13T18:30:00.000Z"
    }
  ],
  "count": 1
}
```

### PUT /api/notifications/alerts/:alertId

Update an existing price alert.

**Parameters:**

- `alertId` (string): Alert ID to update

**Request Body:**

```json
{
  "targetPrice": 20000,
  "isActive": false
}
```

### DELETE /api/notifications/alerts/:alertId

Delete a price alert.

**Parameters:**

- `alertId` (string): Alert ID to delete

### GET /api/notifications/preferences

Get notification preferences (system-wide defaults).

**Response:**

```json
{
  "message": "Preferences retrieved successfully",
  "preferences": {
    "id": "default",
    "emailNotifications": true,
    "pushNotifications": true,
    "quietHoursStart": "22:00",
    "quietHoursEnd": "08:00",
    "timezone": "UTC"
  }
}
```

### PUT /api/notifications/preferences

Update notification preferences (system-wide defaults).

**Request Body:**

```json
{
  "quietHoursStart": "23:00",
  "quietHoursEnd": "07:00"
}
```

### GET /api/notifications/stats

Get notification statistics.

**Response:**

```json
{
  "message": "Statistics retrieved successfully",
  "stats": {
    "activeAlerts": 2,
    "triggeredAlerts": 1,
    "totalAlerts": 3
  }
}
```
