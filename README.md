# Product Price Tracker

A comprehensive full-stack web application that enables users to search for products across multiple online sources and compare prices in real-time. The application scrapes and aggregates product information from various e-commerce sites, providing users with comprehensive price comparisons, sorting capabilities, and real-time price updates.

## 🚀 Features

- **Real-time Product Search**: Search across multiple e-commerce sources simultaneously
- **Price Comparison**: Compare prices across different retailers with detailed product information
- **Smart Caching**: Redis-based caching for improved performance and reduced API calls
- **Web Scraping**: Automated scraping with rate limiting and error handling
- **Advertisement System**: Revenue-generating ad platform with analytics
- **Responsive Design**: Modern UI built with React, TypeScript, and Tailwind CSS
- **Queue Management**: Bull Queue for managing scraping jobs and price refreshes

## 🏗️ Architecture

The application follows a clean, layered architecture:

```flow
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Infrastructure│
│   (React/TS)    │◄──►│   (Node/Express)│◄──►│   (PostgreSQL/  │
│                 │    │                 │    │    Redis)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Backend Architecture

- **Controllers**: Handle HTTP requests and responses
- **Services**: Business logic layer (Search, Scraping, Advertisement, Queue)
- **Repositories**: Data access layer with Prisma ORM
- **Middleware**: CORS, rate limiting, error handling, validation
- **Queue System**: Bull Queue for background job processing

### Frontend Architecture

- **Components**: Reusable UI components with shadcn/ui
- **Pages**: Main application views
- **Hooks**: Custom React hooks for state management
- **API Client**: Centralized API communication
- **Types**: Comprehensive TypeScript type definitions

## 🛠️ Technology Stack

### Backend

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Caching**: Redis
- **Queue**: Bull Queue
- **Web Scraping**: Puppeteer + Cheerio
- **Validation**: Zod schemas
- **Testing**: Vitest

### Frontend

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: React hooks
- **Testing**: Vitest + React Testing Library

### Infrastructure

- **Containerization**: Docker + Docker Compose
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **Development**: Hot reloading, TypeScript compilation

## 📁 Project Structure

```tree
price-tracker/
├── backend/                 # Backend API server
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── services/       # Business logic
│   │   ├── repositories/   # Data access layer
│   │   ├── routes/         # API route definitions
│   │   ├── middleware/     # Express middleware
│   │   ├── types/          # TypeScript type definitions
│   │   ├── config/         # Configuration files
│   │   └── utils/          # Utility functions
│   ├── prisma/             # Database schema and migrations
│   ├── tests/              # Test files
│   └── package.json
├── frontend/                # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── lib/            # Utility libraries
│   │   ├── types/          # TypeScript types
│   │   └── assets/         # Static assets
│   └── package.json
├── database/                # Database initialization scripts
├── scripts/                 # Setup and utility scripts
└── docker-compose.yml       # Development environment
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose
- Git

### Quick Start

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd price-tracker
   ```

2. **Start the development environment**

   ```bash
   docker-compose up -d
   ```

3. **Install dependencies**

   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

4. **Set up the database**

   ```bash
   cd backend
   npm run db:generate
   npm run db:push
   npm run db:seed
   ```

5. **Start the development servers**

   ```bash
   # Backend (in backend directory)
   npm run dev
   
   # Frontend (in frontend directory, new terminal)
   npm run dev
   ```

6. **Access the application**
   - Frontend: <http://localhost:5173>
   - Backend API: <http://localhost:3001>
   - Database: localhost:5432
   - Redis: localhost:6379

## 🔧 Configuration

### Environment Variables

Create `.env` files in both `backend/` and `frontend/` directories:

**Backend (.env)**

```env
NODE_ENV=development
PORT=3001
DATABASE_URL="postgresql://price_tracker_user:price_tracker_password@localhost:5432/price_tracker"
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

**Frontend (.env)**

```env
VITE_API_URL=http://localhost:3001/api
```

## 📊 API Endpoints

### Search API

- `POST /api/search` - Search for products
- `GET /api/search/:id` - Get search results by ID
- `POST /api/search/refresh-prices` - Refresh product prices
- `GET /api/search/status/:jobId` - Get job status

### Advertisement API

- `GET /api/ads` - Get advertisements
- `POST /api/ads/track` - Track ad events
- `GET /api/ads/stats/:adId` - Get ad statistics
- `GET /api/ads/stats` - Get overall ad statistics

### Health Check

- `GET /health` - Application health status

## 🧪 Testing

### Backend Tests

```bash
cd backend
npm run test              # Run all tests
npm run test:watch        # Watch mode
npm run test:integration  # Integration tests only
```

### Frontend Tests

```bash
cd frontend
npm run test              # Run all tests
npm run test:watch        # Watch mode
```

## 📈 Performance Features

- **Redis Caching**: 15-minute cache for search results
- **Rate Limiting**: API rate limiting to prevent abuse
- **Queue Processing**: Background job processing for scraping
- **Database Optimization**: Proper indexing and connection pooling
- **Frontend Optimization**: Code splitting and lazy loading

## 🔒 Security Features

- **Input Validation**: Zod schema validation for all inputs
- **Rate Limiting**: Prevents API abuse
- **CORS Configuration**: Proper cross-origin resource sharing
- **Helmet**: Security headers middleware
- **Error Handling**: Comprehensive error handling without information leakage

## 🚀 Deployment

### Production Build

```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
```

### Docker Deployment

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 🆘 Support

For support and questions:

- Create an issue in the GitHub repository
- Check the documentation in the `docs/` folder
- Review the API documentation

## 🔮 Roadmap

### Phase 1: Foundation ✅ COMPLETED
- [x] Core architecture and project structure
- [x] Database schema and Prisma ORM setup
- [x] Basic Express.js backend with TypeScript
- [x] React frontend with TypeScript and Tailwind CSS
- [x] Docker development environment
- [x] Basic API endpoints and validation

### Phase 2: Core Functionality ✅ COMPLETED
- [x] Product search and scraping infrastructure
- [x] Repository pattern and service layer
- [x] Redis caching system
- [x] Bull Queue for background jobs
- [x] Advertisement system with analytics
- [x] Comprehensive error handling and validation

### Phase 3: Advanced Features 🚧 IN PROGRESS
- [ ] Web scraping workers implementation
- [ ] Real-time price updates via WebSocket
- [ ] Advanced search filters and sorting
- [ ] Price comparison and history tracking
- [ ] User authentication and accounts
- [ ] Price alerts and notifications

### Phase 4: Polish and Production 📋 PLANNED
- [ ] Comprehensive testing suite (Vitest + Playwright)
- [ ] Performance optimization and monitoring
- [ ] Security hardening and penetration testing
- [ ] CI/CD pipeline setup
- [ ] Production deployment and monitoring
- [ ] Documentation and API reference

### Future Enhancements (V2+)
- [ ] Browser extension for Chrome and Firefox
- [ ] Mobile application (iOS and Android)
- [ ] AI-powered product recommendations
- [ ] Advanced analytics dashboard
- [ ] Multi-language and localization support
- [ ] Multi-tenant white-label solutions
- [ ] Public API for third-party integrations
- [ ] Advanced A/B testing capabilities

## Database Options Comparison for MVP

### Overview

This section compares three popular database-as-a-service options for the price tracker MVP: **Neon**, **Supabase**, and **Firebase**. Each has different strengths and trade-offs for our specific use case.

---

## 🚀 Neon (PostgreSQL)

### **Pricing**

- **Free Tier**: $0/month
  - 3GB database storage
  - 10GB storage
  - 100 hours compute time
  - Auto-scales to zero when not used
- **Pro Plan**: $0.12/hour (pay-per-use)
  - Scales automatically based on usage
  - Only pay for actual compute time

### **Technical Stack**

- **Database**: PostgreSQL 15+
- **Compatibility**: 100% compatible with our Prisma setup
- **Architecture**: Serverless, auto-scaling
- **Regions**: Multiple global regions available

### **Pros**

✅ **Largest free tier** (3GB vs competitors' 500MB-1GB)  
✅ **Serverless PostgreSQL** - scales to zero when not used  
✅ **Branching** - create test databases easily  
✅ **Pay-per-use scaling** - only pay when you need more  
✅ **Same Prisma integration** - no code changes needed  
✅ **Auto-scaling** - handles traffic spikes automatically  
✅ **PostgreSQL compatibility** - industry standard  

### **Cons**

❌ **Pay-per-use can be unpredictable** for high-traffic apps  
❌ **Less built-in features** compared to Firebase/Supabase  
❌ **Newer service** - smaller community than Firebase  

### **Best For**

- **MVP development** with generous free tier
- **PostgreSQL-based apps** (like ours)
- **Cost-conscious scaling** - pay only for what you use
- **Serverless architecture** preference

---

## 🔥 Supabase (PostgreSQL)

### **Pricing**

- **Free Tier**: $0/month
  - 500MB database
  - 50,000 monthly active users
  - 2GB bandwidth
  - 1GB file storage
- **Pro Plan**: $25/month
  - 8GB database
  - 100,000 monthly active users
  - 250GB bandwidth

### **Technical Stack**

- **Database**: PostgreSQL 15+
- **Compatibility**: 100% compatible with our Prisma setup
- **Architecture**: Traditional hosted database
- **Additional Services**: Auth, Storage, Edge Functions

### **Pros**

✅ **Built-in authentication** system  
✅ **Real-time subscriptions** out of the box  
✅ **File storage** included  
✅ **Edge functions** for serverless logic  
✅ **Excellent dashboard** and developer experience  
✅ **Active community** and documentation  
✅ **PostgreSQL compatibility** - no code changes needed  

### **Cons**

❌ **Smaller free tier** (500MB vs Neon's 3GB)  
❌ **Fixed pricing tiers** - less flexible scaling  
❌ **More features than we need** for MVP  
❌ **$25/month jump** when scaling from free tier  

### **Best For**

- **Full-stack apps** needing auth and storage
- **Real-time features** requirement
- **Traditional hosting** preference
- **Feature-rich development** experience

---

## 🔥 Firebase (NoSQL)

### **Pricing**

- **Free Tier**: $0/month
  - 1GB database storage
  - 50,000 reads/day
  - 20,000 writes/day
  - 20,000 deletes/day
- **Pay-as-you-go**: $0.18/GB/month + $0.06/100K reads + $0.18/100K writes

### **Technical Stack**

- **Database**: Firestore (NoSQL document database)
- **Compatibility**: **Requires complete rewrite** of our Prisma schema
- **Architecture**: Document-based, real-time by default
- **Additional Services**: Auth, Storage, Functions, Hosting

### **Pros**

✅ **Google's infrastructure** - very reliable  
✅ **Real-time by default** - great for live updates  
✅ **Generous free tier** for reads/writes  
✅ **Excellent mobile SDKs**  
✅ **Built-in hosting** and CDN  
✅ **Strong ecosystem** and community  

### **Cons**

❌ **NoSQL database** - requires complete schema rewrite  
❌ **Different query language** - not SQL  
❌ **Complex pricing** - can get expensive quickly  
❌ **Vendor lock-in** - harder to migrate away  
❌ **No Prisma support** - need to rewrite data layer  
❌ **Different data modeling** approach  

### **Best For**

- **Mobile-first apps**
- **Real-time heavy applications**
- **Google ecosystem** preference
- **NoSQL architecture** preference

---

## 📊 Feature Comparison Matrix

| Feature                  | Neon          | Supabase     | Firebase          |
| ------------------------ | ------------- | ------------ | ----------------- |
| **Free Tier Storage**    | 3GB           | 500MB        | 1GB               |
| **Database Type**        | PostgreSQL    | PostgreSQL   | NoSQL (Firestore) |
| **Prisma Compatibility** | ✅ 100%        | ✅ 100%       | ❌ 0%              |
| **Real-time**            | ✅ (WebSocket) | ✅ (Built-in) | ✅ (Default)       |
| **Authentication**       | ❌ (DIY)       | ✅ (Built-in) | ✅ (Built-in)      |
| **File Storage**         | ❌ (DIY)       | ✅ (Built-in) | ✅ (Built-in)      |
| **Scaling Model**        | Pay-per-use   | Fixed tiers  | Pay-per-use       |
| **Setup Complexity**     | Easy          | Easy         | Medium            |
| **Migration Path**       | Smooth        | Smooth       | Complete rewrite  |

---

## 🎯 Recommendation for Price Tracker MVP

### **🏆 WINNER: Neon**

**Why Neon is the best choice:**

1. **Largest Free Tier**: 3GB vs 500MB (Supabase) vs 1GB (Firebase)
2. **Zero Code Changes**: Works with existing Prisma setup
3. **Cost-Effective Scaling**: Pay only for what you use
4. **PostgreSQL**: Industry standard, excellent for price tracking data
5. **Serverless**: Scales to zero when not in use

### **Migration Path:**

- **Phase 1**: Start with Neon free tier (3GB)
- **Phase 2**: Scale with pay-per-use as ad revenue grows
- **Phase 3**: Consider self-hosted PostgreSQL if costs become significant

### **Setup Time:**

- **Neon**: 5 minutes (copy-paste connection string)
- **Supabase**: 5 minutes (copy-paste connection string)
- **Firebase**: 2-3 days (complete schema rewrite)

---

## 💰 Cost Projection

### **Neon (Recommended)**

- **Month 1-6**: $0/month (free tier)
- **Month 7-12**: $5-15/month (as traffic grows)
- **Year 2+**: $20-50/month (with ad revenue)

### **Supabase**

- **Month 1-6**: $0/month (free tier)
- **Month 7+**: $25/month (Pro plan required)
- **Year 2+**: $25/month (fixed cost)

### **Firebase**

- **Month 1-6**: $0/month (free tier)
- **Month 7+**: $10-30/month (unpredictable)
- **Year 2+**: $30-100/month (can spike with usage)

---

## 🔄 Migration Strategy

### **If Starting with Neon:**

- **No migration needed** - PostgreSQL compatible
- **Easy to switch** to Supabase later if needed
- **Can export data** to self-hosted PostgreSQL

### **If Starting with Supabase:**

- **Easy migration** to Neon (same PostgreSQL)
- **Can export data** to self-hosted PostgreSQL

### **If Starting with Firebase:**

- **Complete rewrite** required for any SQL database
- **Data migration** complex and time-consuming
- **High migration cost** in development time

---

## 🎯 Final Verdict

**For your price tracker MVP, Neon is the clear winner:**

- ✅ **$0/month to start** with generous 3GB limit
- ✅ **Zero development overhead** - works with existing code
- ✅ **Cost-effective scaling** - pay only for what you use
- ✅ **Professional PostgreSQL** - industry standard
- ✅ **Easy migration path** to other PostgreSQL services

**Start with Neon, scale with ad revenue, and never look back!** 🚀
