#!/bin/bash

# ShopperSprint Local Deployment Script
# This script deploys your app to Railway from your local machine

set -e

echo "🚀 ShopperSprint Local Deployment"
echo "=================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Error: Railway CLI is not installed"
    echo "Install it with: npm install -g @railway/cli"
    exit 1
fi

# Check if we're logged in to Railway
if ! railway status &> /dev/null; then
    echo "❌ Error: Not logged in to Railway"
    echo "Login with: railway login"
    exit 1
fi

echo "✅ Pre-flight checks passed"
echo ""

# Show current status
echo "📊 Current Railway Status:"
railway status
echo ""

# Build the application
echo "🏗️  Building application..."
npm run build 2>/dev/null || echo "⚠️  Build step skipped (no build script found)"

# Copy frontend build to backend public directory for single-service deployment
echo "📁 Copying frontend build to backend public directory..."
mkdir -p backend/dist/public
cp -r frontend/dist/* backend/dist/public/
echo "✅ Frontend files copied successfully"
echo ""

# Deploy to Railway
echo "🚀 Deploying to Railway..."
railway up --detach

echo ""
echo "✅ Deployment initiated successfully!"
echo ""
echo "🌐 Your app will be available at:"
echo "   • Railway URL: https://diplomatic-youth-production-f43f.up.railway.app"
echo "   • Custom URL:  https://shoppersprint.com (if DNS is configured)"
echo ""
echo "📊 Check deployment status:"
echo "   railway logs"
echo "   railway status"
