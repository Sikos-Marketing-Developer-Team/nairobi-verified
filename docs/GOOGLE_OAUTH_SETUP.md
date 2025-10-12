# 🔐 Google OAuth Setup Guide

## Current Issue
```
Access blocked: Authorization Error
Error 400: origin_mismatch
The given origin is not allowed for the given client ID.
```

## 🛠️ Solution Steps

### 1. **Google Cloud Console Configuration**

You need to update your Google OAuth client configuration in Google Cloud Console:

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Navigate to**: APIs & Services > Credentials
3. **Find your OAuth 2.0 Client ID**: `678719843428-fa9jpmal562mldr1ra3alf3322docguv.apps.googleusercontent.com`
4. **Click Edit** on your OAuth client

### 2. **Add Authorized JavaScript Origins**

Add these origins to your OAuth client:

```
https://nairobi-verified-frontend.onrender.com
http://localhost:3000
http://localhost:5173
https://localhost:3000
https://localhost:5173
```

### 3. **Add Authorized Redirect URIs**

Add these redirect URIs:

```
https://nairobi-verified-frontend.onrender.com/auth
https://nairobi-verified-frontend.onrender.com/auth/callback
https://nairobi-verified-backend-4c1b.onrender.com/api/auth/google/callback
http://localhost:3000/auth
http://localhost:3000/auth/callback
http://localhost:5173/auth
http://localhost:5173/auth/callback
```

### 4. **Current Configuration**

**Client ID**: `678719843428-fa9jpmal562mldr1ra3alf3322docguv.apps.googleusercontent.com`
**Client Secret**: `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`

## 🧪 **Testing Google OAuth**

After updating the Google Cloud Console configuration, test with these steps:

1. **Clear browser cache and cookies**
2. **Go to**: https://nairobi-verified-frontend.onrender.com/auth
3. **Click "Sign in with Google"**
4. **Should work without origin_mismatch error**

## 🔄 **Alternative: Create New OAuth Client**

If you can't access the existing OAuth client, create a new one:

1. **Go to Google Cloud Console > APIs & Services > Credentials**
2. **Click "Create Credentials" > "OAuth 2.0 Client ID"**
3. **Application type**: Web application
4. **Name**: Nairobi Verified
5. **Authorized JavaScript origins**:
   - `https://nairobi-verified-frontend.onrender.com`
   - `http://localhost:3000`
   - `http://localhost:5173`
6. **Authorized redirect URIs**:
   - `https://nairobi-verified-frontend.onrender.com/auth`
   - `https://nairobi-verified-backend-4c1b.onrender.com/api/auth/google/callback`
   - `http://localhost:3000/auth`

Then update the environment variables with the new client ID and secret.

## 📝 **Environment Variables**

Current configuration in `.env` files:

**Backend (.env)**:
```
GOOGLE_CLIENT_ID=678719843428-fa9jpmal562mldr1ra3alf3322docguv.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
```

**Frontend (.env)**:
```
VITE_GOOGLE_CLIENT_ID=678719843428-fa9jpmal562mldr1ra3alf3322docguv.apps.googleusercontent.com
```

## ✅ **Verification**

After configuration, Google OAuth should:
1. ✅ Allow sign-in from production domain
2. ✅ Create new users automatically
3. ✅ Link existing users by email
4. ✅ Set profile pictures from Google
5. ✅ Mark accounts as verified