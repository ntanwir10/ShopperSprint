# Configuration Directory

This directory contains all configuration files organized by purpose.

## 📁 Directory Structure

### `deployment/`
Platform-specific deployment configuration files:
- `nixpacks.toml` - Railway single-service deployment config
- `nixpacks-backend.toml` - Railway backend-only deployment config  
- `nixpacks-frontend.toml` - Railway frontend-only deployment config
- `railway.json` - Railway service configuration
- `vercel.json` - Vercel deployment configuration

### `examples/`
Template and example configuration files:
- `.env.example` - Main environment variables template
- `.env.railway.example` - Railway-specific environment template
- `.env.vercel.example` - Vercel-specific environment template

### `environments/`
Environment-specific configuration files (development, staging, production)

## 🎯 Usage

- **Development**: Copy examples to project root and configure
- **Deployment**: Platform-specific configs are automatically used by deployment scripts
- **Templates**: Use example files as starting points for your configuration

## 🔗 Related Scripts

Configuration files are used by:
- `scripts/deploy-railway.sh` - Uses Railway deployment configs
- `scripts/deploy-vercel.sh` - Uses Vercel deployment configs
- `scripts/automate.sh` - References environment templates
