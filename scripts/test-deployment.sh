#!/bin/bash

# Test Deployment Script for CeleParty
# This script helps verify that your deployment setup is working correctly

echo "🚀 Testing CeleParty Deployment Setup..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    if [ $2 -eq 0 ]; then
        echo -e "${GREEN}✅ $1${NC}"
    else
        echo -e "${RED}❌ $1${NC}"
    fi
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

echo "Testing server connectivity..."

# Test SSH connection
ssh -o ConnectTimeout=10 -o BatchMode=yes root@165.22.98.216 'echo "SSH connection successful"' 2>/dev/null
print_status "SSH Connection" $?

# Test if server has required tools
echo "Checking server requirements..."

ssh root@165.22.98.216 'command -v node' >/dev/null 2>&1
print_status "Node.js installed" $?

ssh root@165.22.98.216 'command -v npm' >/dev/null 2>&1
print_status "NPM installed" $?

ssh root@165.22.98.216 'command -v git' >/dev/null 2>&1
print_status "Git installed" $?

ssh root@165.22.98.216 'command -v pm2' >/dev/null 2>&1
print_status "PM2 installed" $?

ssh root@165.22.98.216 'command -v nginx' >/dev/null 2>&1
print_status "Nginx installed" $?

# Check directory structure
echo "Checking directory structure..."

ssh root@165.22.98.216 'test -d /var/www/celeparty.com' 2>/dev/null
print_status "Project directory exists" $?

ssh root@165.22.98.216 'test -d /var/www/celeparty.com/celeparty-fe' 2>/dev/null
if [ $? -eq 0 ]; then
    print_status "App directory exists" 0
else
    print_warning "App directory doesn't exist - will be created on first deployment"
fi

# Check permissions
echo "Checking permissions..."

ssh root@165.22.98.216 'test -w /var/www/celeparty.com' 2>/dev/null
print_status "Directory writable" $?

# Test local build
echo "Testing local build..."

if [ -f "package.json" ]; then
    print_status "package.json found" 0
    
    # Check if dependencies are installed
    if [ -d "node_modules" ]; then
        print_status "Dependencies installed" 0
    else
        print_warning "Dependencies not installed - run 'npm install'"
    fi
    
    # Try to build locally
    npm run build >/dev/null 2>&1
    print_status "Local build successful" $?
else
    print_status "package.json found" 1
fi

echo ""
echo "🔍 Deployment Checklist:"
echo "1. ✅ GitHub repository created and code pushed"
echo "2. 📝 Add GitHub secrets (see DEPLOYMENT_SETUP.md)"
echo "3. 🖥️  Setup Digital Ocean server (see DEPLOYMENT_SETUP.md)"
echo "4. 🔄 Push to master branch to trigger deployment"

echo ""
echo "📚 For complete setup instructions, see DEPLOYMENT_SETUP.md"
echo "🚀 Ready to deploy! Push your code to master branch."
