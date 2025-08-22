#!/bin/bash

# Environment Variables Validation Script
set -e

echo "🔍 Validating Environment Variables..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if variable is set
check_var() {
    local var_name=$1
    local var_value=$2
    
    if [ -z "$var_value" ]; then
        echo -e "${RED}❌ $var_name not set${NC}"
        return 1
    else
        echo -e "${GREEN}✅ $var_name${NC}"
        return 0
    fi
}

# Load environment file
[ -f ".env" ] && source .env || { echo -e "${RED}❌ Root .env not found${NC}"; exit 1; }

# Critical variables
echo "Database:"
check_var "DB_HOST" "$DB_HOST"
check_var "DB_PASSWORD" "$DB_PASSWORD"
check_var "DATABASE_URL" "$DATABASE_URL"

echo -e "\nAuthentication:"
check_var "JWT_SECRET" "$JWT_SECRET"

echo -e "\nApplication:"
check_var "NODE_ENV" "$NODE_ENV"
check_var "PORT" "$PORT"
check_var "FRONTEND_URL" "$FRONTEND_URL"

echo -e "\nFrontend:"
check_var "VITE_API_BASE_URL" "$VITE_API_BASE_URL"
check_var "VITE_BACKEND_URL" "$VITE_BACKEND_URL"

# Security checks
echo -e "\nSecurity:"
if [ ${#JWT_SECRET} -lt 32 ]; then
    echo -e "${RED}❌ JWT_SECRET too short${NC}"
else
    echo -e "${GREEN}✅ JWT_SECRET length OK${NC}"
fi

echo -e "\n🎯 Summary: $NODE_ENV environment ready"
echo "Database: $DB_HOST:$DB_PORT/$DB_NAME"
echo "Frontend: $FRONTEND_URL"
echo "Backend: http://localhost:$PORT"
