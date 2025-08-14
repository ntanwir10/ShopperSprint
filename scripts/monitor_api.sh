#!/bin/bash

echo "🔍 PricePulse API Monitoring Started"
echo "====================================="
echo "Backend: http://localhost:3001"
echo "Frontend: http://localhost:5173"
echo ""

# Function to monitor backend logs
monitor_backend() {
    echo "📡 Monitoring Backend Logs..."
    echo "-----------------------------"
    # We'll use curl to monitor the health endpoint and search API
}

# Function to test search API
test_search() {
    echo "🧪 Testing Search API..."
    echo "------------------------"
    
    # Test 1: Basic search
    echo "Test 1: Basic search for 'sony headphones'"
    curl -s -X POST http://localhost:3001/api/search \
        -H "Content-Type: application/json" \
        -d '{"query": "sony headphones", "maxResults": 5}' \
        | jq '.metadata' 2>/dev/null || echo "Failed to parse response"
    echo ""
    
    # Test 2: Search with filters
    echo "Test 2: Search with price filter (max $300)"
    curl -s -X POST "http://localhost:3001/api/search?maxPrice=30000" \
        -H "Content-Type: application/json" \
        -d '{"query": "bose headphones", "maxResults": 5}' \
        | jq '.metadata' 2>/dev/null || echo "Failed to parse response"
    echo ""
    
    # Test 3: Search with sorting
    echo "Test 3: Search sorted by price (low to high)"
    curl -s -X POST "http://localhost:3001/api/search?sort=price&direction=asc" \
        -H "Content-Type: application/json" \
        -d '{"query": "wireless headphones", "maxResults": 5}' \
        | jq '.metadata' 2>/dev/null || echo "Failed to parse response"
    echo ""
}

# Function to monitor real-time API calls
monitor_realtime() {
    echo "⏱️  Real-time API Monitoring (Press Ctrl+C to stop)..."
    echo "-----------------------------------------------------"
    
    # Monitor health endpoint every 2 seconds
    while true; do
        timestamp=$(date '+%H:%M:%S')
        health_response=$(curl -s http://localhost:3001/health 2>/dev/null)
        
        if [ $? -eq 0 ]; then
            websocket_clients=$(echo $health_response | jq -r '.websocketClients // "N/A"' 2>/dev/null)
            echo "[$timestamp] ✅ Health OK | WebSocket Clients: $websocket_clients"
        else
            echo "[$timestamp] ❌ Health check failed"
        fi
        
        sleep 2
    done
}

# Function to analyze API performance
analyze_performance() {
    echo "📊 API Performance Analysis"
    echo "---------------------------"
    
    # Test search performance
    echo "Testing search performance..."
    start_time=$(date +%s%N)
    
    response=$(curl -s -X POST http://localhost:3001/api/search \
        -H "Content-Type: application/json" \
        -d '{"query": "performance test", "maxResults": 10}')
    
    end_time=$(date +%s%N)
    duration=$(( (end_time - start_time) / 1000000 )) # Convert to milliseconds
    
    if [ $? -eq 0 ]; then
        result_count=$(echo $response | jq '.results | length' 2>/dev/null || echo "N/A")
        cache_hit=$(echo $response | jq -r '.metadata.cacheHit // "N/A"' 2>/dev/null)
        search_duration=$(echo $response | jq -r '.metadata.searchDuration // "N/A"' 2>/dev/null)
        
        echo "✅ Search completed in ${duration}ms"
        echo "   Results: $result_count"
        echo "   Cache Hit: $cache_hit"
        echo "   Backend Duration: ${search_duration}ms"
    else
        echo "❌ Search failed"
    fi
    echo ""
}

# Main menu
echo "Choose monitoring option:"
echo "1. Test Search API"
echo "2. Monitor Real-time Health"
echo "3. Analyze Performance"
echo "4. Run All Tests"
echo "5. Exit"
echo ""

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        test_search
        ;;
    2)
        monitor_realtime
        ;;
    3)
        analyze_performance
        ;;
    4)
        test_search
        echo ""
        analyze_performance
        echo ""
        echo "Starting real-time monitoring..."
        monitor_realtime
        ;;
    5)
        echo "Goodbye! 👋"
        exit 0
        ;;
    *)
        echo "Invalid choice. Exiting."
        exit 1
        ;;
esac
