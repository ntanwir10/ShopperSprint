#!/bin/bash

# Deploy using CI/CD pipeline
# This script triggers the GitHub Actions workflow for deployment

set -e

echo "🚀 Deploying ShopperSprint using CI/CD pipeline..."

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Error: Not in a git repository"
    exit 1
fi

# Check if there are uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo "⚠️  Warning: You have uncommitted changes"
    read -p "Do you want to commit them first? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "📝 Committing changes..."
        git add .
        git commit -m "Deploy: $(date '+%Y-%m-%d %H:%M:%S')"
    fi
fi

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 Current branch: $CURRENT_BRANCH"

# Check if we're on main or coming-soon branch
if [[ "$CURRENT_BRANCH" != "main" && "$CURRENT_BRANCH" != "coming-soon" ]]; then
    echo "⚠️  Warning: You're not on main or coming-soon branch"
    echo "   Deployment will only trigger on main or coming-soon branches"
    read -p "Do you want to switch to coming-soon branch? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git checkout coming-soon
        CURRENT_BRANCH="coming-soon"
    fi
fi

# Push to trigger CI/CD
echo "🔄 Pushing to $CURRENT_BRANCH to trigger deployment..."
git push origin $CURRENT_BRANCH

echo "✅ Push completed!"
echo ""
echo "🔗 Monitor the deployment at:"
echo "   https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\([^.]*\).*/\1/')/actions"
echo ""
echo "📱 Your app will be available at:"
echo "   https://diplomatic-youth-production-f43f.up.railway.app"
echo "   https://shoppersprint.com (after DNS setup)"
echo ""
echo "⏱️  Deployment typically takes 3-5 minutes"
