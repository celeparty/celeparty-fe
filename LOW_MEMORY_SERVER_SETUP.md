# Server Setup Optimized untuk RAM 1GB

Panduan ini khusus untuk server Digital Ocean dengan RAM terbatas (1GB). Build dilakukan di GitHub Actions, server hanya menjalankan aplikasi yang sudah di-build.

## 🎯 **Strategi Optimasi Memory**

### 1. **Build di GitHub, Deploy File Static**
- ✅ Build dilakukan di GitHub Actions (RAM unlimited)
- ✅ Server hanya menerima file hasil build
- ✅ Tidak perlu install dev dependencies di server
- ✅ Memory usage minimal untuk production

### 2. **Server Configuration untuk 1GB RAM**

#### Swap File Setup (Penting!)
```bash
# Buat swap file 2GB untuk backup memory
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Permanent swap
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Optimasi swap usage
echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf
echo 'vm.vfs_cache_pressure=50' | sudo tee -a /etc/sysctl.conf
```

#### System Optimization
```bash
# Update system
apt update && apt upgrade -y

# Install only essential packages
apt install -y nginx curl wget git

# Install Node.js 18 (lightweight)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs

# Install PM2 globally
npm install -g pm2
```

#### Memory-Optimized Nginx Configuration
```nginx
# /etc/nginx/nginx.conf
user www-data;
worker_processes 1;  # 1 worker untuk 1GB RAM
pid /run/nginx.pid;

events {
    worker_connections 512;  # Reduced dari default 1024
    use epoll;
    multi_accept on;
}

http {
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 30;  # Reduced dari 65
    types_hash_max_size 2048;
    client_max_body_size 10M;  # Limit upload size
    
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

    # Site configuration
    include /etc/nginx/sites-enabled/*;
}
```

#### Optimized Site Configuration
```nginx
# /etc/nginx/sites-available/celeparty.com
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
```

#### PM2 Configuration untuk Low Memory
```javascript
// /var/www/celeparty.com/celeparty-fe/ecosystem.config.js
module.exports = {
  apps: [{
    name: 'celeparty-fe',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/celeparty.com/celeparty-fe',
    instances: 1,  // HANYA 1 instance untuk 1GB RAM
    exec_mode: 'fork',  // Fork mode, bukan cluster
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      NODE_OPTIONS: '--max-old-space-size=512'  // Limit memory to 512MB
    },
    max_memory_restart: '400M',  // Restart jika memory > 400MB
    node_args: '--max-old-space-size=512',
    watch: false,
    autorestart: true,
    max_restarts: 3,
    min_uptime: '10s',
    error_file: '/var/log/pm2/celeparty-fe-error.log',
    out_file: '/var/log/pm2/celeparty-fe-out.log',
    log_file: '/var/log/pm2/celeparty-fe.log',
    time: true
  }]
}
```

## 📁 **Directory Structure**
```
/var/www/celeparty.com/
└── celeparty-fe/
    ├── .next/          # Built application
    ├── public/         # Static assets
    ├── package.json    # Production dependencies only
    ├── .env.local      # Environment variables
    └── ecosystem.config.js
```

## 🚀 **Deployment Process**

### 1. Setup Server (One Time)
```bash
# SSH ke server
ssh root@165.22.98.216

# Run setup commands dari atas
# - Install swap
# - Install Node.js, PM2, Nginx
# - Configure Nginx
# - Create directories
```

### 2. Test Memory Usage
```bash
# Monitor memory usage
free -h
htop

# Check PM2 process
pm2 monit

# Check nginx processes
ps aux | grep nginx
```

### 3. Expected Memory Usage
```
- System: ~200MB
- Nginx: ~50MB
- PM2: ~30MB
- Next.js App: ~400MB
- Available: ~320MB untuk buffer/cache
```

## ⚡ **Performance Optimizations**

### 1. **Next.js Production Optimizations**
File sudah dikonfigurasi di CI/CD untuk:
- Tree shaking (remove unused code)
- Minification
- Image optimization
- Static generation where possible

### 2. **Server-level Optimizations**
```bash
# Disable unnecessary services
sudo systemctl disable bluetooth
sudo systemctl disable snapd
sudo systemctl disable unattended-upgrades

# Limit log sizes
echo 'SystemMaxUse=100M' >> /etc/systemd/journald.conf
systemctl restart systemd-journald
```

### 3. **PM2 Monitoring**
```bash
# Setup PM2 monitoring
pm2 install pm2-server-monit

# Check memory usage
pm2 show celeparty-fe
```

## 🔧 **Troubleshooting Low Memory Issues**

### Memory Full Errors
```bash
# Check memory usage
free -m
df -h

# Clear PM2 logs
pm2 flush

# Restart application
pm2 restart celeparty-fe

# Clear system cache if needed
echo 3 > /proc/sys/vm/drop_caches
```

### Application Won't Start
```bash
# Check available memory
free -m

# Increase swap if needed
sudo swapon --show

# Check PM2 logs
pm2 logs celeparty-fe --lines 50
```

## 📊 **Monitoring Commands**

```bash
# Real-time memory monitoring
watch -n 2 'free -m && echo "---" && pm2 list'

# Application logs
pm2 logs celeparty-fe --lines 100

# Nginx access logs
tail -f /var/log/nginx/access.log

# System resource usage
htop
```

## ✅ **Success Indicators**

Deployment berhasil jika:
- Memory usage < 800MB
- Application start time < 30 detik
- Response time < 2 detik
- No out-of-memory errors dalam logs

## 🎯 **Key Benefits**

1. **Build di GitHub** - Server tidak perlu compile, hemat memory
2. **Production-only dependencies** - Install minimal packages
3. **Memory limits** - Prevent memory leaks
4. **Aggressive caching** - Reduce server load
5. **Swap file** - Backup untuk memory spikes

Server 1GB RAM Anda sekarang siap untuk production dengan optimasi maksimal! 🚀
