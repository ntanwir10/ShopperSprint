# Product Price Tracker Backend

This is the backend API for the Product Price Tracker application, built with Node.js, Express, TypeScript, PostgreSQL, and Redis.

## Features

- **Express.js** server with TypeScript
- **PostgreSQL** database with Prisma ORM
- **Redis** for caching
- **Rate limiting** and security middleware
- **CORS** configuration
- **Error handling** middleware
- **Integration tests** for database and Redis connections

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- Redis server
- npm or yarn

## Installation

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env
```

3. Update the `.env` file with your database and Redis connection strings:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/price_tracker?schema=public"
REDIS_URL="redis://localhost:6379"
```

4. Generate Prisma client:

```bash
npm run db:generate
```

5. Run database migrations (when you have a database set up):

```bash
npm run db:migrate
```

## Development

Start the development server:

```bash
npm run dev
```

The server will start on `http://localhost:3001` with hot reloading enabled.

## Testing

Run all tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Run integration tests only:

```bash
npm run test:integration
```

## Scripts

- `npm run build` - Build the TypeScript code
- `npm start` - Start the production server
- `npm run dev` - Start development server with hot reloading
- `npm test` - Run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:integration` - Run integration tests only
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Express middleware
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   ├── app.ts           # Express app configuration
│   └── index.ts         # Server entry point
├── tests/
│   ├── integration/     # Integration tests
│   └── unit/            # Unit tests
├── prisma/
│   └── schema.prisma    # Database schema
└── package.json
```

## API Endpoints

### Health Check

- `GET /health` - Server health check

More endpoints will be added as features are implemented.

## Environment Variables

| Variable                  | Description                  | Default                  |
| ------------------------- | ---------------------------- | ------------------------ |
| `DATABASE_URL`            | PostgreSQL connection string | Required                 |
| `REDIS_URL`               | Redis connection string      | `redis://localhost:6379` |
| `PORT`                    | Server port                  | `3001`                   |
| `NODE_ENV`                | Environment mode             | `development`            |
| `RATE_LIMIT_WINDOW_MS`    | Rate limit window in ms      | `900000` (15 min)        |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window      | `100`                    |
