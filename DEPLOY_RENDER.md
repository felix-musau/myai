# Deploy to Render - Step by Step Guide

This project consists of 3 services that need to be deployed separately on Render:
1. **ML Service** - Python FastAPI service (port 8000)
2. **Backend** - Node.js Express API (port 4000)
3. **Frontend** - React/Vite app served via Nginx (port 3000)

## Prerequisites

1. Create a [Render account](https://render.com)
2. Install [Git](https://git-scm.com) and push your code to GitHub

## Step 1: Prepare for Deployment

### Update Environment Variables

Create a `.env` file in the `backend` folder with:
```
PORT=4000
JWT_SECRET=your-super-secret-jwt-key-change-this
FRONTEND_URL=https://your-frontend.onrender.com
ML_SERVICE_URL=https://your-ml-service.onrender.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

> **Note:** For Gmail, you need to use an [App Password](https://support.google.com/accounts/answer/185833)

## Step 2: Deploy ML Service

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `myai-ml`
   - **Root Directory**: `ml_service`
   - **Build Command**: (leave empty)
   - **Start Command**: `python main.py`
5. Click **Create Web Service**

Wait for deployment to complete. Note the URL (e.g., `https://myai-ml.onrender.com`)

## Step 3: Deploy Backend

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `myai-backend`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. Add Environment Variables:
   - `PORT`: `4000`
   - `JWT_SECRET`: (your secret key)
   - `FRONTEND_URL`: (your frontend URL from Step 4)
   - `ML_SERVICE_URL`: (your ML service URL from Step 2)
   - `EMAIL_USER`: (your email)
   - `EMAIL_PASS`: (your app password)
6. Click **Create Web Service**

Wait for deployment to complete. Note the URL (e.g., `https://myai-backend.onrender.com`)

## Step 4: Deploy Frontend

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `myai-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `nginx -g daemon off;`
5. Add Environment Variable:
   - `VITE_API_URL`: `https://myai-backend.onrender.com`
6. Click **Create Web Service**

## Step 5: Update Backend Environment Variables

After frontend is deployed, go back to Backend service and update:
- `FRONTEND_URL`: Set to your frontend URL

## Architecture

```
User Browser
     │
     ▼
┌─────────────────────┐
│   Frontend (Nginx)  │  Port 3000
│   React App         │
└─────────┬───────────┘
          │
    ┌─────┴─────┐
    │           │
    ▼           ▼
┌─────────┐  ┌──────────────┐
│ Backend │  │ ML Service  │
│ Node.js │  │ Python      │
└────┬────┘  └─────────────┘
     │
     ▼
┌─────────────┐
│ LowDB JSON │
└─────────────┘
```

## Troubleshooting

### CORS Errors
- Ensure `FRONTEND_URL` is correctly set in backend environment variables
- The URL must match exactly (including https://)

### ML Service Not Responding
- Check ML service logs in Render dashboard
- Ensure the model file exists or is being created

### Email Not Working
- Use Gmail App Password, not your regular password
- Enable 2-Factor Authentication on Google Account

### Database Issues
- LowDB JSON files are stored in the container's ephemeral filesystem
- Data will be lost on redeploy
- For production, consider using PostgreSQL

## Important Notes

1. **Free Tier Limitations**: Render's free tier services sleep after 15 minutes of inactivity. First request after sleep may take time.

2. **HTTPS**: Render automatically provides SSL certificates.

3. **Custom Domain**: You can add a custom domain in Render dashboard settings.

4. **Environment Variables**: All sensitive data should be in environment variables, never commit them to Git.
