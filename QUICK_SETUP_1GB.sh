#!/bin/bash

# Quick Setup Script untuk Digital Ocean 1GB RAM
# Run this script on your Digital Ocean server

echo "🚀 Setting up CeleParty untuk server 1GB RAM..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "Please run as root (use: sudo bash QUICK_SETUP_1GB.sh)"
    exit 1
fi

# Step 1: Create Swap File (Critical for 1GB RAM)
print_warning "Step 1: Creating 2GB swap file..."
if [ ! -f /swapfile ]; then
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
    echo 'vm.swappiness=10' >> /etc/sysctl.conf
    echo 'vm.vfs_cache_pressure=50' >> /etc/sysctl.conf
    print_status "Swap file created successfully"
else
    print_status "Swap file already exists"
fi

# Step 2: Update System
print_warning "Step 2: Updating system packages..."
apt update && apt upgrade -y
print_status "System updated"

# Step 3: Install Essential Packages
print_warning "Step 3: Installing essential packages..."
apt install -y nginx curl wget git
print_status "Essential packages installed"

# Step 4: Install Node.js 18
print_warning "Step 4: Installing Node.js 18..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
    print_status "Node.js installed: $(node --version)"
else
    print_status "Node.js already installed: $(node --version)"
fi

# Step 5: Install PM2
print_warning "Step 5: Installing PM2..."
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
    print_status "PM2 installed"
else
    print_status "PM2 already installed"
fi

# Step 6: Create Project Directory
print_warning "Step 6: Creating project directory..."
mkdir -p /var/www/celeparty.com
print_status "Project directory created"

# Step 7: Configure Nginx for Low Memory
print_warning "Step 7: Configuring Nginx for low memory..."
cat > /etc/nginx/sites-available/celeparty.com << 'EOF'
server {
    listen 80;
    server_name celeparty.com www.celeparty.com;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Proxy to Next.js
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts untuk low memory
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }

    # Static files dengan aggressive caching
    location /_next/static {
        alias /var/www/celeparty.com/celeparty-fe/.next/static;
        expires 1y;
        add_header Cache-Control "public, immutable";
        gzip_static on;
    }

    # Images caching
    location ~* \.(jpg|jpeg|png|gif|ico|svg)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    # CSS/JS caching
    location ~* \.(css|js)$ {
        expires 1y;
        add_header Cache-Control "public";
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/celeparty.com /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test nginx config
if nginx -t; then
    systemctl reload nginx
    print_status "Nginx configured and reloaded"
else
    print_error "Nginx configuration error"
    exit 1
fi

# Step 8: Optimize Nginx for Low Memory
print_warning "Step 8: Optimizing Nginx configuration..."
cat > /etc/nginx/nginx.conf << 'EOF'
user www-data;
worker_processes 1;
pid /run/nginx.pid;

events {
    worker_connections 512;
    use epoll;
    multi_accept on;
}

http {
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 30;
    types_hash_max_size 2048;
    client_max_body_size 10M;
    
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    # Logging
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;

    # Site configuration
    include /etc/nginx/sites-enabled/*;
}
EOF

nginx -t && systemctl reload nginx
print_status "Nginx optimized for low memory"

# Step 9: Disable Unnecessary Services
print_warning "Step 9: Disabling unnecessary services..."
systemctl disable bluetooth &>/dev/null || true
systemctl disable snapd &>/dev/null || true
systemctl disable unattended-upgrades &>/dev/null || true
print_status "Unnecessary services disabled"

# Step 10: Setup PM2 Startup
print_warning "Step 10: Setting up PM2 startup..."
pm2 startup
print_status "PM2 startup configured"

# Step 11: Create PM2 Log Directory
mkdir -p /var/log/pm2
chown www-data:www-data /var/log/pm2

# Step 12: Set Permissions
chown -R www-data:www-data /var/www/celeparty.com

print_status "Setup completed successfully!"
echo ""
echo "🎉 Server siap untuk deployment!"
echo ""
echo "📋 Next Steps:"
echo "1. Setup GitHub secrets (lihat DEPLOYMENT_SETUP.md)"
echo "2. Push code ke master branch"
echo "3. Monitor deployment dengan: pm2 monit"
echo ""
echo "🔍 Check system resources:"
echo "   free -h    # Check memory usage"
echo "   pm2 list   # Check PM2 processes"
echo "   htop       # Real-time monitoring"
echo ""
echo "📊 Expected memory usage:"
echo "   System + Nginx: ~250MB"
echo "   Next.js App: ~400MB"
echo "   Available: ~350MB untuk cache/buffer"
