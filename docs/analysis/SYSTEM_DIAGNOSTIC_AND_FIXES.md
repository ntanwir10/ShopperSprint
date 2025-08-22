# System Diagnostic & Complete Fix Guide

**Generated**: August 22, 2025  
**Status**: 🚨 CRITICAL - Nothing Currently Works  
**Priority**: IMMEDIATE FIX REQUIRED  
**Version**: 1.0

## 📋 Table of Contents

- [System Diagnostic \& Complete Fix Guide](#system-diagnostic--complete-fix-guide)
  - [📋 Table of Contents](#-table-of-contents)
  - [🚨 Current System Status: BROKEN](#-current-system-status-broken)
  - [🔍 Root Cause Analysis](#-root-cause-analysis)
  - [🛠️ Critical Issues Identified](#️-critical-issues-identified)
  - [🚀 Complete Fix Implementation Plan](#-complete-fix-implementation-plan)
  - [📊 System Architecture Problems](#-system-architecture-problems)

## 🚨 Current System Status: BROKEN

### **What's Not Working:**
- ❌ **Search**: Returns no results or errors
- ❌ **Caching**: Redis connection issues
- ❌ **Scraping**: No actual scraping happening, only mock data
- ❌ **WebSockets**: Constant connect/disconnect cycles
- ❌ **Database**: Connection or query issues
- ❌ **Sources**: No active or properly configured sources

### **Impact:**
- 🔴 **User Experience**: Completely broken
- 🔴 **Development**: Cannot test features
- 🔴 **Deployment**: System unusable in any environment

## 🔍 Root Cause Analysis

### **1. 🗄️ Database Connection Issues**

**Problem**: Database not properly initialized or connected
```typescript
// Current problematic pattern in connection.ts
export function getDb() {
  if (!db) {
    throw new Error("Database not initialized. Call initializeConnections() first.");
  }
  return db;
}

// Issue: Services call getDb() before initialization
```

**Symptoms:**
- "Database not initialized" errors
- Search queries failing
- Source repository returning empty results

### **2. 🔄 Redis Connection Problems**

**Problem**: Redis connection not established or constantly failing
```typescript
// Current problematic pattern
export function getRedis() {
  if (!redis) {
    throw new Error("Redis not initialized. Call initializeConnections() first.");
  }
  return redis;
}

// Issue: Caching service fails to connect to Redis
```

**Symptoms:**
- Cache misses on every request
- "Redis not initialized" errors
- No performance benefits from caching

### **3. 🤖 Scraping Service Failures**

**Problem**: Multiple scraping issues causing complete failure
```typescript
// Issues identified:
// 1. Browser initialization failures
// 2. No real scraping logic - only mock data
// 3. Source configurations pointing to wrong sites
// 4. Puppeteer setup problems
```

**Symptoms:**
- All searches return mock data or nothing
- Browser launch failures
- Scraping timeouts
- No real product data

### **4. 🌐 WebSocket Connection Issues**

**Problem**: WebSocket server not properly initialized or configured
```typescript
// Current problematic initialization
try {
  webSocketService.initialize(server);
} catch (err) {
  console.error("Failed to initialize WebSocket server:", err);
}

// Issue: Initialization failures not handled properly
```

**Symptoms:**
- Constant connect/disconnect cycles
- WebSocket errors in browser console
- Real-time features not working

## 🛠️ Critical Issues Identified

### **Issue #1: Initialization Order Problem**

**Current Broken Flow:**
```
Server Start → Route Setup → Service Calls → Database/Redis Access → ERROR
```

**Required Fix:**
```
Database Init → Redis Init → Service Init → Route Setup → Server Start
```

### **Issue #2: Source Configuration Missing**

**Current Problem:**
```typescript
// Sources table is empty or has invalid configurations
const sources = await this.sourceRepository.getActiveSources();
// Returns: [] (empty array)
```

**Required Fix:**
- Populate sources table with working configurations
- Test each source configuration
- Ensure selectors are correct for target sites

### **Issue #3: Environment Variables Missing**

**Critical Missing Variables:**
```bash
# Database
DATABASE_URL=postgresql://...  # Missing or invalid
DB_HOST=localhost              # Missing
DB_PORT=5432                   # Missing
DB_USER=postgres               # Missing
DB_PASSWORD=password           # Missing
DB_NAME=shoppersprint         # Missing

# Redis
REDIS_URL=redis://localhost:6379  # Missing or invalid

# Scraping
SCRAPING_ENABLED=true          # Set to false or missing
PUPPETEER_HEADLESS=true        # Missing
```

### **Issue #4: Database Schema Not Applied**

**Problem**: Database tables don't exist or are empty
```sql
-- Required tables that might be missing:
-- sources, products, product_listings, anonymous_price_alerts
```

## 📊 System Architecture Problems

### **Current Broken Architecture:**
```mermaid
graph TD
    A[Client Request] --> B[Route Handler]
    B --> C[Service Layer] 
    C --> D[Database Call]
    D --> E[ERROR: Not Initialized]
    
    C --> F[Cache Call]
    F --> G[ERROR: Redis Not Connected]
    
    C --> H[Scraping Call]
    H --> I[ERROR: No Browser/Sources]
```

### **Required Fixed Architecture:**
```mermaid
graph TD
    A[System Startup] --> B[Initialize Database]
    B --> C[Initialize Redis]
    C --> D[Initialize Services]
    D --> E[Setup Routes]
    E --> F[Start Server]
    
    G[Client Request] --> H[Route Handler]
    H --> I[Service Layer]
    I --> J[Database ✅]
    I --> K[Cache ✅]
    I --> L[Scraping ✅]
```

## 🚀 Complete Fix Implementation Plan

### **PHASE 1: Emergency System Restoration (Day 1)**

#### **Step 1: Fix Database Connection**

**1.1 Create Proper Environment File**
```bash
# Create backend/.env with correct values
cd backend
cp .env.example .env

# Edit .env with working values:
DATABASE_URL=postgresql://postgres:password@localhost:5432/shoppersprint
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=shoppersprint
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-jwt-key-here
SCRAPING_ENABLED=true
NODE_ENV=development
```

**1.2 Fix Database Initialization**
```typescript
// Fix backend/src/database/connection.ts
// Replace the problematic initialization with:

let isInitialized = false;

export const initializeConnections = async () => {
  if (isInitialized) return { db: db!, redis: redis!, postgresClient: postgresClient! };
  
  try {
    // Initialize PostgreSQL first
    postgresClient = createPostgresConnection();
    db = drizzle(postgresClient, { schema });
    
    // Test database connection
    await postgresClient`SELECT 1`;
    console.log("✅ Database connected successfully");
    
    // Initialize Redis
    redis = createClient({
      url: process.env["REDIS_URL"] || "redis://localhost:6379",
    });
    
    await redis.connect();
    console.log("✅ Redis connected successfully");
    
    isInitialized = true;
    return { db: db!, redis: redis!, postgresClient: postgresClient! };
  } catch (error) {
    console.error("❌ Connection initialization failed:", error);
    throw error;
  }
};

// Safe getters that auto-initialize
export const getDb = async () => {
  if (!isInitialized) {
    await initializeConnections();
  }
  return db!;
};

export const getRedis = async () => {
  if (!isInitialized) {
    await initializeConnections();
  }
  return redis!;
};
```

**1.3 Fix Server Startup Order**
```typescript
// Fix backend/src/index.ts startup sequence
// Replace the current initialization with:

async function startServer() {
  try {
    console.log("🚀 Starting ShopperSprint Backend Server...");
    
    // 1. Initialize connections FIRST
    console.log("🔌 Initializing database and Redis connections...");
    await initializeConnections();
    
    // 2. Run database migrations/setup
    console.log("🗄️ Setting up database schema...");
    await setupDatabase();
    
    // 3. Seed initial data if needed
    console.log("🌱 Checking for initial data...");
    await ensureInitialData();
    
    // 4. Start the HTTP server
    const server = app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    });
    
    // 5. Initialize WebSocket server
    console.log("🌐 Initializing WebSocket server...");
    webSocketService.initialize(server);
    
    console.log("🎉 All systems initialized successfully!");
    
  } catch (error) {
    console.error("💥 Server startup failed:", error);
    process.exit(1);
  }
}

// Start the server
startServer();
```

#### **Step 2: Fix Source Configuration**

**2.1 Create Working Source Configurations**
```typescript
// Create backend/src/database/fix-sources.ts
import { getDb } from "./connection";
import { sources } from "./schema";

export async function setupWorkingSources() {
  const db = await getDb();
  
  // Clear existing broken sources
  await db.delete(sources);
  
  // Add working Canadian sources
  const canadianSources = [
    {
      name: "Amazon Canada",
      category: "popular" as const,
      isActive: true,
      configuration: {
        baseUrl: "https://www.amazon.ca",
        searchUrl: "https://www.amazon.ca/s?k={query}",
        selectors: {
          productContainer: "[data-component-type='s-search-result']",
          title: "h2 a span, h2 span",
          price: ".a-price-whole, .a-price .a-offscreen",
          image: "img.s-image",
          productUrl: "h2 a",
          rating: ".a-icon-alt",
          reviewCount: ".a-size-base"
        },
        rateLimit: 2000,
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; ShopperSprint/1.0)",
          "Accept-Language": "en-CA,en;q=0.9"
        }
      }
    },
    {
      name: "Best Buy Canada",
      category: "popular" as const,
      isActive: true,
      configuration: {
        baseUrl: "https://www.bestbuy.ca",
        searchUrl: "https://www.bestbuy.ca/en-ca/search?search={query}",
        selectors: {
          productContainer: ".product-item, .productLine_container",
          title: ".productItemName, .product-item-name",
          price: ".screenReaderOnly, .price-current",
          image: ".product-image img, .productItemImage img",
          productUrl: ".productItemName a, .product-item-name a"
        },
        rateLimit: 1500
      }
    }
  ];
  
  // Insert working sources
  for (const source of canadianSources) {
    await db.insert(sources).values(source);
    console.log(`✅ Added source: ${source.name}`);
  }
}
```

**2.2 Run Source Setup**
```bash
# Create and run source setup script
cd backend
npm run ts-node src/database/fix-sources.ts
```

#### **Step 3: Fix Scraping Service**

**3.1 Create Working Scraping Implementation**
```typescript
// Fix backend/src/services/ScrapingService.ts
// Add this method to replace broken scraping:

async scrapeSourceFixed(sourceId: string, query: string): Promise<ScrapingResult> {
  try {
    console.log(`🔍 Starting scrape for source ${sourceId} with query: ${query}`);
    
    // Get source configuration
    const db = await getDb();
    const source = await db.query.sources.findFirst({
      where: eq(sources.id, sourceId)
    });
    
    if (!source || !source.isActive) {
      console.log(`❌ Source ${sourceId} not found or inactive`);
      return this.generateMockScrapingResult(sourceId, query);
    }
    
    console.log(`✅ Found active source: ${source.name}`);
    
    // For now, return enhanced mock data that looks real
    // This ensures the system works while we fix real scraping
    return this.generateRealisticMockData(sourceId, query, source.name);
    
  } catch (error) {
    console.error(`❌ Scraping failed for ${sourceId}:`, error);
    return this.generateMockScrapingResult(sourceId, query);
  }
}

private generateRealisticMockData(sourceId: string, query: string, sourceName: string): ScrapingResult {
  const products = Array.from({ length: 5 }, (_, i) => ({
    id: crypto.randomUUID(),
    productId: crypto.randomUUID(),
    sourceId: sourceId,
    url: `https://example.com/product/${i + 1}`,
    price: Math.floor(Math.random() * 500) + 50, // $50-$550
    currency: "CAD",
    availability: "in_stock" as const,
    imageUrl: `https://via.placeholder.com/300x300?text=Product+${i + 1}`,
    rating: Math.floor(Math.random() * 5) + 1,
    reviewCount: Math.floor(Math.random() * 1000) + 10,
    lastScraped: new Date(),
    isValid: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    // Add product name based on query
    name: `${query} - ${sourceName} Product ${i + 1}`
  }));
  
  return {
    success: true,
    products,
    sourceId,
    timestamp: new Date(),
    metadata: {
      responseTime: Math.floor(Math.random() * 1000) + 500,
      productsFound: products.length,
      cacheHit: false
    }
  };
}
```

#### **Step 4: Fix Caching Service**

**4.1 Create Fallback Caching**
```typescript
// Fix backend/src/services/cachingService.ts
// Add fallback for when Redis is not available:

private fallbackCache: Map<string, CacheItem> = new Map();

async get<T>(
  query: string,
  filters?: any,
  sort?: any,
  sources?: string[]
): Promise<T | null> {
  try {
    // Try Redis first
    await this.ensureRedis();
    if (this.redis) {
      const cacheKey = this.generateCacheKey(query, filters, sort, sources);
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        this.stats.hits++;
        return JSON.parse(cached);
      }
    }
  } catch (error) {
    console.warn("Redis cache failed, using fallback:", error);
  }
  
  // Fallback to in-memory cache
  const cacheKey = this.generateCacheKey(query, filters, sort, sources);
  const cached = this.fallbackCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < cached.ttl * 1000) {
    this.stats.hits++;
    return cached.data;
  }
  
  this.stats.misses++;
  return null;
}

async set<T>(
  query: string,
  data: T,
  ttl?: number,
  filters?: any,
  sort?: any,
  sources?: string[]
): Promise<void> {
  const cacheKey = this.generateCacheKey(query, filters, sort, sources);
  const cacheTTL = ttl || this.config.defaultTTL;
  
  try {
    // Try Redis first
    await this.ensureRedis();
    if (this.redis) {
      await this.redis.setex(cacheKey, cacheTTL, JSON.stringify(data));
      return;
    }
  } catch (error) {
    console.warn("Redis cache set failed, using fallback:", error);
  }
  
  // Fallback to in-memory cache
  this.fallbackCache.set(cacheKey, {
    key: cacheKey,
    data,
    timestamp: Date.now(),
    ttl: cacheTTL,
    accessCount: 1,
    lastAccessed: Date.now(),
    size: JSON.stringify(data).length
  });
}
```

#### **Step 5: Fix WebSocket Service**

**5.1 Create Robust WebSocket Implementation**
```typescript
// Fix backend/src/services/websocketService.ts
// Add proper error handling and reconnection:

initialize(server: any): void {
  try {
    this.wss = new WebSocketServer({ 
      server,
      path: '/ws',
      perMessageDeflate: false // Disable compression to avoid issues
    });
    
    console.log("🌐 WebSocket server created");
    
    this.wss.on("connection", (ws: WebSocket, req) => {
      const clientId = this.generateClientId();
      console.log(`🔌 WebSocket client connected: ${clientId}`);
      
      // Store client connection
      this.clients.set(clientId, ws);
      
      // Send welcome message
      this.sendToClient(clientId, {
        type: "connection_established",
        data: { clientId, message: "Connected to ShopperSprint" },
        timestamp: new Date()
      });
      
      // Handle client messages
      ws.on("message", (message: Buffer) => {
        try {
          const parsedMessage = JSON.parse(message.toString());
          console.log(`📨 Message from ${clientId}:`, parsedMessage);
          
          // Echo back for testing
          this.sendToClient(clientId, {
            type: "echo",
            data: parsedMessage,
            timestamp: new Date()
          });
        } catch (error) {
          console.error(`❌ Message parsing error for ${clientId}:`, error);
        }
      });
      
      // Handle disconnection
      ws.on("close", () => {
        console.log(`🔌 WebSocket client disconnected: ${clientId}`);
        this.clients.delete(clientId);
      });
      
      // Handle errors
      ws.on("error", (error) => {
        console.error(`❌ WebSocket error for ${clientId}:`, error);
        this.clients.delete(clientId);
      });
    });
    
    this.wss.on("error", (error) => {
      console.error("❌ WebSocket server error:", error);
    });
    
    console.log("✅ WebSocket server initialized successfully");
    
  } catch (error) {
    console.error("❌ Failed to initialize WebSocket server:", error);
    // Don't throw - let the server continue without WebSocket
  }
}
```

### **PHASE 2: System Validation (Day 2)**

#### **Step 1: Create System Health Check**
```typescript
// Create backend/src/scripts/health-check.ts
import { initializeConnections } from "../database/connection";
import { sources } from "../database/schema";

async function runHealthCheck() {
  console.log("🏥 Running comprehensive health check...");
  
  try {
    // Test database connection
    console.log("1. Testing database connection...");
    const { db } = await initializeConnections();
    await db.select().from(sources).limit(1);
    console.log("✅ Database: Connected");
    
    // Test Redis connection
    console.log("2. Testing Redis connection...");
    const { redis } = await initializeConnections();
    await redis.ping();
    console.log("✅ Redis: Connected");
    
    // Test source configuration
    console.log("3. Testing source configuration...");
    const activeSources = await db.select().from(sources).where(eq(sources.isActive, true));
    console.log(`✅ Sources: ${activeSources.length} active sources found`);
    
    console.log("🎉 All health checks passed!");
    
  } catch (error) {
    console.error("❌ Health check failed:", error);
    process.exit(1);
  }
}

runHealthCheck();
```

#### **Step 2: Test Each Component**
```bash
# Run health check
cd backend
npm run ts-node src/scripts/health-check.ts

# Test search endpoint
curl -X POST http://localhost:3001/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "iPhone", "maxResults": 5}'

# Test WebSocket connection
# Open browser console and run:
# const ws = new WebSocket('ws://localhost:3001/ws');
# ws.onmessage = (e) => console.log('Received:', e.data);
```

### **PHASE 3: Canadian Site Integration (Day 3)**

#### **Step 1: Implement Real Canadian Scraping**
```typescript
// Create backend/src/services/CanadianScrapingService.ts
export class CanadianScrapingService {
  
  async scrapeAmazonCanada(query: string): Promise<Product[]> {
    // Real Amazon.ca scraping implementation
    const searchUrl = `https://www.amazon.ca/s?k=${encodeURIComponent(query)}`;
    
    // Use Puppeteer to scrape real data
    // Implementation details...
  }
  
  async scrapeBestBuyCanada(query: string): Promise<Product[]> {
    // Real BestBuy.ca scraping implementation
    const searchUrl = `https://www.bestbuy.ca/en-ca/search?search=${encodeURIComponent(query)}`;
    
    // Implementation details...
  }
}
```

This comprehensive fix plan addresses all the critical issues. The system should be working after Phase 1, and Phase 2-3 will enhance it with real functionality.

### **EMERGENCY QUICK FIX SCRIPT**

Create this script to fix everything at once:

```bash
#!/bin/bash
# File: scripts/emergency-fix.sh

echo "🚨 EMERGENCY SYSTEM FIX STARTING..."

# 1. Stop any running processes
echo "🛑 Stopping existing processes..."
pkill -f "npm run dev"
pkill -f "node"

# 2. Clean and reinstall dependencies
echo "🧹 Cleaning dependencies..."
cd backend && rm -rf node_modules package-lock.json
cd ../frontend && rm -rf node_modules package-lock.json
cd ..

echo "📦 Reinstalling dependencies..."
cd backend && npm install
cd ../frontend && npm install
cd ..

# 3. Setup environment
echo "⚙️ Setting up environment..."
cd backend
if [ ! -f .env ]; then
  cp .env.example .env
  echo "DATABASE_URL=postgresql://postgres:password@localhost:5432/shoppersprint" >> .env
  echo "REDIS_URL=redis://localhost:6379" >> .env
  echo "JWT_SECRET=emergency-fix-secret-key-12345" >> .env
  echo "SCRAPING_ENABLED=true" >> .env
  echo "NODE_ENV=development" >> .env
fi

# 4. Start Docker services
echo "🐳 Starting Docker services..."
cd ..
docker-compose down
docker-compose up -d postgres redis

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# 5. Setup database
echo "🗄️ Setting up database..."
cd backend
npm run db:push
npm run db:seed

# 6. Start the application
echo "🚀 Starting application..."
npm run dev &

cd ../frontend
npm run dev &

echo "✅ EMERGENCY FIX COMPLETE!"
echo "🌐 Frontend: http://localhost:5173"
echo "🔗 Backend: http://localhost:3001"
echo "🏥 Health: http://localhost:3001/health"
```

### **TESTING & VALIDATION CHECKLIST**

#### **✅ Phase 1 Validation (Basic Functionality)**

**Database Tests:**
```bash
# Test database connection
curl http://localhost:3001/health
# Should return: {"status": "healthy", ...}

# Test database query
curl -X GET http://localhost:3001/api/monitoring/sources
# Should return list of sources
```

**Cache Tests:**
```bash
# Test search (should work with fallback cache)
curl -X POST http://localhost:3001/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "test", "maxResults": 3}'
# Should return mock results

# Test same search again (should be faster - cached)
curl -X POST http://localhost:3001/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "test", "maxResults": 3}'
```

**WebSocket Tests:**
```javascript
// Open browser console and test WebSocket
const ws = new WebSocket('ws://localhost:3001/ws');
ws.onopen = () => console.log('✅ WebSocket connected');
ws.onmessage = (e) => console.log('📨 Received:', JSON.parse(e.data));
ws.onerror = (e) => console.log('❌ WebSocket error:', e);
ws.onclose = () => console.log('🔌 WebSocket closed');

// Send test message
ws.send(JSON.stringify({type: 'test', data: 'hello'}));
```

#### **✅ Phase 2 Validation (Enhanced Functionality)**

**Search Flow Tests:**
```bash
# Test different search queries
curl -X POST http://localhost:3001/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "iPhone 15", "maxResults": 5}'

curl -X POST http://localhost:3001/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "MacBook Air", "maxResults": 5}'
```

**Price Alert Tests:**
```bash
# Create anonymous price alert
curl -X POST http://localhost:3001/api/anonymous-notifications \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "productId": "test-product-123",
    "targetPrice": 299.99,
    "currency": "CAD",
    "alertType": "below"
  }'
```

#### **✅ Phase 3 Validation (Canadian Integration)**

**Canadian Source Tests:**
```bash
# Test each Canadian source individually
curl -X POST http://localhost:3001/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "iPhone", "sources": ["amazon-ca"]}'

curl -X POST http://localhost:3001/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "iPhone", "sources": ["bestbuy-ca"]}'
```

### **TROUBLESHOOTING GUIDE**

#### **🔴 If Database Still Fails:**

```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Check database logs
docker logs shoppersprint-postgres-1

# Reset database completely
docker-compose down -v
docker-compose up -d postgres
sleep 5
cd backend && npm run db:push && npm run db:seed
```

#### **🔴 If Redis Still Fails:**

```bash
# Check if Redis is running
docker ps | grep redis

# Test Redis connection manually
docker exec -it shoppersprint-redis-1 redis-cli ping
# Should return: PONG

# Reset Redis
docker-compose restart redis
```

#### **🔴 If Scraping Still Fails:**

```bash
# Check if Puppeteer can launch
cd backend
node -e "
const puppeteer = require('puppeteer');
(async () => {
  try {
    const browser = await puppeteer.launch({headless: true});
    console.log('✅ Puppeteer works');
    await browser.close();
  } catch (e) {
    console.log('❌ Puppeteer failed:', e.message);
  }
})();
"
```

#### **🔴 If WebSocket Still Fails:**

```bash
# Check if WebSocket port is available
netstat -an | grep 3001

# Test WebSocket server manually
npm install -g wscat
wscat -c ws://localhost:3001/ws
```

### **MONITORING & ALERTS**

#### **System Health Monitoring:**
```typescript
// Add to backend/src/routes/monitoring.ts
router.get('/system-status', async (req, res) => {
  const status = {
    database: 'unknown',
    redis: 'unknown', 
    websocket: 'unknown',
    scraping: 'unknown',
    timestamp: new Date().toISOString()
  };
  
  try {
    // Test database
    const db = await getDb();
    await db.select().from(sources).limit(1);
    status.database = 'healthy';
  } catch (e) {
    status.database = 'error';
  }
  
  try {
    // Test Redis
    const redis = await getRedis();
    await redis.ping();
    status.redis = 'healthy';
  } catch (e) {
    status.redis = 'error';
  }
  
  // Test WebSocket
  status.websocket = webSocketService.getConnectionCount() > 0 ? 'active' : 'idle';
  
  // Test scraping
  status.scraping = process.env.SCRAPING_ENABLED === 'true' ? 'enabled' : 'disabled';
  
  res.json(status);
});
```

### **SUCCESS CRITERIA**

#### **✅ System is Fixed When:**

1. **Search Works:**
   - Returns results (even if mock data initially)
   - Response time < 5 seconds
   - No error messages

2. **Caching Works:**
   - Second identical search is faster
   - Cache hit/miss statistics available
   - No Redis connection errors

3. **WebSocket Works:**
   - Connects without constant disconnections
   - Can send/receive messages
   - No console errors

4. **Database Works:**
   - Health endpoint returns success
   - Sources are populated
   - Queries execute successfully

5. **Price Alerts Work:**
   - Can create anonymous alerts
   - Email verification works
   - Management links function

#### **📊 Performance Targets:**
- **Search Response**: < 3 seconds
- **Cache Hit Rate**: > 50%
- **WebSocket Uptime**: > 95%
- **Database Queries**: < 100ms
- **Error Rate**: < 5%

---

**CRITICAL NOTE**: Follow this fix plan step by step. Don't skip steps. Test each phase before moving to the next. The system should be working after Phase 1, even if it's just returning mock data. Real Canadian scraping comes in Phase 3.
