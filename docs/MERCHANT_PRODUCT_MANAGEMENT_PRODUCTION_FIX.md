# Merchant Product Management Fix - Production API Issues

## Issue Summary
Merchants were unable to:
1. View their products on the deployed site
2. Add new products
3. Upload product images

**Root Cause**: Frontend was making API calls to `/api/...` which resolves to the frontend's domain in production, not the backend API. This caused requests to return HTML instead of JSON.

## Changes Made

### 1. Frontend API Configuration (`frontend/src/lib/api.ts`)
**Problem**: API base URL was not properly configured for production
**Solution**: 
- Added explicit logging of API base URL and environment
- Ensured production always uses full backend URL
- Added fallback to hardcoded URL if environment variable is missing

```typescript
const getBaseURL = () => {
  if (import.meta.env.DEV) {
    return '/api'; // Vite proxy for development
  }
  
  // Production: MUST use full backend URL
  const apiUrl = import.meta.env.VITE_API_URL || 'https://nairobi-verified-backend-4c1b.onrender.com/api';
  
  console.log('🌐 API Base URL:', apiUrl);
  return apiUrl;
};
```

### 2. Product Management Component (`frontend/src/pages/merchant/ProductManagement.tsx`)
**Problem**: Component was using direct `axios` calls with relative URLs `/api/...`
**Solution**: Replaced all axios calls with the configured `api` instance

**Changed**:
- `import axios from "axios"` → `import api from "@/lib/api"`
- `axios.get("/api/merchants/dashboard/products")` → `api.get("/merchants/dashboard/products")`
- `axios.post("/api/uploads/products", ...)` → `api.post("/uploads/products", ...)`
- `axios.put("/api/merchants/dashboard/products/${id}", ...)` → `api.put("/merchants/dashboard/products/${id}", ...)`
- `axios.patch("/api/merchants/dashboard/products/${id}/availability", ...)` → `api.patch("/merchants/dashboard/products/${id}/availability", ...)`
- `axios.delete("/api/merchants/dashboard/products/${id}")` → `api.delete("/merchants/dashboard/products/${id}")`

**Benefits**:
- Centralized API configuration
- Automatic base URL handling
- Consistent headers and credentials
- Better error handling
- Proper CORS handling

### 3. Environment Configuration (`frontend/.env.production`)
**Created**: New environment file for production builds

```env
VITE_API_URL=https://nairobi-verified-backend-4c1b.onrender.com/api
```

## Testing Checklist

### Local Development
- [ ] Products load correctly
- [ ] Can create new products
- [ ] Can upload product images
- [ ] Can update existing products
- [ ] Can delete products
- [ ] Can toggle product availability

### Production Deployment
- [ ] Build succeeds with production env vars
- [ ] API calls use correct backend URL
- [ ] Products load for merchants
- [ ] Image uploads work
- [ ] CORS headers are correct
- [ ] Authentication cookies work across domains

## Deployment Steps

1. **Frontend Deployment**:
   ```bash
   cd frontend
   npm run build
   # Deploy dist/ folder to your hosting service
   ```

2. **Verify Environment Variables**:
   - Ensure `VITE_API_URL` is set in your deployment platform
   - Or the `.env.production` file is included in the build

3. **Test After Deployment**:
   - Open browser dev console
   - Log in as merchant
   - Check console logs for: `🌐 API Base URL: https://nairobi-verified-backend-4c1b.onrender.com/api`
   - Verify API requests go to backend domain, not frontend domain

## Debugging in Production

If issues persist, check these in the browser console:

1. **API Base URL**: Look for the log `🌐 API Base URL: ...`
   - Should show: `https://nairobi-verified-backend-4c1b.onrender.com/api`
   - NOT: `/api` or frontend domain

2. **Network Tab**: Check actual request URLs
   - Should be: `https://nairobi-verified-backend-4c1b.onrender.com/api/merchants/dashboard/products`
   - NOT: `https://your-frontend-domain.com/api/merchants/dashboard/products`

3. **Response Content-Type**: Should be `application/json`, not `text/html`

4. **CORS Headers**: Check response has:
   - `Access-Control-Allow-Origin`
   - `Access-Control-Allow-Credentials: true`

## Related Files Modified
- `/workspaces/nairobi-verified/frontend/src/lib/api.ts`
- `/workspaces/nairobi-verified/frontend/src/pages/merchant/ProductManagement.tsx`
- `/workspaces/nairobi-verified/frontend/.env.production` (created)

## Backend Endpoints (No Changes Required)
These endpoints were already working correctly:
- `GET /api/merchants/dashboard/products` - Fetch merchant's products
- `POST /api/merchants/dashboard/products` - Create new product
- `PUT /api/merchants/dashboard/products/:id` - Update product
- `DELETE /api/merchants/dashboard/products/:id` - Delete product
- `PATCH /api/merchants/dashboard/products/:id/availability` - Toggle availability
- `POST /api/uploads/products` - Upload product images

## Key Learnings
1. **Never use relative URLs in production**: Always use configured API instance
2. **Environment variables are critical**: Production builds need different configs
3. **Vite proxy only works in dev**: Production has no proxy, needs full URLs
4. **Import from centralized config**: Don't import `axios` directly in components
5. **Test in production early**: Local dev can hide URL resolution issues
