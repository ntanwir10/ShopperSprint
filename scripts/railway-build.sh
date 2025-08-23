#!/bin/bash

# Railway Optimized Build Script
set -e

echo "🚀 Starting Railway optimized build..."

# Set production environment
export NODE_ENV=production
export NPM_CONFIG_LOGLEVEL=error

# Build frontend first (most time-consuming)
echo "📦 Building frontend..."
cd frontend
npm run build --silent
cd ..

# Build backend
echo "⚙️ Building backend..."
cd backend
npm run build --silent
cd ..

# Copy frontend build to backend public directory
echo "📁 Copying frontend files..."
mkdir -p backend/dist/public
cp -r frontend/dist/* backend/dist/public/

echo "✅ Build completed successfully!"
