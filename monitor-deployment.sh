#!/bin/bash

# Railway Deployment Monitor
echo "🚂 Monitoring Railway Deployment"
echo "================================"

check_deployment() {
    echo "⏰ $(date): Checking deployment..."
    
    # Check if site is responding
    if curl -s -I https://shoppersprint.com | grep -q "HTTP/2 200"; then
        echo "✅ Site is responding"
        
        # Check if it's the new UI by looking for React app indicators
        content=$(curl -s https://shoppersprint.com | head -20)
        
        if echo "$content" | grep -q "ShopperSprint - Coming Soon"; then
            echo "📄 Still showing old static page"
            return 1
        elif echo "$content" | grep -q "react" || echo "$content" | grep -q "vite"; then
            echo "🎉 New React UI is live!"
            return 0
        else
            echo "❓ Unknown content detected"
            return 1
        fi
    else
        echo "❌ Site not responding"
        return 1
    fi
}

# Monitor for up to 10 minutes
for i in {1..20}; do
    if check_deployment; then
        echo ""
        echo "🎉 SUCCESS: New UI deployment completed!"
        echo "🌐 Visit: https://shoppersprint.com"
        exit 0
    fi
    
    if [ $i -lt 20 ]; then
        echo "⏳ Waiting 30 seconds before next check..."
        sleep 30
    fi
done

echo ""
echo "⏰ Monitoring timeout reached"
echo "💡 Railway deployment might still be in progress"
echo "🔍 Check Railway dashboard for build status"
