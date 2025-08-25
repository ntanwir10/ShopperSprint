# 🏗️ ShopperSprint Script Architecture & Reference Guide

## **🤔 Why Multiple Scripts? The Smart Modular Approach**

### **The Problem We Solved**

**Before (Multiple Independent Scripts):**

- 4 separate scripts with overlapping functionality
- No clear hierarchy or interlinking
- Developers confused about which script to use
- Duplication of common functions
- Complex maintenance and debugging

**After (Smart Modular System):**

- 1 main orchestrator script with clear interface
- 4 focused modules with single responsibilities
- Smart interlinking and dependency management
- Shared utilities and consistent patterns
- Easy to understand and maintain

## **🎯 Architecture Principles**

### **1. Single Entry Point**

- **One main script**: `./scripts/shoppersprint.sh`
- **Unified interface**: All operations go through one command
- **Consistent experience**: Same patterns for all operations

### **2. Smart Modularity**

- **Modules directory**: `./scripts/modules/`
- **Focused responsibilities**: Each module does one thing well
- **Intelligent delegation**: Main script routes to appropriate modules

### **3. Smart Interlinking**

- **Dependency detection**: Automatically starts required services
- **Change detection**: Knows when to deploy vs. skip
- **Workflow orchestration**: Coordinates complex operations

## **🏗️ Complete System Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                    shoppersprint.sh                         │
│                 (Main Orchestrator)                        │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ├─┬─ modules/                              # 🏗️ Core Functional Modules
                  │ ├─┬─ service-manager.sh    (Service Lifecycle)
                  │ │ ├─ start, stop, restart, status, logs
                  │ │ └─ Individual service control
                  │ │
                  │ ├─┬─ monorepo-build.sh     (Build System)
                  │ │ ├─ build, validate, setup, clean
                  │ │ └─ Comprehensive build pipeline
                  │ │
                  │ ├─┬─ enhanced-deploy.sh    (Deployment)
                  │ │ ├─ deploy, rollback, status, logs
                  │ │ └─ Smart deployment with change detection
                  │ │
                  │ └─┬─ quality-deploy.sh     (Quality Assurance)
                  │   ├─ quality checks, validation
                  │   └─ Pre-deployment quality gates
                  │
                  └─┬─ [Integrated Commands]                  # 🛠️ Specialized Utilities
                    ├─┬─ deploy               (Deployment)
                    ├─┬─ env:switch           (Environment switching)
                    ├─┬─ deps:update          (Dependency updates)
                    ├─┬─ railway:build        (Railway-specific build)
                    ├─┬─ env:validate         (Environment validation)
                    ├─┬─ assets:generate      (Asset generation)
                    └─┬─ dns:check            (DNS verification)
```

## **🔧 How It All Fits Together**

### **1. Core Functional Modules (in modules/)**

These handle the main development and deployment workflows:

- **`service-manager.sh`**: Service lifecycle management
- **`monorepo-build.sh`**: Build and validation system
- **`enhanced-deploy.sh`**: Smart deployment system
- **`quality-deploy.sh`**: Quality assurance

### **2. Integrated Commands (in shoppersprint.sh)**

These are specialized utilities that are **built into** the main system:

- **`deploy`** → `shoppersprint.sh deploy`
- **`env:switch`** → `shoppersprint.sh env:switch [env]`
- **`deps:update`** → `shoppersprint.sh deps:update`
- **`env:validate`** → `shoppersprint.sh env:validate`
- **`railway:build`** → `shoppersprint.sh railway:build`
- **`assets:generate`** → `shoppersprint.sh assets:generate`
- **`dns:check`** → `shoppersprint.sh dns:check`

## **🚀 Complete Command Reference**

### **Development Commands**

```bash
./scripts/shoppersprint.sh dev [service]        # Start development environment
./scripts/shoppersprint.sh build [service]      # Build application(s)
./scripts/shoppersprint.sh test [service]       # Run tests
./scripts/shoppersprint.sh validate             # Run all validations
./scripts/shoppersprint.sh clean [service]      # Clean build artifacts
```

### **Deployment Commands**

```bash
./scripts/shoppersprint.sh deploy [service]     # Deploy to Railway
./scripts/shoppersprint.sh deploy:full          # Quality + build + deploy pipeline
./scripts/shoppersprint.sh deploy:rollback      # Rollback deployment
./scripts/shoppersprint.sh deploy:status        # Check deployment status
```

### **Service Management Commands**

```bash
./scripts/shoppersprint.sh start [service]      # Start service(s)
./scripts/shoppersprint.sh stop [service]       # Stop service(s)
./scripts/shoppersprint.sh restart [service]    # Restart service(s)
./scripts/shoppersprint.sh status [service]     # Show service status
./scripts/shoppersprint.sh logs [service]       # Show service logs
```

### **Dependency Management Commands**

```bash
./scripts/shoppersprint.sh deps:check           # Check for updates
./scripts/shoppersprint.sh deps:update          # Update dependencies
./scripts/shoppersprint.sh deps:audit           # Security audit
```

### **Environment Management Commands**

```bash
./scripts/shoppersprint.sh env:switch [env]     # Switch environment (dev/production)
./scripts/shoppersprint.sh env:validate         # Validate environment configuration
```

### **Specialized Utility Commands**

```bash
./scripts/shoppersprint.sh railway:build        # Build for Railway deployment
./scripts/shoppersprint.sh assets:generate      # Generate favicon and assets
./scripts/shoppersprint.sh dns:check            # Check DNS propagation
```

## **📦 Package.json Integration**

All commands are available through npm scripts:

```json
{
  "scripts": {
    "dev": "./scripts/shoppersprint.sh dev",
    "build": "./scripts/shoppersprint.sh build",
    "test": "./scripts/shoppersprint.sh test",
    "deploy": "./scripts/shoppersprint.sh deploy",
    "start": "./scripts/shoppersprint.sh start",
    "stop": "./scripts/shoppersprint.sh stop",
    "env:validate": "./scripts/shoppersprint.sh env:validate",
    "railway:build": "./scripts/shoppersprint.sh railway:build",
    "dns:check": "./scripts/shoppersprint.sh dns:check"
  }
}
```

## **🔄 Migration Path from Old System**

### **Old Commands → New Commands**

```bash
# Old way
./scripts/deploy.sh
./scripts/switch-env.sh production
./scripts/update-dependencies.sh
./scripts/validate-env.sh

# New way (unified)
./scripts/shoppersprint.sh deploy
./scripts/shoppersprint.sh env:switch production
./scripts/shoppersprint.sh deps:update
./scripts/shoppersprint.sh env:validate
```

### **Benefits of Migration**

- ✅ **Single command to learn**: `./scripts/shoppersprint.sh`
- ✅ **Consistent interface**: All operations follow same pattern
- ✅ **Smart automation**: Automatic dependency detection
- ✅ **Better error handling**: Unified logging and validation
- ✅ **Easy maintenance**: One place to update all functionality

## **🎯 Why This Architecture is Better**

### **1. Eliminates Script Confusion**

- **Before**: 8+ separate scripts, developers didn't know which to use
- **After**: 1 main script with clear command structure

### **2. Maintains Specialized Functionality**

- **Before**: Lost functionality when consolidating
- **After**: All specialized commands integrated and accessible

### **3. Provides Clear Hierarchy**

- **Core modules**: Handle main workflows
- **Integrated commands**: Handle specialized tasks
- **Main orchestrator**: Coordinates everything

### **4. Enables Smart Features**

- **Dependency detection**: Automatically starts required services
- **Change detection**: Knows when to deploy vs. skip
- **Workflow orchestration**: Coordinates complex operations

## **🔍 Script Classification**

### **🏗️ Core Modules (Essential)**

- **`service-manager.sh`**: Service lifecycle
- **`monorepo-build.sh`**: Build system
- **`enhanced-deploy.sh`**: Deployment
- **`quality-deploy.sh`**: Quality assurance

### **🛠️ Integrated Commands (Specialized)**

- **`deploy`**: Deployment operations
- **`env:switch`**: Environment switching
- **`deps:update`**: Dependency updates
- **`env:validate`**: Environment validation
- **`railway:build`**: Railway build operations
- **`assets:generate`**: Asset generation
- **`dns:check`**: DNS verification

## **🎉 Final Result: Complete Unified System**

### **What We Achieved**

✅ **Single entry point** for all operations  
✅ **Smart modularity** with focused responsibilities  
✅ **Integrated command system** without losing functionality  
✅ **Intelligent interlinking** and dependency management  
✅ **Unified interface** across all operations  
✅ **Easy maintenance** and extension  
✅ **Better developer experience**  

### **The Key Insight**

**Multiple scripts are good when they're smartly interlinked and provide a unified experience.**

This architecture gives you:

- **The simplicity** of a single command interface
- **The power** of specialized, focused modules
- **The convenience** of integrated specialized functionality
- **The intelligence** of automatic dependency management
- **The maintainability** of clear separation of concerns

**All scripts now fit together seamlessly in one intelligent, unified system!** 🚀

---

## **📚 Complete Command Reference Guide**

### **🏗️ Development Commands**

```bash
# Start development environment
./scripts/shoppersprint.sh dev [service]        # Start development environment
./scripts/shoppersprint.sh build [service]      # Build application(s)
./scripts/shoppersprint.sh test [service]       # Run tests
./scripts/shoppersprint.sh validate             # Run all validations
./scripts/shoppersprint.sh clean [service]      # Clean build artifacts
./scripts/shoppersprint.sh setup                # Setup development environment
./scripts/shoppersprint.sh deps [command]       # Manage dependencies (check/update/audit)
```

### **🚀 Deployment Commands**

```bash
# Deploy to Railway
./scripts/shoppersprint.sh deploy [service]     # Deploy to Railway
./scripts/shoppersprint.sh deploy:full          # Quality + build + deploy pipeline
./scripts/shoppersprint.sh deploy:rollback      # Rollback deployment
./scripts/shoppersprint.sh deploy:status        # Check deployment status
```

### **🔧 Service Management Commands**

```bash
# Service lifecycle
./scripts/shoppersprint.sh start [service]      # Start service(s)
./scripts/shoppersprint.sh stop [service]       # Stop service(s)
./scripts/shoppersprint.sh restart [service]    # Restart service(s)
./scripts/shoppersprint.sh status [service]     # Show service status
./scripts/shoppersprint.sh logs [service]       # Show service logs
```

### **📦 Dependency Management Commands**

```bash
# Dependency operations
./scripts/shoppersprint.sh deps:check           # Check for updates
./scripts/shoppersprint.sh deps:update          # Update dependencies
./scripts/shoppersprint.sh deps:audit           # Security audit
```

### **✅ Quality Checks**

```bash
# Quality assurance
./scripts/shoppersprint.sh quality [type]       # Run quality checks (type: deps, full, etc.)
```

### **🌍 Environment Management Commands**

```bash
# Environment control
./scripts/shoppersprint.sh env:switch [env]     # Switch environment (dev/production)
./scripts/shoppersprint.sh env:validate         # Validate environment configuration
./scripts/shoppersprint.sh env:production       # Switch to production environment
```

### **🛠️ Specialized Utility Commands**

```bash
# Specialized operations
./scripts/shoppersprint.sh railway:build        # Build for Railway deployment
./scripts/shoppersprint.sh assets:generate      # Generate favicon and assets
./scripts/shoppersprint.sh dns:check            # Check DNS propagation
```

---

## **📋 Package.json Scripts Reference**

All commands are available through npm scripts:

```json
{
  "scripts": {
    "dev": "./scripts/shoppersprint.sh dev",
    "start": "./scripts/shoppersprint.sh start",
    "stop": "./scripts/shoppersprint.sh stop",
    "restart": "./scripts/shoppersprint.sh restart",
    "logs": "./scripts/shoppersprint.sh logs",
    "test": "./scripts/shoppersprint.sh test",
    "build": "./scripts/shoppersprint.sh build",
    "validate": "./scripts/shoppersprint.sh validate",
    "clean": "./scripts/shoppersprint.sh clean",
    "deploy": "./scripts/shoppersprint.sh deploy",
    "deploy:full": "./scripts/shoppersprint.sh deploy:full",
    "deploy:rollback": "./scripts/shoppersprint.sh deploy:rollback",
    "deploy:status": "./scripts/shoppersprint.sh deploy:status",
    "deps:check": "./scripts/shoppersprint.sh deps:check",
    "deps:update": "./scripts/shoppersprint.sh deps:update",
    "deps:audit": "./scripts/shoppersprint.sh deps:audit",
    "deps:check:full": "./scripts/shoppersprint.sh quality deps",
    "env:switch": "./scripts/shoppersprint.sh env:switch",
    "env:validate": "./scripts/shoppersprint.sh env:validate",
    "env:production": "./scripts/shoppersprint.sh env:production",
    "railway:build": "./scripts/shoppersprint.sh railway:build",
    "assets:generate": "./scripts/shoppersprint.sh assets:generate",
    "dns:check": "./scripts/shoppersprint.sh dns:check",
    "quality": "./scripts/shoppersprint.sh quality",
    "quality:full": "./scripts/shoppersprint.sh quality full",
    "service:start": "./scripts/shoppersprint.sh start",
    "service:stop": "./scripts/shoppersprint.sh stop",
    "service:restart": "./scripts/shoppersprint.sh restart",
    "service:status": "./scripts/shoppersprint.sh status",
    "service:logs": "./scripts/shoppersprint.sh logs",
    "service:build": "./scripts/shoppersprint.sh build",
    "service:test": "./scripts/shoppersprint.sh test",
    "service:clean": "./scripts/shoppersprint.sh clean",
    "build:monorepo": "./scripts/shoppersprint.sh build",
    "build:validate": "./scripts/shoppersprint.sh validate",
    "build:setup": "./scripts/shoppersprint.sh setup",
    "build:clean": "./scripts/shoppersprint.sh clean",
    "build:deps": "./scripts/shoppersprint.sh deps",
    "deploy:enhanced": "./scripts/shoppersprint.sh deploy",
    "deploy:build": "./scripts/shoppersprint.sh build",
    "deploy:validate": "./scripts/shoppersprint.sh validate",
    "deploy:logs": "./scripts/shoppersprint.sh logs"
  }
}
```

---

## **🎯 Available Services**

### **Service Types**

- `all` - All services (frontend, backend, db, redis)
- `frontend` - React frontend application
- `backend` - Node.js backend API
- `db` - PostgreSQL database
- `redis` - Redis cache
- `websocket` - WebSocket service (part of backend)
- `monorepo` - Complete monorepo (for build commands)

---

## **🔄 Workflow Examples**

### **Complete Development Session**

```bash
# 1. Start development environment
npm run dev

# 2. Make changes to frontend
# ... edit frontend code ...

# 3. Build and test frontend
npm run service:build frontend
npm run service:test frontend

# 4. Deploy only frontend
npm run deploy:enhanced frontend --production

# 5. Check deployment
npm run deploy:status
```

### **Backend Development Workflow**

```bash
# 1. Start backend and database
npm run service:start backend
npm run service:start db

# 2. Setup database
npm run build:setup

# 3. Make backend changes
# ... edit backend code ...

# 4. Validate changes
npm run build:validate

# 5. Build and test
npm run service:build backend
npm run service:test backend

# 6. Deploy backend
npm run deploy:enhanced backend --production
```

### **Full Monorepo Deployment**

```bash
# 1. Run complete quality checks
npm run quality:full

# 2. Build entire monorepo
npm run build:monorepo full

# 3. Deploy to production
npm run deploy:enhanced all --production

# 4. Monitor deployment
npm run deploy:status
npm run deploy:logs all
```

---

## **🚨 Troubleshooting**

### **Common Issues**

1. **Service won't start**: Check Docker status and logs
2. **Build fails**: Run `npm run build:validate` to identify issues
3. **Deployment fails**: Check Railway CLI and authentication
4. **Database issues**: Run `npm run build:setup` to reset environment

### **Useful Commands**

```bash
# Check all service statuses
npm run service:status all

# View comprehensive logs
npm run service:logs all

# Clean and rebuild
npm run build:clean
npm run build:monorepo full

# Check deployment status
npm run deploy:status
```

---

## **📚 Additional Resources**

- **Docker Compose**: `docker-compose.yml` for service orchestration
- **Environment**: `.env` files for configuration
- **Railway**: Production deployment platform
- **Scripts Directory**: `./scripts/` for all custom scripts
- **Help System**: Run `./scripts/shoppersprint.sh help` for comprehensive help
