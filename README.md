# PricePulse

A comprehensive price tracking system that monitors product prices across multiple sources in real-time. The system provides advanced search capabilities, price comparison, historical tracking, and price alerts - all without requiring user accounts or authentication.

## ✨ Key Features

- **🔍 Advanced Search**: Multi-source product search with filters and sorting
- **📊 Price Comparison**: Compare prices across different sources
- **📈 Price History**: Track price changes over time
- **🔔 Price Alerts**: Set price alerts with email notifications and browser alerts (no accounts needed)
- **🌐 Real-time Updates**: WebSocket-based live price updates
- **🤖 Web Scraping**: Automated price collection with fallback to mock data
- **💾 Caching**: Redis-powered result caching for performance
- **📱 Modern UI**: React-based responsive frontend

## 🚀 Quick Start

```bash
# Clone and setup everything
git clone https://github.com/ntanwir10/pricepulse.git
cd pricepulse
npm run setup
npm run dev
```

**Access your app:**

- Frontend: <http://localhost:5173>
- Backend API: <http://localhost:3001>
- Database: localhost:5432
- Redis: localhost:6379

## 📚 Documentation

### 🎯 Getting Started

- **[Quick Setup Guide](docs/QUICK_SETUP.md)** - Get running in minutes

### 🏗️ Architecture & Development

- **[Project Plan](docs/PROJECT_PLAN.md)** - Comprehensive project architecture and roadmap
- **[API Reference](docs/API_REFERENCE.md)** - Backend API documentation

## 🚀 Features

- **Real-time Product Search**: Search across multiple e-commerce sources simultaneously
- **Price Comparison**: Compare prices across different retailers with detailed product information
- **Smart Caching**: Redis-based caching for improved performance and reduced API calls
- **Web Scraping**: Automated scraping with rate limiting and error handling
- **Advertisement System**: Revenue-generating ad platform with analytics
- **Responsive Design**: Modern UI built with React, TypeScript, and Tailwind CSS
- **Queue Management**: Bull Queue for managing scraping jobs and price refreshes

## 🛠️ Technology Stack

### Backend

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Drizzle ORM
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
pricepulse/
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
├── docs/                    # Documentation
├── scripts/                 # Setup and utility scripts
└── docker-compose.yml       # Development environment
```

## 🎯 Available Scripts

### 🚀 Quick Reference

```bash
# Quick start
npm run setup

# Development
npm run dev

# Testing
npm run test
npm run test:watch
npm run test:coverage

# Building
npm run build:prod

# Deployment
npm run deploy

# See all available commands
npm run help
npm run scripts
```

### 🚀 Development

- `npm run dev` - Start both frontend and backend
- `npm run dev:frontend` - Start only frontend
- `npm run dev:backend` - Start only backend

### 🗄️ Database Management

- `npm run db:setup` - Complete database setup
- `npm run db:reset` - Reset databases to clean state
- `npm run db:start` - Start database containers
- `npm run db:stop` - Stop database containers

### 🏗️ Building & Testing

- `npm run build` - Build both frontend and backend
- `npm run test` - Run tests for both frontend and backend

## 🔧 Configuration

The project uses environment files for configuration:

1. **`.env.example`**: Template with placeholders (tracked in git)
2. **`.env`**: Your actual configuration (ignored by git)

**Setup Environment Files:**

```bash
npm run env:setup        # Copies .env.example to .env
# Then edit backend/.env with your real values
```

**Environment Variables to Configure:**

```env
# Database Configuration
DB_HOST=localhost          # Development: localhost, Production: your-db-host
DB_PORT=5432              # Database port
DB_USER=pricepulse        # Database username
DB_PASSWORD=pricepulse123 # Database password
DB_NAME=pricepulse        # Database name

# Redis Configuration
REDIS_URL=redis://localhost:6379  # Development: localhost, Production: your-redis-host

# Server Configuration
PORT=3001                 # Backend server port
NODE_ENV=development      # development or production
FRONTEND_URL=http://localhost:5173  # Frontend URL for CORS

# Scraping Configuration
SCRAPING_DELAY=1000       # Delay between scrapes (ms)
MAX_CONCURRENT_SCRAPES=3  # Maximum concurrent scraping jobs
SCRAPING_TIMEOUT=30000    # Scraping timeout (ms)
```

**Environment Switching:**

```bash
npm run env:dev           # Switch to development mode
npm run env:prod          # Switch to production mode
npm run env:status        # Check current environment
```

## 🧪 Testing

```bash
# Backend Tests
cd backend
npm run test

# Frontend Tests
cd frontend
npm run test
```

## 🔄 Development Workflow

### Daily Development

```bash
# Start your development environment
npm run db:start      # Start databases
npm run dev           # Start frontend + backend
```

### Common Scenarios

```bash
# Need to reset database?
npm run db:reset      # Clean reset

# Database acting weird?
npm run db:setup      # Re-setup everything

# Just want to restart databases?
npm run db:stop       # Stop
npm run db:start      # Start
```

### End of Day

```bash
# Stop everything
npm run db:stop       # Stop databases
# Or keep running if you want persistence
```

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
# Simple deployment
npm run deploy

# Manual deployment
docker-compose -f docker-compose.prod.yml up -d
```

### Production Database Setup

For production, you can use:

- **NeonDB** (PostgreSQL as a service)
- **AWS RDS** or **Google Cloud SQL**
- **Self-hosted PostgreSQL**

**Quick NeonDB Setup:**

1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy connection string to `backend/.env.production`
4. Run `npm run deploy`

### Production Safety Features

The application automatically handles production vs development behavior:

- **Mock data disabled** in production
- **Test data seeding blocked** in production
- **Stricter rate limiting** in production
- **Environment-based error handling**

## 🆘 Support

This is a personal project maintained by a single developer. For questions or issues:

- Check the documentation in the `docs/` folder
- Review the API documentation
- Check the GitHub repository for updates

## 🔮 Roadmap

### Phase 1: Foundation ✅ COMPLETED

- [x] Core architecture and project structure
- [x] Database schema and Drizzle ORM setup
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

### Phase 3: Advanced Features ✅

### Core Functionality

- [x] Web scraping workers implementation
- [x] Real-time price updates via WebSocket
- [x] Advanced search filters and sorting
- [x] Price comparison and history tracking
- [x] User authentication and accounts (NOT IMPLEMENTED - System works without user accounts)
- [x] Price alerts and notifications
- [ ] Enhanced price alerts with email notifications and browser alerts

### Technical Implementation

- [x] Puppeteer-based web scraping with fallback to mock data
- [x] WebSocket server for real-time communication
- [x] Advanced search with filtering (price, availability, rating, sources)
- [x] Search result sorting (price, rating, review count, last scraped)
- [x] Price history tracking and comparison
- [x] Anonymous price alerts and notifications (no user accounts required)
- [x] Redis caching for search results
- [x] Bull queue for background scraping tasks
- [ ] Email notification service (SendGrid/AWS SES integration)
- [ ] Browser notification system (Web Notifications API)
- [ ] Alert frequency scheduling (immediate, daily, weekly)
- [ ] Email templates for price alerts

### Phase 4: Polish and Production 📋 PLANNED

- [ ] Comprehensive testing suite
- [ ] Performance optimization and monitoring
- [ ] Security hardening and penetration testing
- [ ] CI/CD pipeline setup
- [ ] Production deployment and monitoring

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
