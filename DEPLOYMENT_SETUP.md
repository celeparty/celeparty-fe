# CI/CD Deployment Setup Guide

This guide will help you set up automatic deployment from GitHub to your Digital Ocean server.

## 🔐 GitHub Secrets Configuration

Go to your GitHub repository → Settings → Secrets and variables → Actions, then add the following secrets:

### Server Connection Secrets
- `DO_HOST`: `165.22.98.216`
- `DO_USERNAME`: `root`
- `DO_PASSWORD`: `celeparty1.ID`

### Environment Variables Secrets
You need to add all the environment variables that your Next.js application requires:

- `URL_BASE`: Your base URL (e.g., `https://celeparty.com`)
- `URL_API`: Your API URL
- `BASE_API`: Your base API endpoint
- `URL_MEDIA`: Your media/upload URL
- `KEY_API`: Your API key
- `BASE_API_REGION`: Your API region
- `KEY_REGION`: Your region key
- `NEXTAUTH_SECRET`: NextAuth secret key
- `NEXTAUTH_URL`: NextAuth URL (e.g., `https://celeparty.com`)
- `JWT_SECRET`: JWT secret key

## 🖥️ Digital Ocean Server Setup

### 1. Initial Server Setup
```bash
# Update system packages
apt update && apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Install Git
apt-get install -y git

# Install PM2 (Process Manager)
npm install -g pm2

# Install Nginx (if not already installed)
apt-get install -y nginx
```

### 2. Project Directory Setup
```bash
# Create project directory
mkdir -p /var/www/celeparty.com
cd /var/www/celeparty.com

# Clone your repository
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git celeparty-fe
cd celeparty-fe

# Set proper ownership
chown -R www-data:www-data /var/www/celeparty.com
```

### 3. Nginx Configuration
Create or update `/etc/nginx/sites-available/celeparty.com`:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name celeparty.com www.celeparty.com;

    # Redirect HTTP to HTTPS (if you have SSL)
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name celeparty.com www.celeparty.com;

    # SSL Configuration (add your SSL certificate paths)
    # ssl_certificate /path/to/your/certificate.pem;
    # ssl_certificate_key /path/to/your/private.key;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files caching
    location /_next/static {
        alias /var/www/celeparty.com/celeparty-fe/.next/static;
        expires 365d;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
}
```

Enable the site:
```bash
ln -s /etc/nginx/sites-available/celeparty.com /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### 4. PM2 Setup
```bash
cd /var/www/celeparty.com/celeparty-fe

# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'celeparty-fe',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/celeparty.com/celeparty-fe',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    max_memory_restart: '1G',
    error_file: '/var/log/pm2/celeparty-fe-error.log',
    out_file: '/var/log/pm2/celeparty-fe-out.log',
    log_file: '/var/log/pm2/celeparty-fe.log'
  }]
}
EOF

# Create log directory
mkdir -p /var/log/pm2

# Start the application
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 🚀 How the Deployment Works

1. **Trigger**: Push to `master` branch triggers the workflow
2. **Build**: GitHub Actions builds your Next.js application
3. **Deploy**: Code is deployed to `/var/www/celeparty.com/celeparty-fe`
4. **Backup**: Previous version is backed up automatically
5. **Restart**: PM2 process and Nginx are restarted

## 🔍 Monitoring and Logs

### PM2 Logs
```bash
# View logs
pm2 logs celeparty-fe

# Monitor processes
pm2 monit

# Restart application
pm2 restart celeparty-fe
```

### Nginx Logs
```bash
# Access logs
tail -f /var/log/nginx/access.log

# Error logs
tail -f /var/log/nginx/error.log
```

## 🛠️ Troubleshooting

### If deployment fails:
1. Check GitHub Actions logs
2. Verify all secrets are properly set
3. Ensure server has enough disk space
4. Check PM2 and Nginx status

### Common commands:
```bash
# Check PM2 status
pm2 status

# Check Nginx status
systemctl status nginx

# Check disk space
df -h

# Check server logs
journalctl -f
```

## 🔒 Security Recommendations

1. **Firewall**: Configure UFW to only allow necessary ports
2. **SSH**: Use SSH keys instead of password authentication
3. **SSL**: Install SSL certificate (Let's Encrypt recommended)
4. **Updates**: Keep server packages updated
5. **Monitoring**: Set up monitoring and alerting

## 📝 Next Steps

1. Add all required secrets to GitHub repository
2. Test the deployment by pushing to master branch
3. Monitor the deployment logs
4. Set up SSL certificate for HTTPS
5. Configure domain DNS to point to your server

Your CI/CD pipeline is now ready! Every push to the master branch will automatically deploy your application to Digital Ocean.
