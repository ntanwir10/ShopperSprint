# 🧪 Testing Strategy & Implementation

This document provides comprehensive information about the testing strategy and implementation for the PricePulse Backend. Our testing approach follows industry best practices and ensures code quality, reliability, and maintainability.

## Testing Strategy

### Testing Pyramid

We follow the testing pyramid approach:

```tree
    /\
   /  \     E2E Tests (Few)
  /____\    Integration Tests (Some)
 /      \   Unit Tests (Many)
/________\  Base
```

- **Unit Tests**: Test individual functions and methods in isolation
- **Integration Tests**: Test interactions between components
- **API Tests**: Test HTTP endpoints and request/response handling
- **E2E Tests**: Test complete user workflows (future implementation)

### Test Coverage Goals

- **Unit Tests**: > 90% coverage
- **Integration Tests**: > 80% coverage
- **Overall Coverage**: > 85% coverage

## Test Structure

### Directory Organization

```tree
src/
├── __tests__/           # Unit tests for services
│   ├── notificationService.test.ts
│   ├── searchService.test.ts
│   ├── websocketService.test.ts
│   ├── priceHistoryService.test.ts
│   ├── advertisementService.test.ts
│   └── scrapingService.test.ts
├── repositories/
│   └── __tests__/       # Repository tests
│       ├── productRepository.test.ts
│       └── sourceRepository.test.ts
├── routes/
│   └── __tests__/       # API route tests
│       ├── search.test.ts
│       └── notifications.test.ts
└── test/                 # Test utilities and setup
    └── setup.ts
```

### Test File Naming Convention

- Unit tests: `*.test.ts`
- Integration tests: `*.integration.test.ts`
- E2E tests: `*.e2e.test.ts`

## Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests for CI/CD
npm run test:ci
```

### Using the Test Runner Script

```bash
# Make script executable (first time only)
chmod +x scripts/run-tests.sh

# Run all tests
./scripts/run-tests.sh

# Run only unit tests
./scripts/run-tests.sh -t unit

# Run tests with coverage
./scripts/run-tests.sh -c

# Run tests in watch mode
./scripts/run-tests.sh -w

# Run tests matching a pattern
./scripts/run-tests.sh -p notification

# Combine options
./scripts/run-tests.sh -t unit -c -v
```

### Test Runner Options

| Option | Long Option  | Description                                 |
| ------ | ------------ | ------------------------------------------- |
| `-t`   | `--type`     | Test type: all, unit, integration, api, e2e |
| `-w`   | `--watch`    | Run tests in watch mode                     |
| `-c`   | `--coverage` | Generate coverage report                    |
| `-v`   | `--verbose`  | Verbose output                              |
| `-p`   | `--pattern`  | Run tests matching pattern                  |
| `-h`   | `--help`     | Show help message                           |

## Test Categories

### 1. Unit Tests

Unit tests focus on testing individual functions and methods in isolation. They should be fast, reliable, and easy to maintain.

#### Service Tests

- **NotificationService**: Tests for price alerts, preferences, and quiet hours logic
- **SearchService**: Tests for search functionality, filtering, and sorting
- **WebSocketService**: Tests for real-time communication handling
- **PriceHistoryService**: Tests for price tracking and analysis
- **AdvertisementService**: Tests for ad management and targeting
- **ScrapingService**: Tests for web scraping functionality

#### Repository Tests

- **ProductRepository**: Tests for product CRUD operations
- **SourceRepository**: Tests for source management

### 2. API Tests

API tests verify that HTTP endpoints work correctly and handle various scenarios properly.

#### Search API Tests

- POST `/api/search`: Create new searches with filters and sorting
- GET `/api/search`: Handle query parameters and validation
- Error handling for invalid requests

#### Notifications API Tests

- POST `/api/notifications/alerts`: Create price alerts
- GET `/api/notifications/alerts`: Retrieve all alerts
- PUT `/api/notifications/alerts/:id`: Update alerts
- DELETE `/api/notifications/alerts/:id`: Delete alerts
- GET/PUT `/api/notifications/preferences`: Manage preferences
- GET `/api/notifications/stats`: Get statistics

### 3. Integration Tests

Integration tests verify that components work together correctly.

- Service-to-repository interactions
- API-to-service communication
- Database operations with real schemas

## Test Configuration

### Jest Configuration

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts',
    '!src/database/migrations/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  testTimeout: 10000,
  verbose: true,
  clearMocks: true,
  restoreMocks: true,
};
```

### Test Environment Setup

```typescript
// src/test/setup.ts
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set test environment
process.env['NODE_ENV'] = 'test';

// Mock console methods to reduce noise in tests
const originalConsole = { ...console };
beforeAll(() => {
  console.log = jest.fn();
  console.info = jest.fn();
  console.warn = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  console.log = originalConsole.log;
  console.info = originalConsole.info;
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;
});

// Global test utilities
declare global {
  var testUtils: {
    createMockRequest: (overrides?: any) => any;
    createMockResponse: () => any;
    createMockNext: () => jest.Mock;
  };
}

global.testUtils = {
  // Helper to create mock Express request
  createMockRequest: (overrides = {}) => ({
    body: {},
    params: {},
    query: {},
    headers: {},
    ...overrides,
  }),

  // Helper to create mock Express response
  createMockResponse: () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res;
  },

  // Helper to create mock Express next function
  createMockNext: () => jest.fn(),
};
```

## Mocking Strategy

### Service Mocking

Services are mocked using Jest's mocking capabilities:

```typescript
// Mock the service
jest.mock('../../services/notificationService');

// Create mock instance
let mockNotificationService: jest.Mocked<NotificationService>;

beforeEach(() => {
  mockNotificationService = {
    createPriceAlert: jest.fn(),
    getAllAlerts: jest.fn(),
    // ... other methods
  } as any;
});
```

### Database Mocking

Database operations are mocked to avoid external dependencies:

```typescript
// Mock database connection
jest.mock('../../database/connection', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    from: jest.fn(),
  },
}));
```

### WebSocket Mocking

WebSocket functionality is mocked for testing:

```typescript
// Mock ws module
jest.mock('ws');

// Create mock WebSocket server
const mockServer = {
  on: jest.fn(),
};
```

## Test Data Management

### Mock Data Generation

Test data is generated programmatically to ensure consistency:

```typescript
const mockProduct = {
  id: 'test_product_id',
  name: 'Test Product',
  price: 25000,
  currency: 'USD',
  availability: 'in_stock',
  // ... other properties
};
```

### Test Data Cleanup

Tests clean up after themselves to avoid interference:

```typescript
beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  // Clean up any test data
});
```

## Best Practices

### Test Organization

1. **Arrange-Act-Assert Pattern**: Structure tests with clear sections
2. **Descriptive Test Names**: Use clear, descriptive test names
3. **Single Responsibility**: Each test should test one thing
4. **Independent Tests**: Tests should not depend on each other

### Test Writing Guidelines

1. **Setup**: Use `beforeEach` for common setup
2. **Teardown**: Use `afterEach` for cleanup
3. **Mocks**: Mock external dependencies
4. **Assertions**: Use specific assertions with clear messages
5. **Error Testing**: Test both success and failure scenarios

### Performance Considerations

1. **Fast Execution**: Unit tests should run quickly
2. **Parallel Execution**: Tests should be able to run in parallel
3. **Resource Management**: Clean up resources after tests
4. **Mocking**: Use mocks for slow operations

## Coverage Reports

### Coverage Types

- **Statements**: Percentage of statements executed
- **Branches**: Percentage of branches executed
- **Functions**: Percentage of functions called
- **Lines**: Percentage of lines executed

### Coverage Thresholds

```javascript
coverageThreshold: {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80,
  },
}
```

### Viewing Coverage

After running tests with coverage:

```bash
# Open coverage report in browser
open coverage/lcov-report/index.html

# View coverage in terminal
npm run test:coverage
```

## Continuous Integration

### CI/CD Pipeline

Tests are automatically run in CI/CD:

```yaml
# Example GitHub Actions workflow
- name: Run Tests
  run: |
    cd backend
    npm run test:ci
```

### Pre-commit Hooks

Consider adding pre-commit hooks to run tests:

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm test"
    }
  }
}
```

## Troubleshooting

### Common Issues

1. **Test Timeouts**: Increase `testTimeout` in Jest config
2. **Memory Issues**: Use `--max-old-space-size` for Node.js
3. **Mock Issues**: Ensure mocks are properly set up
4. **Environment Issues**: Check `.env.test` configuration

### Debugging Tests

```bash
# Run specific test with verbose output
npm test -- --verbose --testNamePattern="should create price alert"

# Run tests in debug mode
node --inspect-brk node_modules/.bin/jest --runInBand
```

## Future Enhancements

### Planned Testing Features

1. **E2E Tests**: Complete user workflow testing
2. **Performance Tests**: Load testing and benchmarking
3. **Security Tests**: Penetration testing and vulnerability scanning
4. **Visual Regression Tests**: UI consistency testing

### Testing Tools

1. **Playwright**: For E2E testing
2. **Artillery**: For load testing
3. **OWASP ZAP**: For security testing
4. **Storybook**: For component testing

## 🎯 Conclusion

This testing strategy ensures that our PricePulse Backend is robust, reliable, and maintainable. By following these guidelines and best practices, we can maintain high code quality and catch issues early in the development process.

For questions or suggestions about testing, please refer to the development team or create an issue in the project repository.
