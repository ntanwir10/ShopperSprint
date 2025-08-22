# 🎯 ShopperSprint - Core Requirements & Vision

## ⚠️ MANDATORY READ BEFORE ANY CODE CHANGES ⚠️

**Last Updated**: August 22, 2025  
**Status**: MASTER REQUIREMENTS DOCUMENT  
**Authority**: PRIMARY STAKEHOLDER REQUIREMENTS  

---

## 🚨 **CRITICAL: READ THIS FIRST**

**Before making ANY code changes, modifications, or architectural decisions:**

1. ✅ **READ** this entire document
2. ✅ **VERIFY** your changes align with these requirements
3. ✅ **CONFIRM** you're not deviating from the core vision
4. ✅ **UPDATE** this document if requirements change

**This document overrides all other documentation, analysis, or assumptions.**

---

## 🎯 **CORE VISION & BUSINESS MODEL**

### **What ShopperSprint IS:**

- **🔍 Price Comparison Platform** - Like Google Shopping for Canadian products
- **🆚 Product Comparison Tool** - Like Versus.com with side-by-side analysis
- **📈 Price Tracking Service** - Like Keepa with historical price data and alerts
- **🔗 Affiliate Marketing Platform** - Redirects users to retailer sites (monetization)

### **What ShopperSprint is NOT:**

- ❌ **E-commerce Store** - We don't sell anything
- ❌ **Shopping Cart** - No checkout or payment processing
- ❌ **Shipping Service** - No fulfillment or delivery
- ❌ **Inventory Management** - No stock management
- ❌ **International Platform** - Canada ONLY

---

## 🇨🇦 **GEOGRAPHIC SCOPE: CANADA ONLY**

### **Absolute Geographic Requirements:**

- **🎯 Target Market**: Canada exclusively
- **💰 Currency**: CAD (Canadian Dollar) only - NO other currencies
- **🌐 Sites**: Canadian e-commerce websites only
- **🚫 Restrictions**: NO US sites, NO international sites, NO other countries

### **Canadian E-commerce Sites (MANDATORY):**

1. **Amazon.ca** - Primary source
2. **BestBuy.ca** - Electronics focus
3. **Walmart.ca** - General retail
4. **Staples.ca** - Office & electronics

### **What This Means for Development:**

- All scraping targets Canadian sites (.ca domains)
- All prices displayed in CAD
- All product availability based on Canadian inventory
- All shipping references are Canadian
- All tax calculations use Canadian tax structure

---

## 🔍 **CORE USER JOURNEY (MANDATORY FLOW)**

### **Primary Search Flow (Hybrid Approach):**

```flow
User enters search term → 
Check cache (Redis) → 
If cache HIT: Return cached results → 
If cache MISS: Scrape Canadian sites → 
Store results in cache (1-hour TTL) → 
Store basic product info in database (for alerts) → 
Display price comparison with integrated ads → 
Provide "Buy Now" redirect links → 
Offer price alert setup
```

### **Search Requirements:**

1. **Cache First**: Always check Redis cache (1-hour TTL for fresh data)
2. **Scraping on Miss**: Scrape Canadian sites if cache miss
3. **Minimal Database**: Store only basic product info needed for price alerts
4. **Canadian Sites Only**: amazon.ca, bestbuy.ca, walmart.ca, staples.ca
5. **Fast Response**: Target < 3 seconds for search results
6. **Real Data**: No mock data in production
7. **Fresh Pricing**: 1-hour cache ensures recent price data

### **Database Strategy for MVP:**

```text
Store in Database:
✅ sources (scraping configurations)
✅ anonymous_price_alerts (alert system)
✅ basic product info (name, category - for alerts only)
✅ ad_analytics (ad performance tracking)

Cache Only (Redis):
✅ search results (1-hour TTL)
✅ price data (always fresh)
✅ product specifications
✅ availability information

Skip for MVP:
❌ detailed product_listings table
❌ price_history table (future enhancement)
❌ complex product relationships
```

---

## 🆚 **VERSUS.COM STYLE COMPARISON (MANDATORY FEATURE)**

### **Plus Button Functionality:**

- **📍 Location**: Next to each product in search results
- **🔍 Action**: Opens search bar to find comparison product
- **⚡ Flow**: Search → Select → Add to comparison → Side-by-side view
- **📊 Display**: Maximum 4 products in comparison (like Versus.com)

### **Comparison View Requirements:**

- **📱 Layout**: Side-by-side product cards
- **📋 Specs**: Detailed specification comparison
- **💰 Prices**: Clear price comparison with highlighting
- **🔗 Buy Links**: "Buy Now" buttons for each product/retailer
- **📈 History**: Price history charts (Keepa-style)
- **🎯 Indicators**: Visual better/worse value indicators

---

## 🔔 **PRICE ALERT SYSTEM (MANDATORY FEATURES)**

### **Alert Creation:**

- **📧 Email-Based**: No user accounts required
- **🔐 Anonymous**: Secure token-based verification
- **🎯 Flexible**: Below price, above price, percentage drop options
- **💰 CAD Only**: All target prices in Canadian dollars

### **Unified Management (CRITICAL REQUIREMENT):**

- **🎯 Single Email**: One email can have multiple product alerts
- **🔗 One Unsubscribe**: Single link unsubscribes from ALL products
- **📊 Bulk Management**: Enable/disable multiple alerts at once
- **⚙️ Global Preferences**: Unified alert frequency settings

### **Alert Management Flow:**

```flow
User sets price alert → 
Email verification → 
Alert activated → 
Price monitoring → 
Alert triggered → 
Email notification with unsubscribe link → 
Single click unsubscribes from ALL alerts
```

---

## 📈 **KEEPA-STYLE FEATURES (MANDATORY)**

### **Price History:**

- **📊 Charts**: Interactive price history graphs
- **📅 Duration**: Minimum 90 days of price data
- **🔍 Analysis**: Price trend analysis and patterns
- **📈 Forecasting**: Price prediction (future enhancement)

### **Price Tracking:**

- **⏰ Monitoring**: Continuous price monitoring
- **🚨 Alerts**: Smart alert timing based on trends
- **📊 Analytics**: Price drop frequency analysis
- **💡 Insights**: Best time to buy recommendations

---

## 🔗 **MONETIZATION MODEL**

### **Dual Revenue Strategy:**

#### **1. Affiliate Marketing (Primary Revenue):**

- **🔗 Redirect Links**: All "Buy Now" buttons redirect to retailer sites
- **💰 Commission**: Earn affiliate commissions from retailers
- **🎯 Tracking**: Track click-through rates and conversions
- **📊 Analytics**: Monitor which retailers perform best

#### **2. Display Advertising (Secondary Revenue):**

- **📱 Banner Ads**: Top and bottom of all pages
- **📋 Sidebar Ads**: Desktop layout advertising (always visible)
- **🎯 Ad Networks**: Google Ads and Facebook Ads integration
- **🇨🇦 Targeting**: Canadian-focused advertising
- **⏰ Always On**: Ads appear on every page load

### **Ad Placement Strategy (MANDATORY):**

```layout
Page Layout with Ads:
┌─────────────────────────────────┐
│        BANNER AD (Google)       │
├─────────────────┬───────────────┤
│                 │               │
│  Search Results │  SIDEBAR ADS  │
│                 │  (Facebook)   │
│  Product Cards  │               │
│                 │  SIDEBAR ADS  │
│  Comparison     │  (Google)     │
│                 │               │
├─────────────────┴───────────────┤
│        BANNER AD (Facebook)     │
└─────────────────────────────────┘
```

### **Ad Requirements:**

- **🎯 Always Visible**: Ads must appear on every page
- **📱 Responsive**: Ads adapt to mobile/desktop layouts
- **🇨🇦 Canadian Focus**: Target Canadian users and products
- **⚡ Fast Loading**: Ads don't slow down search results
- **📊 Analytics**: Track ad performance and revenue
- **🔄 A/B Testing**: Optimize ad placement and performance

### **Revenue Streams:**

1. **Affiliate Commissions**: 60-70% of revenue target
2. **Google Ads Revenue**: 20-25% of revenue target
3. **Facebook Ads Revenue**: 10-15% of revenue target
4. **Future**: Direct retailer partnerships, sponsored products

---

## 🛠️ **TECHNICAL ARCHITECTURE REQUIREMENTS**

### **Backend Stack (MANDATORY):**

- **🟢 Node.js + TypeScript**: Current implementation
- **🚀 Express.js**: Web framework
- **🗄️ PostgreSQL**: Minimal database (alerts + basic product info only)
- **🔄 Redis**: Primary data storage via caching (1-hour TTL)
- **🤖 Puppeteer**: Web scraping Canadian sites
- **🌐 WebSocket**: Real-time updates
- **📧 Email Service**: Alert notifications
- **📊 Ad Integration**: Google Ads + Facebook Ads APIs

### **Frontend Stack (MANDATORY):**

- **⚛️ React + TypeScript**: Current implementation
- **⚡ Vite**: Build tool
- **🎨 Tailwind CSS**: Styling
- **🧩 shadcn/ui**: Component library
- **📱 Ad Components**: Google AdSense + Facebook Audience Network

### **Data Architecture (HYBRID APPROACH):**

```data_arch
Cache Layer (Redis - 1 hour TTL):
├── Search Results
├── Product Prices
├── Product Specifications
└── Availability Data

Database Layer (PostgreSQL - Minimal):
├── Sources Configuration
├── Anonymous Price Alerts
├── Basic Product Info (for alerts)
└── Ad Analytics

External APIs:
├── Canadian Retailer Sites (Scraping)
├── Google Ads API
└── Facebook Ads API
```

### **Infrastructure (MANDATORY):**

- **🚂 Railway.com**: Primary deployment platform
- **🐳 Docker**: Containerization
- **🔄 GitHub Actions**: CI/CD pipeline
- **📊 Analytics**: Google Analytics + custom ad tracking

---

## 📊 **PERFORMANCE REQUIREMENTS**

### **Response Time Targets:**

- **🔍 Search Results**: < 3 seconds
- **💾 Cached Results**: < 500ms
- **🌐 Page Load**: < 2 seconds
- **📊 Comparison View**: < 1 second

### **Reliability Targets:**

- **⏰ Uptime**: 99.5% availability
- **🎯 Success Rate**: 95% successful searches
- **📧 Alert Delivery**: 99% successful notifications
- **🔄 Cache Hit Rate**: > 80%

---

## 🚫 **WHAT NOT TO BUILD**

### **Explicitly Forbidden Features:**

- ❌ **Shopping Cart**: No cart functionality
- ❌ **Checkout Process**: No payment processing
- ❌ **User Accounts**: Keep anonymous (except optional future enhancement)
- ❌ **Inventory Management**: No stock tracking
- ❌ **Shipping Calculator**: No shipping features
- ❌ **International Sites**: No non-Canadian sites
- ❌ **Currency Conversion**: CAD only, no other currencies
- ❌ **Social Features**: No reviews, comments, or social sharing initially

---

## 🎯 **SUCCESS CRITERIA**

### **MVP Success Metrics:**

- **👥 Users**: 1,000+ Canadian users in first month
- **🔍 Searches**: 10,000+ searches per month
- **🔔 Alerts**: 30% of users create price alerts
- **🆚 Comparisons**: 50% of searches lead to comparisons
- **💰 Affiliate Revenue**: Positive affiliate commission within 3 months
- **📊 Ad Revenue**: $500+ monthly ad revenue within 6 months
- **👆 Ad Engagement**: 2%+ click-through rate on ads

### **Technical Success Metrics:**

- **⚡ Performance**: All response time targets met (with ads loading)
- **🎯 Accuracy**: 99% accurate price data
- **📧 Delivery**: 99% successful alert delivery
- **🔄 Reliability**: 99.5% uptime achieved
- **📊 Ad Loading**: < 2 second ad load time
- **📱 Mobile**: 60%+ mobile traffic with responsive ads

### **Revenue Success Metrics:**

- **🔗 Affiliate**: 60-70% of total revenue from affiliate commissions
- **📊 Google Ads**: 20-25% of total revenue from Google Ads
- **📱 Facebook Ads**: 10-15% of total revenue from Facebook Ads
- **💰 Total Revenue**: $2,000+ monthly revenue within 6 months
- **📈 Growth**: 20% month-over-month revenue growth

---

## 🔄 **DEVELOPMENT PRIORITIES**

### **Phase 1: Core Functionality (IMMEDIATE)**

1. **🔧 Fix Current Issues**: Get basic system working
2. **🇨🇦 Canadian Sites**: Replace US sites with Canadian equivalents
3. **🔍 Hybrid Search Flow**: Implement cache → scraping → minimal DB storage
4. **💰 CAD Currency**: Remove USD, implement CAD-only
5. **📊 Ad Integration**: Implement Google Ads + Facebook Ads (always visible)

### **Phase 2: Comparison Features (HIGH PRIORITY)**

1. **➕ Plus Button**: Versus.com style comparison
2. **📊 Side-by-side**: Enhanced comparison view with ads
3. **🔗 Buy Links**: Redirect to retailer sites
4. **📈 Basic Price Tracking**: For alert system only

### **Phase 3: Alert System (HIGH PRIORITY)**

1. **🔔 Price Alerts**: Anonymous email-based alerts
2. **🔗 Unified Management**: Single unsubscribe system
3. **📧 Email Templates**: Professional alert emails
4. **⚙️ Preferences**: Global alert settings

### **Phase 4: Optimization (MEDIUM PRIORITY)**

1. **📊 Ad Analytics**: Optimize ad placement and revenue
2. **🎨 UI Polish**: Enhanced user experience with ads
3. **📱 Mobile**: Mobile-optimized ad layouts
4. **🚀 Performance**: Speed optimizations with ad loading

### **Phase 5: Advanced Features (LOW PRIORITY)**

1. **📈 Price History**: Full historical tracking
2. **🤖 ML Features**: Price prediction and trends
3. **🎯 Personalization**: User behavior-based recommendations
4. **📊 Advanced Analytics**: Business intelligence dashboard

---

## 📝 **CHANGE MANAGEMENT**

### **Before Making ANY Changes:**

1. **📖 Read**: This requirements document
2. **✅ Verify**: Change aligns with core vision
3. **🎯 Confirm**: Supports Canadian-only focus
4. **📊 Check**: Maintains price comparison functionality
5. **🔄 Update**: This document if requirements change

### **Requirement Change Process:**

1. **📝 Document**: Proposed change and rationale
2. **🎯 Align**: Ensure alignment with core vision
3. **✅ Approve**: Get stakeholder approval
4. **📄 Update**: Update this requirements document
5. **🔄 Implement**: Make the approved changes

---

## 🎯 **FINAL REMINDER**

**ShopperSprint is a Canadian price comparison platform that helps users find the best prices across Canadian retailers and set up price alerts. We make money through affiliate commissions when users click "Buy Now" and purchase from retailers.**

**Every feature, every line of code, every design decision must support this core mission.**

**🇨🇦 Canada Only. 💰 CAD Only. 🔗 Redirect Only. 🆚 Compare Always.**

---

**This document is the single source of truth. When in doubt, refer back to these requirements.**
