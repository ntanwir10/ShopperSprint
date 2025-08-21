# 🛠️ Development Guide

## Daily Workflow

```bash
# Start development
npm run dev

# Make changes to code...

# Check code quality
npm run lint
npm run test
npm run typecheck

# Before committing
npm run ci
```

## Core Commands

### Development
```bash
npm run dev          # Start development environment
npm run dev:docker   # Start in full Docker mode
npm run stop         # Stop all services
npm run restart      # Restart services
npm run status       # Show service status
npm run health       # Check service health
npm run logs         # View all logs
```

### Database
```bash
npm run db:reset     # Reset database to clean state
npm run db:seed      # Add test data
```

### Code Quality
```bash
npm run test         # Run tests
npm run test:coverage # Run tests with coverage
npm run lint         # Check code style
npm run lint:fix     # Auto-fix code style issues
npm run typecheck    # Check TypeScript types
npm run build        # Build for production
npm run ci           # Run full quality pipeline
```

## Development Modes

### Hybrid Mode (Recommended)
- Infrastructure (DB, Redis) in Docker
- Apps (Frontend, Backend) run locally
- Faster development, better IDE integration

### Full Docker Mode
- Everything runs in containers
- Identical to production environment
- Better for testing deployment setup

## Project Structure

```
shoppersprint/
├── frontend/          # React frontend
├── backend/           # Node.js backend
├── scripts/           # Development scripts
├── docs/             # Documentation
├── .env              # Environment variables
├── docker-compose.yml # Docker configuration
└── package.json      # Root package file
```

## Making Changes

### Frontend Development
```bash
# Frontend runs on http://localhost:5173
# Hot reloading enabled
# Edit files in frontend/src/
```

### Backend Development
```bash
# Backend runs on http://localhost:3001
# Hot reloading enabled
# Edit files in backend/src/
```

### Database Changes
```bash
# Edit schema in backend/src/database/schema.ts
# Push changes to database
cd backend && npm run db:push
```

## Testing

```bash
# Run all tests
npm run test

# Run with coverage
npm run test:coverage

# Run specific test file
cd backend && npm test -- user.test.ts
cd frontend && npm test -- Button.test.tsx
```

## Debugging

### Backend Debugging
- Use VS Code debugger with Node.js
- Add breakpoints in TypeScript files
- Logs available via `npm run logs`

### Frontend Debugging
- Use browser dev tools
- React DevTools extension recommended
- Vite provides source maps

### Database Debugging
- Access database directly: `docker exec -it pricepulse-postgres psql -U pricepulse`
- Use PgAdmin: http://localhost:8080 (when admin profile is running)

## Common Tasks

### Adding New Features
1. Create feature branch: `git checkout -b feature/new-feature`
2. Make changes
3. Run quality checks: `npm run ci`
4. Commit and push
5. Create pull request

### Database Operations
```bash
# Reset database
npm run db:reset

# Add test data
npm run db:seed

# View database logs
docker logs pricepulse-postgres
```

### Environment Variables
```bash
# Development environment
.env                 # Local development
.env.docker         # Docker development

# Add new variables to both files
# Update .env.example for documentation
```

## Troubleshooting

### Services Won't Start
```bash
# Check Docker is running
docker --version

# Check ports aren't in use
lsof -i :5173  # Frontend port
lsof -i :3001  # Backend port
lsof -i :5432  # Database port

# Restart everything
npm run stop
npm run dev
```

### Database Connection Issues
```bash
# Check database is running
npm run status

# Reset database
npm run db:reset

# Check database logs
docker logs pricepulse-postgres
```

### Hot Reloading Not Working
```bash
# Frontend issues
cd frontend && npm run dev

# Backend issues  
cd backend && npm run dev

# Check file permissions
ls -la frontend/src/
ls -la backend/src/
```

### Build Failures
```bash
# Check TypeScript errors
npm run typecheck

# Check linting errors
npm run lint

# Clean and rebuild
rm -rf frontend/dist backend/dist
npm run build
```

## Performance Tips

### Faster Development
- Use hybrid mode for daily development
- Use Docker mode only for testing deployment
- Keep Docker Desktop running to avoid startup delays

### Faster Builds
- Use `npm run build` to verify production builds
- Frontend builds are cached by Vite
- Backend builds are incremental with TypeScript

### Database Performance
- Use `npm run db:seed` for consistent test data
- Reset database only when needed
- Use database indexes for better query performance

## IDE Setup

### VS Code (Recommended)
Install these extensions:
- TypeScript and JavaScript Language Features
- ESLint
- Prettier
- Docker
- PostgreSQL

### Settings
```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

## Git Workflow

```bash
# Daily workflow
git pull origin main
git checkout -b feature/my-feature
# Make changes...
npm run ci  # Ensure quality
git add .
git commit -m "feat: add new feature"
git push origin feature/my-feature
# Create pull request
```

## Next Steps

- Check [API Reference](API.md) for backend development
- See [Deployment Guide](DEPLOYMENT.md) for production deployment
- Review [Docker Guide](DOCKER.md) for containerization details
