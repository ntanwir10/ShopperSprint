# Dependency Migration Guide

This guide covers the migration strategy for updating ShopperSprint's deprecated dependencies.

## 🚨 Critical Security Updates (Do First)

### Backend Security Issues
- **esbuild** ≤0.24.2 - Development server vulnerability
- **tar-fs** 3.0.0-3.0.8 - Path traversal vulnerability  
- **ws** 8.0.0-8.17.0 - DoS vulnerability

### Frontend Security Issues
- **esbuild** ≤0.24.2 - Development server vulnerability

## 📋 Migration Strategy

### Phase 1: Security Fixes (Immediate)
```bash
# Fix critical security vulnerabilities
./scripts/update-dependencies.sh security all
```

### Phase 2: Safe Updates (Low Risk)
```bash
# Update patch versions
./scripts/update-dependencies.sh patch all
```

### Phase 3: Minor Updates (Moderate Risk)
```bash
# Update minor versions
./scripts/update-dependencies.sh minor backend
./scripts/update-dependencies.sh minor frontend
```

### Phase 4: Major Updates (Breaking Changes)
```bash
# Interactive major updates
./scripts/update-dependencies.sh major backend
./scripts/update-dependencies.sh major frontend
```

## 🔄 Major Breaking Changes to Handle

### Backend Breaking Changes

#### 1. Express.js 4.x → 5.x
**Changes Required:**
- Update middleware syntax
- Check route handler compatibility
- Update error handling patterns

**Migration Steps:**
```typescript
// Before (Express 4.x)
app.use(express.json());

// After (Express 5.x) - Same syntax, but check middleware compatibility
app.use(express.json());
```

#### 2. Drizzle ORM 0.29.x → 0.44.x
**Changes Required:**
- Update schema definitions
- Migrate query syntax
- Update configuration files

**Migration Steps:**
```typescript
// Update drizzle.config.ts
export default {
  schema: "./src/database/schema.ts",
  out: "./migrations",
  driver: "pg", // Updated driver syntax
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config;
```

#### 3. ESLint 8.x → 9.x
**Changes Required:**
- Update configuration format
- Migrate to flat config
- Update rule syntax

**Migration Steps:**
```javascript
// Create eslint.config.js (new format)
import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';

export default [
  js.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      '@typescript-eslint': typescript,
    },
    rules: {
      // Updated rule syntax
    },
  },
];
```

### Frontend Breaking Changes

#### 1. React 18.x → 19.x
**Changes Required:**
- Update component patterns
- Check hook compatibility
- Update testing utilities

**Migration Steps:**
```typescript
// Update React imports (if needed)
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Check for deprecated patterns
// React 19 removes some legacy features
```

#### 2. Vite 5.x → 7.x
**Changes Required:**
- Update configuration syntax
- Check plugin compatibility
- Update build scripts

**Migration Steps:**
```typescript
// Update vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Check for deprecated options
  server: {
    port: 5173,
  },
});
```

#### 3. TailwindCSS 3.x → 4.x
**Changes Required:**
- Update configuration format
- Check class compatibility
- Update build process

**Migration Steps:**
```javascript
// Update tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

## 🧪 Testing Strategy

### 1. Automated Testing
```bash
# Run comprehensive tests after each phase
npm run test
npm run type-check
npm run lint
npm run build
```

### 2. Manual Testing Checklist
- [ ] Application starts without errors
- [ ] Database connections work
- [ ] API endpoints respond correctly
- [ ] Frontend renders properly
- [ ] Authentication flows work
- [ ] WebSocket connections establish
- [ ] Search functionality works
- [ ] Price alerts function correctly

### 3. Integration Testing
```bash
# Test full application flow
npm run dev
# Verify all features work end-to-end
```

## 🔄 Rollback Strategy

### Automatic Rollback
```bash
# If updates fail, automatic rollback occurs
./scripts/update-dependencies.sh rollback
```

### Manual Rollback
```bash
# Restore from specific backup
cp .dependency-backup/YYYYMMDD_HHMMSS/package.json .
cp .dependency-backup/YYYYMMDD_HHMMSS/backend-package.json backend/package.json
cp .dependency-backup/YYYYMMDD_HHMMSS/frontend-package.json frontend/package.json
npm install
```

## 📊 Update Priority Matrix

| Package     | Current      | Latest | Risk Level | Priority | Breaking Changes   |
| ----------- | ------------ | ------ | ---------- | -------- | ------------------ |
| esbuild     | ≤0.24.2      | Latest | 🔴 High     | 1        | Security Fix       |
| tar-fs      | 3.0.0-3.0.8  | Latest | 🔴 High     | 1        | Security Fix       |
| ws          | 8.0.0-8.17.0 | Latest | 🔴 High     | 1        | Security Fix       |
| Drizzle ORM | 0.29.x       | 0.44.x | 🟡 Medium   | 2        | API Changes        |
| Express     | 4.x          | 5.x    | 🟡 Medium   | 3        | Middleware Changes |
| React       | 18.x         | 19.x   | 🟡 Medium   | 3        | Component Changes  |
| ESLint      | 8.x          | 9.x    | 🟡 Medium   | 4        | Config Format      |
| Vite        | 5.x          | 7.x    | 🟡 Medium   | 4        | Config Changes     |
| TailwindCSS | 3.x          | 4.x    | 🟡 Medium   | 5        | Class Changes      |

## 🚀 Recommended Execution Plan

### Week 1: Security & Critical Updates
```bash
# Day 1: Security fixes
./scripts/update-dependencies.sh security all

# Day 2-3: Patch updates
./scripts/update-dependencies.sh patch all

# Day 4-5: Testing and validation
npm run ci
```

### Week 2: Backend Major Updates
```bash
# Day 1-2: Drizzle ORM update
./scripts/update-dependencies.sh interactive backend
# Focus on drizzle-orm and drizzle-kit

# Day 3-4: Express.js update
# Update Express and related middleware

# Day 5: Backend testing
npm run test
```

### Week 3: Frontend Major Updates
```bash
# Day 1-2: React ecosystem update
./scripts/update-dependencies.sh interactive frontend
# Focus on React, React DOM, and related packages

# Day 3-4: Build tools update
# Update Vite, ESLint, TailwindCSS

# Day 5: Frontend testing
npm run test
```

### Week 4: Integration & Optimization
```bash
# Day 1-3: Full integration testing
npm run build
npm run dev
# Manual testing of all features

# Day 4-5: Performance optimization
# Check bundle sizes, build times
# Optimize configurations
```

## 🛠️ Tools and Resources

### Dependency Analysis Tools
```bash
# Check for outdated packages
npm outdated

# Security audit
npm audit

# Dependency tree analysis
npm ls

# Check for unused dependencies
npx depcheck
```

### Update Tools
```bash
# Interactive updates
npx npm-check-updates -i

# Automated updates
npx npm-check-updates -u

# Security-focused updates
npm audit fix
```

## 📝 Post-Update Checklist

- [ ] All tests pass
- [ ] Application builds successfully
- [ ] No security vulnerabilities remain
- [ ] Performance hasn't degraded
- [ ] All features work correctly
- [ ] Documentation updated
- [ ] Team notified of changes
- [ ] Deployment pipeline tested
- [ ] Rollback plan verified
- [ ] Monitoring alerts configured

## 🆘 Troubleshooting Common Issues

### Build Failures
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Type Errors
```bash
# Update type definitions
npm update @types/*
```

### ESLint Configuration Issues
```bash
# Migrate to new config format
npx @eslint/migrate-config .eslintrc.json
```

### Dependency Conflicts
```bash
# Check for peer dependency issues
npm ls --depth=0
```

This migration guide ensures a systematic, safe approach to updating all deprecated dependencies while maintaining application stability.
