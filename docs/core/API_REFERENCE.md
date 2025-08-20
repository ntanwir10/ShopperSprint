# 📚 API Reference

This document provides comprehensive documentation for all PricePulse API endpoints. The system works without user authentication and uses email-based management for price alerts.

## 🔗 Base URL

- **Development**: `http://localhost:3001`
- **Production**: `https://shoppersprint.com`

## 🔐 Authentication

**No authentication required** - The system works completely anonymously. Price alerts are managed through secure email tokens.

## 📋 API Endpoints

### 🔍 Search API

#### Search Products

```http
POST /api/search
```

**Request Body:**

```json
{
  "query": "laptop",
  "maxResults": 50,
  "filters": {
    "minPrice": 500,
    "maxPrice": 2000,
    "availability": "in_stock",
    "minRating": 4.0,
    "sources": ["amazon", "bestbuy"]
  },
  "sort": {
    "field": "price",
    "direction": "asc"
  }
}
```

**Response:**

```json
{
  "searchId": "uuid",
  "results": [
    {
      "id": "product-uuid",
      "name": "MacBook Pro 13-inch",
      "price": 129999,
      "currency": "USD",
      "availability": "in_stock",
      "source": "Amazon",
      "imageUrl": "https://example.com/image.jpg",
      "rating": 4.5,
      "reviewCount": 1250,
      "url": "https://amazon.com/product",
      "lastScraped": "2024-01-15T10:30:00Z"
    }
  ],
  "metadata": {
    "totalSources": 5,
    "successfulSources": 4,
    "searchDuration": 1250,
    "cacheHit": false
  }
}
```

#### Get Search Suggestions

```http
GET /api/search/suggestions?query=laptop&limit=10
```

**Response:**

```json
[
  "laptop best price",
  "laptop on sale",
  "laptop reviews",
  "laptop comparison",
  "laptop deals"
]
```

#### Get Popular Searches

```http
GET /api/search/popular?timeRange=7d&limit=20
```

**Response:**

```json
[
  {
    "term": "laptop",
    "count": 1250
  },
  {
    "term": "smartphone",
    "count": 980
  }
]
```

### 🔔 Anonymous Notifications API

#### Create Price Alert

```http
POST /api/anonymous-notifications/alerts
```

**Request Body (dollars):**

```json
{
  "email": "user@example.com",
  "productId": "product-uuid",
  "targetPrice": 999.99,
  "currency": "USD",
  "alertType": "below",
  "threshold": 5
}
```

**Response:**

```json
{
  "message": "Price alert created successfully. Please check your email to verify.",
  "statusCode": 201,
  "data": {
    "id": "alert-uuid",
    "email": "user@example.com",
    "targetPrice": 999.99,
    "currency": "USD",
    "alertType": "below",
    "threshold": 5,
    "isVerified": false
  }
}
```

#### Verify Price Alert

```http
GET /api/anonymous-notifications/verify/:verificationToken
```

**Response (dollars):**

```json
{
  "message": "Price alert verified successfully!",
  "statusCode": 200,
  "data": {
    "id": "alert-uuid",
    "email": "user@example.com",
    "targetPrice": 999.99,
    "currency": "USD",
    "alertType": "below",
    "threshold": 5,
    "isVerified": true,
    "managementToken": "token"
  }
}
```

#### Get Alert Details (Management)

```http
GET /api/anonymous-notifications/alerts/:managementToken
```

**Response (dollars):**

```json
{
  "message": "Alert retrieved successfully",
  "statusCode": 200,
  "data": {
    "id": "alert-uuid",
    "email": "user@example.com",
    "targetPrice": 999.99,
    "currency": "USD",
    "alertType": "below",
    "threshold": 5,
    "isVerified": true,
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:31:00Z"
  }
}
```

#### Update Price Alert

```http
PUT /api/anonymous-notifications/alerts/:managementToken
```

**Request Body (dollars):**

```json
{
  "targetPrice": 899.99,
  "alertType": "below",
  "threshold": 10
}
```

**Response (dollars):**

```json
{
  "message": "Price alert updated successfully",
  "statusCode": 200,
  "data": {
    "id": "alert-uuid",
    "email": "user@example.com",
    "targetPrice": 899.99,
    "currency": "USD",
    "alertType": "below",
    "threshold": 10,
    "isVerified": true,
    "isActive": true,
    "updatedAt": "2024-01-15T11:00:00Z"
  }
}
```

#### Delete Price Alert

```http
DELETE /api/anonymous-notifications/alerts/:managementToken
```

**Response:**

```json
{
  "message": "Price alert deleted successfully",
  "statusCode": 200
}
```

#### Test Email (non-production)

```http
POST /api/anonymous-notifications/test-email
```

**Request Body:**

```json
{ "email": "user@example.com" }
```

**Success Response:**

```json
{ "message": "Test email sent successfully", "statusCode": 200 }
```

**Error Response (example):**

```json
{ "error": "SMTPVerifyFailed", "message": "Missing credentials for \"PLAIN\"", "statusCode": 500 }
```

### 🔍 Product Details API

#### Get Product Details

```http
GET /api/search/products/:productId
```

**Response:**

```json
{
  "message": "Product details retrieved successfully",
  "statusCode": 200,
  "data": {
    "id": "product-uuid",
    "name": "MacBook Pro 13-inch",
    "currentPrice": 1299.99,
    "currency": "USD",
    "listings": [
      { "source": "Amazon", "price": 1299.99, "currency": "USD" }
    ]
  }
}
```

### 📊 Price History API

#### Get Product Price History

```http
GET /api/price-history/:productId?timeRange=30d&source=amazon
```

**Query Parameters:**
- `timeRange`: `7d`, `30d`, `90d`, `1y`
- `source`: Optional source filter

**Response:**

```json
{
  "productId": "product-uuid",
  "priceHistory": [
    {
      "date": "2024-01-01",
      "price": 129999,
      "source": "Amazon",
      "availability": "in_stock"
    },
    {
      "date": "2024-01-02",
      "price": 124999,
      "source": "Amazon",
      "availability": "in_stock"
    }
  ],
  "statistics": {
    "lowestPrice": 119999,
    "highestPrice": 139999,
    "averagePrice": 127499,
    "priceChange": -5000,
    "priceChangePercent": -3.8
  }
}
```

#### Compare Product Prices

```http
POST /api/price-history/compare
```

**Request Body:**

```json
{
  "productIds": ["product-uuid-1", "product-uuid-2"],
  "timeRange": "30d"
}
```

**Response:**

```json
{
  "comparison": [
    {
      "productId": "product-uuid-1",
      "name": "MacBook Pro 13-inch",
      "currentPrice": 129999,
      "priceHistory": [...],
      "statistics": {...}
    },
    {
      "productId": "product-uuid-2",
      "name": "Dell XPS 13",
      "currentPrice": 99999,
      "priceHistory": [...],
      "statistics": {...}
    }
  ]
}
```

### 📢 Advertisement API

#### Get Advertisements

```http
GET /api/ads?category=electronics&limit=5
```

**Query Parameters:**
- `category`: Advertisement category
- `limit`: Maximum number of ads to return

**Response:**

```json
{
  "advertisements": [
    {
      "id": "ad-uuid",
      "title": "Save on Electronics",
      "description": "Up to 50% off on selected items",
      "imageUrl": "https://example.com/ad.jpg",
      "targetUrl": "https://example.com/deal",
      "category": "electronics"
    }
  ]
}
```

#### Track Advertisement Click

```http
POST /api/ads/:adId/click
```

**Response:**

```json
{
  "message": "Click tracked successfully"
}
```

### 📈 Monitoring API

Monitoring endpoints are temporarily disabled. This section will be re-enabled once the monitoring router is restored.

### 🌐 WebSocket Events

Connect to WebSocket endpoint for real-time updates:

```typescript
const ws = new WebSocket('ws://localhost:3001/ws')

ws.onmessage = (event) => {
  const data = JSON.parse(event.data)
  
  switch (data.type) {
    case 'price_update':
      console.log('Price updated:', data.data)
      break
    case 'price_alert':
      console.log('Price alert triggered:', data.data)
      break
    case 'scraping_status':
      console.log('Scraping status:', data.data)
      break
  }
}
```

**Event Types:**

#### Price Update

```json
{
  "type": "price_update",
  "data": {
    "productId": "product-uuid",
    "newPrice": 124999,
    "source": "Amazon",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

#### Price Alert Triggered

```json
{
  "type": "price_alert",
  "data": {
    "alertId": "alert-uuid",
    "productId": "product-uuid",
    "productName": "MacBook Pro 13-inch",
    "targetPrice": 99999,
    "currentPrice": 124999,
    "currency": "USD"
  }
}
```

#### Scraping Status

```json
{
  "type": "scraping_status",
  "data": {
    "sourceId": "source-uuid",
    "sourceName": "Amazon",
    "status": "completed",
    "productsFound": 25,
    "duration": 5000
  }
}
```

## 📝 Data Types

### Product

```typescript
interface Product {
  id: string
  name: string
  price: number // Price in cents
  currency: string
  availability: 'in_stock' | 'out_of_stock' | 'limited' | 'unknown'
  source: string
  imageUrl?: string
  rating?: number
  reviewCount?: number
  url: string
  lastScraped: string
}
```

### Anonymous Price Alert

```typescript
interface AnonymousPriceAlert {
  id: string
  email: string
  productId: string
  targetPrice: number // Price in cents
  currency: string
  alertType: 'below' | 'above' | 'percentage'
  threshold?: number
  verificationToken: string
  managementToken: string
  isVerified: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}
```

### Search Request

```typescript
interface SearchRequest {
  query: string
  maxResults?: number
  filters?: {
    minPrice?: number
    maxPrice?: number
    availability?: string
    minRating?: number
    sources?: string[]
    category?: string
  }
  sort?: {
    field: 'price' | 'rating' | 'reviewCount' | 'lastScraped'
    direction: 'asc' | 'desc'
  }
}
```

### Search Response

```typescript
interface SearchResponse {
  searchId: string
  results: Product[]
  metadata: {
    totalSources: number
    successfulSources: number
    searchDuration: number
    cacheHit: boolean
  }
}
```

## 🔒 Rate Limiting

- **Search API**: 100 requests per 15 minutes per IP
- **Alert Creation**: 10 alerts per hour per email
- **General API**: 100 requests per 15 minutes per IP

## 🚨 Error Handling

All API endpoints return consistent error responses:

```json
{
  "error": "Error Type",
  "message": "Human-readable error message",
  "statusCode": 400,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

## 📧 Email Templates

### Price Alert Verification

```html
<h2>Verify Your Price Alert</h2>
<p>Click the link below to verify your price alert for {{productName}}:</p>
<a href="{{verificationUrl}}">Verify Alert</a>
<p>Or copy this link: {{verificationUrl}}</p>
<p>This link will expire in 24 hours.</p>
```

### Price Alert Management

```html
<h2>Manage Your Price Alert</h2>
<p>Use the link below to manage your price alert for {{productName}}:</p>
<a href="{{managementUrl}}">Manage Alert</a>
<p>Or copy this link: {{managementUrl}}</p>
<p>This link will never expire.</p>
```

### Price Alert Triggered

```html
<h2>Price Alert Triggered!</h2>
<p>Your price alert for {{productName}} has been triggered!</p>
<p>Target Price: ${{targetPrice}}</p>
<p>Current Price: ${{currentPrice}}</p>
<p>View the product: <a href="{{productUrl}}">{{productUrl}}</a></p>
<p>To manage your alerts: <a href="{{managementUrl}}">Manage Alerts</a></p>
```

## 🧪 Testing

### Test Endpoints
- **Health Check**: `GET /health`
- **Ping**: `GET /ping`
- **API Health**: `GET /api/health`

### Test Data
The system includes mock data for development and testing. Set `NODE_ENV=development` to enable mock data.

## 📚 SDKs and Libraries

### JavaScript/TypeScript

```bash
npm install pricepulse-client
```

```typescript
import { PricePulseClient } from 'pricepulse-client'

const client = new PricePulseClient({
  baseUrl: 'http://localhost:3001'
})

const results = await client.search({
  query: 'laptop',
  maxResults: 20
})
```

### Python

```bash
pip install pricepulse-python
```

```python
from pricepulse import PricePulseClient

client = PricePulseClient(base_url='http://localhost:3001')
results = client.search(query='laptop', max_results=20)
```

## 🔄 Webhooks

Configure webhooks to receive real-time updates:

```http
POST /api/webhooks/configure
```

**Request Body:**

```json
{
  "url": "https://shoppersprint.com/webhook",
  "events": ["price_update", "price_alert"],
  "secret": "your-webhook-secret"
}
```

**Webhook Payload:**

```json
{
  "event": "price_update",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "productId": "product-uuid",
    "newPrice": 124999
  },
  "signature": "sha256=..."
}
```

## 📊 Analytics

### Search Analytics

```http
GET /api/analytics/search?timeRange=7d
```

### Alert Analytics

```http
GET /api/analytics/alerts?timeRange=7d
```

### Performance Metrics

```http
GET /api/analytics/performance?timeRange=24h
```

## 🔧 Configuration

### Environment Variables

```env
# Server
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/pricepulse

# Redis
REDIS_URL=redis://localhost:6379

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Scraping
SCRAPING_DELAY=1000
MAX_CONCURRENT_SCRAPES=3
SCRAPING_TIMEOUT=30000
```

## 📞 Support

For API support and questions:
- **Documentation**: Check this document and project README
- **Issues**: Report bugs on GitHub
- **Discussions**: Use GitHub Discussions for questions

## 📄 License

This API is part of the PricePulse project and is available under the MIT License.
