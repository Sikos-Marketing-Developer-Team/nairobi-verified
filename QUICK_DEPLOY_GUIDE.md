# 🚀 Quick Deployment Guide - Merchant Product Fix

## Issue
Merchants can't manage products on deployed site (works on localhost)

## Root Cause  
Frontend using `/api/...` URLs → returns HTML instead of JSON in production

## Fix Applied
✅ Use centralized `api` instance instead of direct `axios` calls
✅ Configure correct backend URL via environment variable
✅ Update Product Management and Dashboard components

## Deploy Now (3 Steps)

### 1️⃣ Build Frontend
```bash
cd frontend
./build-production.sh
```

### 2️⃣ Deploy `dist/` Folder
Upload to your hosting service with this environment variable:
```
VITE_API_URL=https://nairobi-verified-backend-4c1b.onrender.com/api
```

### 3️⃣ Verify Fix
Open browser console after deploying:
- Look for: `🌐 API Base URL: https://nairobi-verified-backend-4c1b.onrender.com/api`
- Test: Login as merchant → Product Management → Add Product
- Check: Network tab shows requests to backend domain (not frontend)

## Expected Result
✅ Products list loads
✅ Can add new products with images  
✅ Console shows JSON responses (not HTML)
✅ No "Failed to create product" errors

## If Issues Persist
Run verification: `./verify-production-fix.sh`

Check:
- Environment variable is set correctly
- Browser console shows correct API URL
- Network requests go to backend domain
- Responses are JSON (not HTML)

---
**Full Details**: See `PRODUCTION_FIX_SUMMARY.md`
