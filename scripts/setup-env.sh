#!/bin/bash

# PricePulse Environment Setup Script
# This script sets up environment files for development

echo "🔧 Setting up PricePulse environment files..."

echo "ℹ️  Skipping root .env creation (not required). Use backend/.env and frontend/.env only."

# Backend environment
if [ -f "backend/.env" ]; then
    echo "⚠️  Backend .env already exists. Skipping..."
else
    if [ -f "backend/.env.example" ]; then
        cp backend/.env.example backend/.env
        echo "✅ Backend .env created from .env.example"
    else
        echo "❌ backend/.env.example not found"
    fi
fi

# Frontend environment
if [ -f "frontend/.env" ]; then
    echo "⚠️  Frontend .env already exists. Skipping..."
else
    if [ -f "frontend/.env.example" ]; then
        cp frontend/.env.example frontend/.env
        echo "✅ Frontend .env created from .env.example"
    else
        echo "❌ frontend/.env.example not found"
    fi
fi

echo ""
echo "🎯 Next steps:"
echo "1. Edit .env files with your actual configuration values"
echo "2. Run 'npm run db:start' to start databases"
echo "3. Run 'npm run dev' to start development environment"
echo ""
echo "📧 Important: Configure your SMTP settings for email functionality!"
echo "   - SMTP_HOST (e.g., smtp.gmail.com)"
echo "   - SMTP_USER (your email)"
echo "   - SMTP_PASS (your app password)"
echo "   - SMTP_FROM (sender email)"
echo ""
echo "🔗 For Gmail: Use App Passwords, not your regular password"
echo "   See: https://support.google.com/accounts/answer/185833"
