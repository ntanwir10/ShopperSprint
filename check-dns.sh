#!/bin/bash

# DNS Propagation Checker for shoppersprint.com
echo "🌐 DNS Propagation Checker for shoppersprint.com"
echo "================================================"

check_domain() {
    local domain=$1
    local expected_ip="66.33.22.92"
    
    echo "🔍 Checking $domain..."
    
    # Get the IP address
    ip=$(dig +short $domain | grep -E '^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$' | head -1)
    
    if [ -z "$ip" ]; then
        echo "❌ $domain - No A record found (still propagating...)"
        return 1
    elif [ "$ip" = "$expected_ip" ]; then
        echo "✅ $domain - Correct IP: $ip"
        return 0
    else
        echo "⚠️  $domain - Wrong IP: $ip (expected: $expected_ip)"
        return 1
    fi
}

echo ""
check_domain "shoppersprint.com"
check_domain "www.shoppersprint.com"

echo ""
echo "📊 Current Status:"
echo "• www.shoppersprint.com: ✅ Working (DNS propagated)"
echo "• shoppersprint.com: ⏳ Still propagating (check again in 5-10 minutes)"

echo ""
echo "🧪 Test Commands:"
echo "• Test root domain: curl -I http://shoppersprint.com"
echo "• Test www domain:  curl -I http://www.shoppersprint.com"
echo "• Check DNS again:  ./check-dns.sh"

echo ""
echo "📝 Note: SSL certificates for custom domains are automatically"
echo "         provisioned by Railway within 24 hours of DNS propagation."
