#!/bin/bash

# Vercel Deployment Script for PricePulse
# This script helps deploy the app to Vercel for testing

echo "🚀 PricePulse Vercel Deployment Script"
echo "======================================"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed."
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Check if we're logged in to Vercel
echo "🔐 Checking Vercel authentication..."
if ! vercel whoami &> /dev/null; then
    echo "📝 Please login to Vercel:"
    vercel login
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm run install:all

# Build the project
echo "🏗️  Building project..."
npm run build:frontend

# Check if .env.vercel.example exists
if [ -f "config/examples/.env.vercel.example" ]; then
    echo "📋 Environment variables example found at config/examples/.env.vercel.example"
    echo "⚠️  Please set up your environment variables in Vercel dashboard:"
    echo "   1. Go to your Vercel project settings"
    echo "   2. Navigate to Environment Variables"
    echo "   3. Add the variables from config/examples/.env.vercel.example"
    echo ""
    echo "🔗 Required services:"
    echo "   - PostgreSQL database (Neon, Supabase, or Railway)"
    echo "   - Redis database (Upstash recommended)"
    echo ""
else
    echo "⚠️  Environment variables example not found!"
fi

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Set up environment variables in Vercel dashboard"
echo "2. Test your deployment health endpoint: /health"
echo "3. Test your API endpoints: /api/search"
echo "4. Check the deployment documentation in docs/VERCEL_DEPLOYMENT.md"
echo ""
echo "🔗 Useful links:"
echo "   - Vercel Dashboard: https://vercel.com/dashboard"
echo "   - Neon (Database): https://neon.tech/"
echo "   - Upstash (Redis): https://upstash.com/"
echo ""
