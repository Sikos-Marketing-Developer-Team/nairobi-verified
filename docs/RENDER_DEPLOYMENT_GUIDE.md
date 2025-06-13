# 🚀 Complete Render Deployment Guide

## **Step-by-Step Deployment Process**

### **Phase 1: Backend Deployment (API)**

#### **Step 1: Prepare Your Code**

1. **Commit all changes:**
```bash
git add .
git commit -m "Prepare for Render deployment with merchant onboarding system"
git push origin main
```

#### **Step 2: Create Render Account**

1. Go to [render.com](https://render.com)
2. Sign up with your GitHub account
3. Connect your GitHub repository

#### **Step 3: Deploy Backend**

1. **In Render Dashboard:**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository: `nairobi`

2. **Configure Backend Service:**
   ```
   Name: nairobi-cbd-backend
   Runtime: Node
   Build Command: npm install
   Start Command: npm start
   Root Directory: backend
   ```

3. **Environment Variables (CRITICAL):**
   Add these in Render's Environment Variables section:

   ```bash
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=mongodb+srv://judekimathii:Kamundis@nairobiverified.mvbwr.mongodb.net/
   JWT_SECRET=mark1234
   JWT_EXPIRE=7d
   CLOUDINARY_CLOUD_NAME=dzs7bswxi
   CLOUDINARY_API_KEY=855572753332886
   CLOUDINARY_API_SECRET=lEPxhcvEx4o_BmLbRSdhP9LPzPU
   EMAIL_USER=markkamau56@gmail.com
   EMAIL_PASS=huby vvak ijnb gpxi
   EMAIL_SERVICE=gmail
   EMAIL_FROM=markkamau56@gmail.com
   EMAIL_FROM_NAME=Nairobi CBD Directory
   GOOGLE_CLIENT_ID=678719843428-fa9jpmal562mldr1ra3alf3322docguv.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=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
   FRONTEND_URL=https://nairobi-cbd-frontend.onrender.com
   ```

4. **Advanced Settings:**
   - Auto-Deploy: Yes
   - Branch: main
   - Health Check Path: `/api/health` (we'll add this)

5. **Click "Create Web Service"**

#### **Step 4: Add Health Check Endpoint**

Add this to your `backend/server.js` (if not already exists):

```javascript
// Health check endpoint for Render
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Nairobi CBD Backend is running',
    timestamp: new Date().toISOString() 
  });
});
```

#### **Step 5: Wait for Backend Deployment**
- Monitor logs in Render dashboard
- Note down your backend URL: `https://your-backend-app.onrender.com`

---

### **Phase 2: Frontend Deployment**

#### **Step 1: Update API Configuration**

Update `src/config/api.js` with your actual backend URL:

```javascript
const config = {
  development: {
    API_URL: 'http://localhost:5000/api',
    BASE_URL: 'http://localhost:5000'
  },
  production: {
    API_URL: 'https://your-actual-backend-url.onrender.com/api',
    BASE_URL: 'https://your-actual-backend-url.onrender.com'
  }
};
```

#### **Step 2: Create Frontend Build Configuration**

1. **Add build script to frontend package.json:**
```json
{
  "scripts": {
    "build": "npm run build:css && vite build",
    "build:css": "tailwindcss -i ./src/index.css -o ./dist/output.css --minify"
  }
}
```

#### **Step 3: Deploy Frontend**

1. **In Render Dashboard:**
   - Click "New +" → "Static Site"
   - Connect the same GitHub repository

2. **Configure Frontend Service:**
   ```
   Name: nairobi-cbd-frontend
   Branch: main
   Root Directory: (leave empty - it's the root)
   Build Command: npm ci --include=dev && npm run build
   Publish Directory: dist
   ```

3. **Environment Variables:**
   ```bash
   NODE_ENV=production
   VITE_API_URL=https://your-backend-app.onrender.com/api
   ```

4. **Click "Create Static Site"**

---

### **Phase 3: Post-Deployment Configuration**

#### **Step 1: Update Backend with Frontend URL**

1. Go to your backend service in Render
2. Update environment variable:
   ```bash
   FRONTEND_URL=https://your-frontend-app.onrender.com
   ```

#### **Step 2: Update CORS Configuration**

Update your backend CORS settings in `backend/server.js`:

```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:8080', 
    'https://your-frontend-app.onrender.com'
  ],
  credentials: true
}));
```

#### **Step 3: Test Deployment**

1. **Backend Health Check:**
   - Visit: `https://your-backend-app.onrender.com/api/health`
   - Should return: `{"status":"OK","message":"Nairobi CBD Backend is running"}`

2. **Frontend Access:**
   - Visit: `https://your-frontend-app.onrender.com`
   - Should load the Nairobi CBD Directory homepage

3. **Admin Panel Test:**
   - Visit: `https://your-frontend-app.onrender.com/admin/merchants/add`
   - Test creating a merchant account

---

### **Phase 4: Email Configuration for Production**

#### **Update Email Scheduler for Production**

Update the script to use production URLs:

```bash
# On your production backend (via Render shell or update code)
cd backend
FRONTEND_URL=https://your-frontend-app.onrender.com node scripts/sendScheduledEmails.js
```

---

## **🔧 Complete Checklist**

### **Pre-Deployment:**
- [ ] All code committed and pushed to GitHub
- [ ] Environment variables prepared
- [ ] API endpoints tested locally
- [ ] Email system tested locally

### **Backend Deployment:**
- [ ] Render account created
- [ ] Backend service configured
- [ ] Environment variables set
- [ ] Health check endpoint added
- [ ] Backend deployed successfully
- [ ] Backend URL noted

### **Frontend Deployment:**
- [ ] API configuration updated with backend URL
- [ ] Frontend service configured
- [ ] Build configuration verified
- [ ] Frontend deployed successfully
- [ ] Frontend URL noted

### **Post-Deployment:**
- [ ] CORS configuration updated
- [ ] Frontend URL added to backend env vars
- [ ] Both services redeployed
- [ ] Health checks passing
- [ ] Admin panel accessible
- [ ] Merchant creation tested

### **Email System:**
- [ ] Email credentials verified in production
- [ ] Test merchant creation with email
- [ ] Schedule emails for tomorrow 7 AM

---

## **🎯 Expected Results**

After successful deployment:

### **✅ Working URLs:**
- **Backend API:** `https://your-backend-app.onrender.com/api`
- **Frontend App:** `https://your-frontend-app.onrender.com`
- **Admin Panel:** `https://your-frontend-app.onrender.com/admin/merchants/add`
- **Health Check:** `https://your-backend-app.onrender.com/api/health`

### **✅ Working Features:**
- [x] Merchant directory browsing
- [x] User authentication
- [x] Admin dashboard
- [x] Merchant account creation
- [x] Email system with welcome emails
- [x] Account setup workflow
- [x] All 12 merchants in database
- [x] Tomorrow's 7 AM email delivery ready

---

## **📧 Send Scheduled Emails in Production**

Tomorrow morning, run this command to send all welcome emails:

### **Option 1: Via Render Shell**
1. Go to your backend service in Render
2. Click "Shell" tab
3. Run: `node scripts/sendScheduledEmails.js`

### **Option 2: Set up Cron Job (Recommended)**

Add this to your backend for automatic email sending:

```javascript
// backend/utils/scheduler.js
const cron = require('node-cron');
const { sendQueuedEmails } = require('../scripts/sendScheduledEmails');

// Schedule emails for 7 AM daily
cron.schedule('0 7 * * *', async () => {
  console.log('⏰ Running scheduled email delivery...');
  try {
    await sendQueuedEmails();
  } catch (error) {
    console.error('❌ Scheduled email delivery failed:', error);
  }
});
```

---

## **🔍 Troubleshooting**

### **Common Issues:**

1. **Build Failures:**
   - **"vite: not found" error:** Ensure Vite is in `dependencies`, not `devDependencies`
   - **Missing TypeScript:** Move TypeScript and @vitejs/plugin-react-swc to `dependencies` 
   - Check build logs in Render dashboard
   - Verify all dependencies are in package.json
   - Ensure environment variables are set
   - Use build command: `npm ci --include=dev && npm run build` if needed

2. **CORS Errors:**
   - Update CORS origins with actual deployed URLs
   - Ensure credentials: true is set

3. **Database Connection:**
   - Verify MongoDB URI is correct
   - Check IP whitelist in MongoDB Atlas

4. **Email Issues:**
   - Test email credentials
   - Check Gmail app password (not regular password)
   - Verify email service configuration

5. **Dependency Issues:**
   - Build tools (Vite, TypeScript, build plugins) should be in `dependencies` for static sites
   - Only linting and development tools should remain in `devDependencies`

---

## **💡 Pro Tips**

1. **Use Git for Updates:**
   - Any code changes → git push → auto-deploys

2. **Monitor Logs:**
   - Always check Render logs for errors
   - Use console.log for debugging

3. **Environment Variables:**
   - Never commit .env files
   - Use Render's environment variable interface

4. **Performance:**
   - Render free tier sleeps after 15 min inactivity
   - Consider upgrading for production use

---

## **🎉 Success Verification**

Your deployment is successful when:

1. ✅ Both frontend and backend URLs are accessible
2. ✅ Admin can create merchant accounts via web interface  
3. ✅ Welcome emails are sent with correct production URLs
4. ✅ Merchants can complete account setup via setup links
5. ✅ All 12 initial merchants are in the database
6. ✅ Email scheduler ready for tomorrow 7 AM delivery

**Your Nairobi CBD Business Directory is now live and ready for merchants! 🚀**