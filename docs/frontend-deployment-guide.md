# Frontend Deployment Guide

This guide explains how to deploy the Nairobi Verified frontend to Render.

## Prerequisites

1. A Render account (https://render.com)
2. The backend already deployed to Render at https://nairobi-verified-backend.onrender.com

## Deployment Steps

### Option 1: Deploy using the render.yaml file

1. Fork or clone the repository to your GitHub account
2. Connect your GitHub account to Render
3. In Render, click "New" and select "Blueprint"
4. Select the repository containing the Nairobi Verified project
5. Render will automatically detect the `render.yaml` file and set up the services
6. Review the settings and click "Apply"
7. Wait for the deployment to complete

### Option 2: Manual deployment

1. In Render, click "New" and select "Web Service"
2. Connect your GitHub repository
3. Configure the service:
   - **Name**: nairobi-verified-frontend
   - **Environment**: Node
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Start Command**: `cd frontend && npm start`
4. Add the following environment variables:
   - `NEXT_PUBLIC_API_URL`: https://nairobi-verified-backend.onrender.com/api
   - `NODE_ENV`: production
5. Click "Create Web Service"

## Verifying the Deployment

1. Once deployed, Render will provide a URL for your frontend (e.g., https://nairobi-verified-frontend.onrender.com)
2. Visit the URL to ensure the frontend is working correctly
3. Test the following functionality:
   - User registration (client and merchant)
   - User login
   - Product browsing
   - Merchant document submission
   - Admin verification process

## Troubleshooting

If you encounter issues with the deployment:

1. Check the Render logs for any errors
2. Verify that the environment variables are set correctly
3. Ensure the backend is accessible from the frontend
4. Check for CORS issues if the frontend cannot communicate with the backend

## Custom Domain Setup (Optional)

To use a custom domain with your Render deployment:

1. In the Render dashboard, select your web service
2. Go to the "Settings" tab
3. Scroll down to the "Custom Domain" section
4. Click "Add Custom Domain" and follow the instructions

## Continuous Deployment

Render automatically deploys changes when you push to the connected repository. To disable this:

1. Go to the "Settings" tab of your web service
2. Scroll to the "Deploy Hooks" section
3. Configure the auto-deploy settings as needed