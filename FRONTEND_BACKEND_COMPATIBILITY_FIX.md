# 🔧 FRONTEND COMPATIBILITY FIX - Backend Changes

## 🔴 Problem

Frontend tidak dapat diakses setelah backend updates untuk path module resolution.

## 🔍 Analysis

### Backend Changes Applied:
1. **Path Resolution Fix** - Using `path.join(__dirname, ...)` instead of relative paths
2. **Schema Cleanup** - Removed duplicate fields
3. **Lifecycle Updates** - Email sending with professional PDF

### Potential Frontend Issues:

1. **Missing .env.local** - Environment variables not configured
2. **API Base URL** - Frontend doesn't know backend URL
3. **CORS** - Backend might be rejecting frontend requests
4. **Auth Tokens** - Session might be invalid after backend restart

---

## ✅ Solution

### Step 1: Create .env.local File

Create this file in celeparty-fe root:

```bash
cat > /var/www/celeparty-fe/.env.local << 'EOF'
# Backend API Configuration
BASE_API=http://localhost:1337
URL_API=http://localhost:1337/api
URL_BASE=http://localhost:3000

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-change-this-in-production

# Payment Gateway (Midtrans)
NEXT_PUBLIC_CLIENT_KEY=your-midtrans-client-key

# Environment
PRODUCTION_MODE=false
EOF
```

### Step 2: Clear Frontend Cache & Rebuild

```bash
cd /var/www/celeparty-fe
rm -rf .next node_modules/.cache
npm run build
pm2 restart celeparty.com
```

### Step 3: Verify Frontend is Running

```bash
curl http://localhost:3000
# Should return HTML (not error)

pm2 log celeparty.com | tail -20
# Should show no errors
```

---

## 📋 Configuration Checklist

### Environment Variables Needed:

| Variable | Value | Where Used |
|----------|-------|-----------|
| `BASE_API` | `http://localhost:1337` | NextAuth, API calls |
| `URL_API` | `http://localhost:1337/api` | Axios calls |
| `NEXTAUTH_URL` | `http://localhost:3000` | NextAuth callbacks |
| `NEXTAUTH_SECRET` | Long random string | JWT signing |
| `PRODUCTION_MODE` | `true/false` | Midtrans URL selection |

---

## 🚀 Full Frontend Fix Guide

### For Local Development (Windows):

**1. Create .env.local in VS Code:**

File: `d:\laragon\www\celeparty-fe\.env.local`
```
BASE_API=http://localhost:1337
URL_API=http://localhost:1337/api
URL_BASE=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=development-secret-key-change-in-production
PRODUCTION_MODE=false
```

**2. Rebuild Frontend:**

```bash
cd d:\laragon\www\celeparty-fe
npm run build
npm start
```

### For Production (Ubuntu):

**1. SSH to server:**

```bash
ssh root@papi.celeparty.com
```

**2. Create production .env:**

```bash
cat > /var/www/celeparty-fe/.env.local << 'EOF'
BASE_API=https://papi.celeparty.com
URL_API=https://papi.celeparty.com/api
URL_BASE=https://celeparty.com
NEXTAUTH_URL=https://celeparty.com
NEXTAUTH_SECRET=your-long-random-secret-key-here
PRODUCTION_MODE=true
NEXT_PUBLIC_CLIENT_KEY=your-production-midtrans-key
EOF
```

**3. Rebuild and restart:**

```bash
cd /var/www/celeparty-fe
npm run build
pm2 restart celeparty.com
```

---

## 🧪 Testing After Fix

### Test 1: Frontend Loads
```bash
curl -I http://localhost:3000
# Should return: HTTP/1.1 200 OK
```

### Test 2: Backend API Accessible
```bash
curl http://localhost:1337/api/transactions
# Should return JSON (or 401 if auth required)
```

### Test 3: Login Works
1. Go to http://localhost:3000
2. Try to login with test credentials
3. Should redirect to dashboard if successful

### Test 4: API Calls Work
1. Check browser console (F12)
2. Should NOT show CORS errors
3. Network tab should show successful API calls to backend

---

## 🔍 Troubleshooting

### If Frontend Still Not Loading:

**Check 1: Process Status**
```bash
# On production server
pm2 status

# Should show celeparty.com as "online"
```

**Check 2: Logs**
```bash
pm2 log celeparty.com | tail -50
# Look for errors
```

**Check 3: Port Availability**
```bash
lsof -i :3000
# Should show node process
```

**Check 4: Environment Variables**
```bash
cat /var/www/celeparty-fe/.env.local
# Verify all variables are set
```

### If CORS Error (Browser Console):

**Add CORS Headers to Backend** (`src/api/middlewares.js`):

```javascript
// In Strapi middlewares.js, add before other exports:
module.exports = ({ env }) => [
  // ... other middlewares ...
  'strapi::cors',
];
```

Then restart Strapi:
```bash
pm2 restart strapi
```

---

## 📝 Files to Create/Modify

### 1. Frontend .env.local (NEW)
```
Path: /var/www/celeparty-fe/.env.local
Content: [See Configuration Checklist above]
```

### 2. Backend CORS Config (IF NEEDED)
```
Path: /var/www/papi.celeparty.com/app/src/api/middlewares.js
Action: Ensure CORS is enabled
```

---

## ✅ Expected Results

After applying this fix:

- ✅ Frontend loads on http://localhost:3000
- ✅ No CORS errors in browser console
- ✅ Login page works
- ✅ API calls succeed
- ✅ Email sending works with new PDF design
- ✅ Dashboard displays correctly

---

## 🎯 Summary of Changes

| Component | Change | Reason |
|-----------|--------|--------|
| **Frontend .env** | Created | Missing API configuration |
| **API Base URL** | Set to backend | Frontend needs to know where backend is |
| **CORS** | Verify enabled | Frontend needs to call backend API |
| **Cache** | Cleared | Old cache might have old config |

---

**Time to Fix:** 5-10 minutes  
**Difficulty:** Easy  
**Risk:** Very Low  

Apply this and let me know if frontend works! 🚀
