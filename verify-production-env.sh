#!/bin/bash
# 🔍 Production Environment Verification Script
# Purpose: Verify all required environment variables are set correctly
# Usage: ./verify-production-env.sh

set -e

echo "========================================="
echo "🔍 PRODUCTION ENVIRONMENT VERIFICATION"
echo "========================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track failures
FAILURES=0

# Function to check variable
check_var() {
    local var_name=$1
    local description=$2
    local value=${!var_name}
    
    if [ -z "$value" ]; then
        echo -e "${RED}❌ $var_name${NC} - $description"
        echo "   Status: NOT SET"
        ((FAILURES++))
    else
        # Check if value looks reasonable
        if [ "$var_name" = "NEXTAUTH_SECRET" ] || [ "$var_name" = "JWT_SECRET" ]; then
            if [ ${#value} -lt 32 ]; then
                echo -e "${YELLOW}⚠️  $var_name${NC} - $description"
                echo "   Status: SET but might be too short (${#value} chars, recommended 32+)"
                ((FAILURES++))
            else
                echo -e "${GREEN}✅ $var_name${NC} - $description"
                echo "   Status: SET (${#value} chars)"
            fi
        elif [[ "$var_name" == *"API"* ]] && [[ "$value" != "http"* ]]; then
            echo -e "${YELLOW}⚠️  $var_name${NC} - $description"
            echo "   Status: SET but might not be a valid URL"
            echo "   Value: $value"
            ((FAILURES++))
        else
            echo -e "${GREEN}✅ $var_name${NC} - $description"
            echo "   Status: SET"
            if [[ "$var_name" == *"URL"* ]] || [[ "$var_name" == *"API"* ]]; then
                echo "   Value: $value"
            fi
        fi
    fi
    echo ""
}

# Critical variables
echo "📋 CRITICAL VARIABLES (MUST BE SET):"
echo "====================================="
check_var "BASE_API" "Strapi base URL"
check_var "KEY_API" "Strapi API key"
check_var "NEXTAUTH_URL" "NextAuth redirect URL"
check_var "NEXTAUTH_SECRET" "NextAuth session secret"
check_var "JWT_SECRET" "JWT signing secret"
check_var "NEXT_PUBLIC_MIDTRANS_CLIENT_KEY" "Midtrans production client key"
check_var "MIDTRANS_SERVER_KEY" "Midtrans production server key"

echo ""
echo "📋 IMPORTANT VARIABLES:"
echo "======================="
check_var "NEXT_PUBLIC_APP_URL" "Frontend application URL"
check_var "PRODUCTION_MODE" "Production mode flag"
check_var "NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION" "Midtrans production flag"

echo ""
echo "📋 OPTIONAL VARIABLES:"
echo "======================"
check_var "BASE_API_REGION" "Region API endpoint"
check_var "NEXT_PUBLIC_STRAPI_URL" "Public Strapi URL"
check_var "NEXT_PUBLIC_IMAGE_DOMAIN" "Image domain for Next.js"

# Additional checks
echo ""
echo "🔐 ADDITIONAL CHECKS:"
echo "===================="
echo ""

# Check NEXTAUTH_URL format
if [ ! -z "$NEXTAUTH_URL" ]; then
    if [[ "$NEXTAUTH_URL" == *"/"* ]]; then
        # Check if it has trailing slash or path
        if [[ "$NEXTAUTH_URL" == */ ]]; then
            echo -e "${YELLOW}⚠️  NEXTAUTH_URL has trailing slash${NC}"
            echo "   Current: $NEXTAUTH_URL"
            echo "   Recommendation: Remove trailing slash"
            ((FAILURES++))
        fi
    fi
fi

# Check Midtrans mode
if [ "$NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION" != "true" ]; then
    echo -e "${YELLOW}⚠️  NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION${NC}"
    echo "   Current: $NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION"
    echo "   Status: NOT in production mode (sandbox mode active)"
    echo "   For production: Set to 'true'"
    ((FAILURES++))
fi

if [ "$PRODUCTION_MODE" != "true" ]; then
    echo -e "${YELLOW}⚠️  PRODUCTION_MODE${NC}"
    echo "   Current: $PRODUCTION_MODE"
    echo "   Status: NOT in production mode"
    echo "   For production: Set to 'true'"
    ((FAILURES++))
fi

echo ""
echo "🌐 CONNECTIVITY CHECKS:"
echo "======================="
echo ""

# Test BASE_API connectivity
if [ ! -z "$BASE_API" ]; then
    echo "Testing Strapi connectivity..."
    if curl -s -f "$BASE_API/transactions" \
        -H "Authorization: Bearer $KEY_API" \
        -H "Content-Type: application/json" \
        > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Strapi /transactions endpoint is accessible${NC}"
    else
        echo -e "${RED}❌ Cannot reach Strapi /transactions endpoint${NC}"
        echo "   URL: $BASE_API/transactions"
        echo "   Check: 1) Is Strapi running?"
        echo "          2) Is BASE_API correct?"
        echo "          3) Is KEY_API valid?"
        ((FAILURES++))
    fi
    echo ""
fi

# Test frontend URL (if NEXT_PUBLIC_APP_URL is set)
if [ ! -z "$NEXT_PUBLIC_APP_URL" ]; then
    echo "Testing frontend connectivity..."
    if curl -s -f "$NEXT_PUBLIC_APP_URL" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend is accessible at $NEXT_PUBLIC_APP_URL${NC}"
    else
        echo -e "${YELLOW}⚠️  Cannot reach frontend at $NEXT_PUBLIC_APP_URL${NC}"
        echo "   This might be OK if frontend is not yet started"
        echo "   URL: $NEXT_PUBLIC_APP_URL"
    fi
    echo ""
fi

echo ""
echo "========================================="
echo "📊 SUMMARY"
echo "========================================="
echo ""

if [ $FAILURES -eq 0 ]; then
    echo -e "${GREEN}✅ ALL CHECKS PASSED!${NC}"
    echo "   Your production environment is properly configured."
    echo ""
    echo "   Next steps:"
    echo "   1. Run: npm run build"
    echo "   2. Run: pm2 start ecosystem.config.js --env production"
    echo "   3. Verify: pm2 logs celeparty.com"
    exit 0
else
    echo -e "${RED}❌ $FAILURES CHECK(S) FAILED${NC}"
    echo "   Please fix the issues above before deploying to production."
    echo ""
    echo "   Common fixes:"
    echo "   1. Set missing environment variables"
    echo "   2. Verify Strapi is running and accessible"
    echo "   3. Use production Midtrans keys, not sandbox"
    echo "   4. Ensure NEXTAUTH_URL matches your domain exactly"
    exit 1
fi
