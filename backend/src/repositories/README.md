# Repository Pattern Implementation

This directory contains the repository pattern implementation for the Product Price Tracker application. The repository pattern provides a clean abstraction layer between the business logic and data access logic.

## Architecture

### Interfaces

- `interfaces.ts` - Defines the contracts for all repository operations
- Each repository interface extends a base repository with common CRUD operations
- Specialized methods are added for domain-specific queries

### Implementations

- `ProductRepository.ts` - Handles product data operations
- `ProductListingRepository.ts` - Manages product listings from different sources
- `SearchRepository.ts` - Manages search history and results
- `SourceRepository.ts` - Handles scraping source configuration and monitoring

### Factory Pattern

- `RepositoryFactory` - Creates repository instances with dependency injection
- Ensures consistent Prisma client usage across all repositories

## Usage

### Basic Setup

```typescript
import { PrismaClient } from "@prisma/client";
import { RepositoryFactory } from "./repositories/index.js";

const prisma = new PrismaClient();
const repositoryFactory = new RepositoryFactory(prisma);

// Create repository instances
const productRepo = repositoryFactory.createProductRepository();
const listingRepo = repositoryFactory.createProductListingRepository();
const searchRepo = repositoryFactory.createSearchRepository();
const sourceRepo = repositoryFactory.createSourceRepository();
```

### Product Operations

```typescript
// Create a new product
const product = await productRepo.create({
  name: "iPhone 15 Pro",
  normalizedName: "iphone 15 pro",
  category: "Electronics",
  specifications: {
    brand: "Apple",
    storage: "128GB",
  },
});

// Search for products
const searchResults = await productRepo.search("iPhone");

// Find by category
const electronics = await productRepo.findByCategory("Electronics");
```

### Product Listing Operations

```typescript
// Create a product listing
const listing = await listingRepo.create({
  productId: product.id,
  sourceId: source.id,
  url: "https://example.com/product/123",
  price: 999.99,
  currency: "USD",
  availability: "in_stock",
  isValid: true,
});

// Find listings for a product
const productListings = await listingRepo.findByProductId(product.id);

// Update last scraped timestamp
await listingRepo.updateLastScraped(listing.id);
```

### Source Management

```typescript
// Create a scraping source
const source = await sourceRepo.create({
  name: "Amazon",
  category: "popular",
  isActive: true,
  configuration: {
    baseUrl: "https://amazon.com",
    searchPath: "/s?k=",
    selectors: {
      productName: ".product-name",
      price: ".price",
      availability: ".availability",
      image: ".image",
    },
    rateLimit: {
      requestsPerMinute: 30,
      concurrent: 2,
    },
  },
});

// Update source metrics
await sourceRepo.updateLastSuccessfulScrape(source.id);
await sourceRepo.updateAverageResponseTime(source.id, 1500);
```

### Search History

```typescript
// Create a search record
const search = await searchRepo.create({
  query: "iPhone 15 Pro",
  userId: "user123",
  metadata: {
    totalSources: 4,
    successfulSources: 3,
    searchDuration: 2.5,
    cacheHit: false,
  },
});

// Find recent searches
const recentSearches = await searchRepo.findRecent(10);
```

## Data Validation

All repository operations use Zod schemas for data validation:

- Input data is validated before database operations
- Type safety is enforced through TypeScript interfaces
- Validation errors are thrown for invalid data

## Error Handling

Repositories handle common error scenarios:

- **Not Found**: Returns `null` for single item queries, empty arrays for collections
- **Validation Errors**: Throws validation errors for invalid input data
- **Database Errors**: Returns `null` or `false` for failed operations
- **Constraint Violations**: Handled gracefully with appropriate error responses

## Testing

The repository pattern enables easy testing through:

- **Interface Mocking**: Mock repository interfaces for unit tests
- **Dependency Injection**: Inject test database instances
- **Isolated Testing**: Test business logic separately from database operations

## Database Seeding

Use the seed script to populate the database with sample data:

```bash
npm run db:seed
```

This creates:

- Sample sources (Amazon, Best Buy, Newegg, B&H Photo)
- Sample products (iPhone, Samsung Galaxy, Sony Headphones, MacBook)
- Product listings with realistic pricing data
- Sample search records

## Performance Considerations

- **Indexing**: Database indexes are configured for common query patterns
- **Pagination**: Large result sets should implement pagination
- **Caching**: Consider caching frequently accessed data
- **Connection Pooling**: Prisma handles connection pooling automatically

## Future Enhancements

- **Soft Deletes**: Implement soft delete functionality for audit trails
- **Audit Logging**: Track changes to critical data
- **Bulk Operations**: Add bulk insert/update operations for performance
- **Query Optimization**: Add query analysis and optimization tools
