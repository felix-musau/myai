# Deploy to Render - Complete Step by Step Guide

This project has 3 parts that need to be deployed separately on Render:
1. **ML Service** - Python FastAPI (port 8000)
2. **Backend** - Node.js API (port 4000)  
3. **Frontend** - React website (port 3000)

---

## Step 1: Push Code to GitHub

1. Create a GitHub repository
2. Push all your code to it:
```
bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

---

## Step 2: Deploy ML Service (Python)

1. Go to https://dashboard.render.com and sign in
2. Click **"New +"** → **"Web Service"**
3. Find your GitHub repo and click **"Connect"**
4. Fill in these settings:
   - **Name**: `myai-ml`
   - **Root Directory**: `ml_service`
   - **Environment**: `Python`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python main.py`
5. Click **"Create Web Service"**
6. Wait for it to deploy. Note the URL (example: `https://myai-ml.onrender.com`)

---

## Step 3: Deploy Backend (Node.js)

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Find your GitHub repo and click **"Connect"**
4. Fill in these settings:
   - **Name**: `myai-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. Scroll down to **"Environment Variables"** and add:
   - `PORT` = `4000`
   - `JWT_SECRET` = `any-random-secret-key-change-this`
   - `ML_SERVICE_URL` = `https://myai-ml.onrender.com` (use your ML service URL from Step 2)
   - `FRONTEND_URL` = leave empty for now
   - `EMAIL_USER` = your@gmail.com
   - `EMAIL_PASS` = your-gmail-app-password
6. Click **"Create Web Service"**
7. Wait for it to deploy. Note the URL (example: `https://myai-backend.onrender.com`)

---

## Step 4: Deploy Frontend (React)

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Find your GitHub repo and click **"Connect"**
4. Fill in these settings:
   - **Name**: `myai-frontend`
   - **Root Directory**: `frontend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npx serve dist -l 3000`
5. Click **"Create Web Service"**
6. Wait for it to deploy. Note the URL (example: `https://myai-frontend.onrender.com`)

---

## Step 5: Update Backend with Frontend URL

1. Go to your **Backend** service on Render dashboard
2. Click **"Environment"** tab
3. Edit `FRONTEND_URL` and set it to your frontend URL (example: `https://myai-frontend.onrender.com`)
4. Click **"Save Changes"**

---

## Important Settings Summary

| Service | Build Command | Start Command |
|---------|---------------|---------------|
| ML Service | `pip install -r requirements.txt` | `python main.py` |
| Backend | `npm install` | `node server.js` |
| Frontend | `npm install && npm run build` | `npx serve dist -l 3000` |

---

## Troubleshooting

**ML Service error:**
- Make sure Python environment is selected
- Check that requirements.txt exists in ml_service folder

**Backend not connecting to ML:**
- Double-check ML_SERVICE_URL is correct
- Wait a minute for ML service to fully start

**CORS errors:**
- Make sure FRONTEND_URL is set correctly in backend environment variables
- The URL must include `https://`

**Frontend showing blank:**
- Make sure build completed successfully
- Check that `dist` folder was created

---

## Quick Test

After all 3 services are deployed, test:
1. Visit your frontend URL
2. Try the chatbot
3. If chatbot says "error", check backend logs for issues
