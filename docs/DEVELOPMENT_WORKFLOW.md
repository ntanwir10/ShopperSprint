# 🚀 Development Workflow

This guide covers the daily development workflow for PricePulse contributors.

## 🏁 Getting Started

### First Time Setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com/ntanwir10/pricepulse.git
   cd pricepulse
   ```

## 📅 Daily Development Workflow

### Morning Routine

```bash
# Start your development environment
npm run db:start      # Start databases
npm run dev           # Start frontend + backend
```

### During Development

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

## 🔧 Common Scenarios

### Scenario 1: New Feature Development

```bash
# Start fresh
npm run db:reset
npm run dev
# ... develop your feature
# ... test with clean data
```

### Scenario 2: Database Schema Changes

```bash
# After changing Prisma schema
cd backend
npm run db:generate
npm run db:push
npm run db:seed
# Or use the integrated script
npm run db:setup
```

### Scenario 3: Troubleshooting

```bash
# Database issues
npm run db:stop:clean    # Remove everything
npm run db:setup         # Fresh start

# Port conflicts
npm run db:stop          # Stop all
npm run db:start         # Start fresh
```

### Scenario 4: Working Across Different Machines

```bash
# Pull latest changes from your other machine
git pull origin main

# Reset to clean state
npm run db:reset

# Start development
npm run dev
```

## 🎯 Best Practices

1. **Use `npm run setup` for first-time setup**
2. **Use `npm run db:reset` when you need clean data**
3. **Use `npm run db:setup` when databases are misbehaving**
4. **Use `npm run dev` for daily development**
5. **Use `npm run db:stop` when you're done for the day**
6. **Commit your changes regularly** to keep your project history clean

## 🆘 Quick Troubleshooting

| Problem              | Solution                                     |
| -------------------- | -------------------------------------------- |
| Database won't start | `npm run db:reset`                           |
| Port already in use  | `npm run db:stop` then `npm run db:start`    |
| Data seems corrupted | `npm run db:reset`                           |
| Can't connect to DB  | `npm run db:setup`                           |
| Need fresh start     | `npm run db:stop:clean` then `npm run setup` |

## 📚 Script Reference

- **`npm run setup`** - Complete project setup
- **`npm run db:setup`** - Database setup only
- **`npm run db:reset`** - Reset databases
- **`npm run db:start`** - Start databases
- **`npm run db:stop`** - Stop databases
- **`npm run db:stop:clean`** - Stop and remove data
- **`npm run dev`** - Start development servers

Happy developing! 🎉
