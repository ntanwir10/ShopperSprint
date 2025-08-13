# Frontend - Product Price Tracker

React frontend application for the Product Price Tracker.

## Technology Stack

- **React 19** with TypeScript
- **Vite** for build tooling and development server
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **ESLint** and **Prettier** for code quality

## Project Structure

```
src/
├── components/     # React components
│   └── ui/        # shadcn/ui components
├── pages/         # Page components
├── lib/           # Utility functions and API client
└── types/         # TypeScript type definitions
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - Run TypeScript type checking

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Open [http://localhost:5173](http://localhost:5173) in your browser

## Development

The application follows a component-based architecture with:

- Type-safe API client in `src/lib/api.ts`
- Shared TypeScript interfaces in `src/types/index.ts`
- Reusable UI components using shadcn/ui
- Responsive design with Tailwind CSS

## API Integration

The frontend communicates with the backend API running on `http://localhost:3001`. API endpoints include:

- `POST /api/search` - Search for products
- `POST /api/refresh-prices` - Refresh product prices
- WebSocket connection for real-time updates
