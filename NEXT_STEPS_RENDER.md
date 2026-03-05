# Render Deployment Guide (separate frontend and backend)

This document assumes you will deploy the **backend** as one Web Service and the **frontend** as a separate Static Site on Render. Do not try to bundle them into a single service; follow the steps below exactly.

1. **Push your code** – commit everything and push to the branch you intend to deploy (e.g. `main`). The repo must contain `backend` and `frontend` directories.
2. **Local sanity check** – run both parts locally and verify full functionality:
   ```bash
   # backend
   cd backend && npm install && npm run dev
   # frontend
   cd ../frontend && npm install && npm run dev
   ```
   Confirm registration, login, map geolocation, chatbot, news, lab results, reviews, etc.
3. **Confirm structure**
   - `backend/package.json` contains a `start` script (`node server.js`).
   - `backend/server.js` reads `process.env.PORT || 4000`. **Important:** if deploying frontend separately, delete or comment out the production static‑file middleware block that serves `../frontend/dist/index.html` – the directory won't exist in the backend service and attempting to access it will cause an ENOENT error (see troubleshooting note below).
   - `frontend/package.json` supports `npm run build` producing a `dist` folder.
   - `frontend/vite.config.js` proxies `/api` to the backend during development.
4. **Gitignore secrets** – ensure `.env` and any JSON data files are listed in `.gitignore`.

---

## Backend service setup

1. On Render, click **New → Web Service**.
2. Choose your GitHub repository and branch.
3. Settings to enter:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm run start`
4. In the **Environment** section add each key/value pair below. Type the key exactly and paste the corresponding value on the right. Leave values blank if you do not use that feature.
   - `JWT_SECRET` – a long random string for signing JWTs.
   - `JWT_EXPIRES` – token lifetime, e.g. `7d`.
   - `FRONTEND_URL` – the URL of your frontend service (you will fill this after the frontend deploys).
   - `NEWS_API_KEY` – your NewsAPI (or equivalent) key, used by `/api/medical-news`.
   - `ML_SERVICE_URL` – if the optional ML service is deployed separately.
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `FROM_EMAIL` – for the forgot‑password email feature.
   - `NODE_ENV` – set to `production`.
   - `DATABASE_URL` – add later if you attach an external database.
5. Save the service and wait for Render to build. Note the backend URL it assigns (e.g. `https://my-backend.onrender.com`).
6. Under **Settings → Health**, set the Health Check URL to:
   ```
   https://<your-backend>.onrender.com/api/health
   ```

---

## Frontend service setup

1. Click **New → Static Site**.
2. Select the same repository/branch.
3. Provide the following values:
   - **Root Directory**: `frontend`            
     *(this tells Render to `cd frontend` before running any commands)*
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`              
     *(because the root is already `frontend`, the output path is `frontend/dist` on disk)*
4. (Optional) Environment vars only if your frontend reads them:
   - `REACT_APP_API_BASE` or equivalent – set to the backend URL, e.g. `https://my-backend.onrender.com`.
5. Create the service and wait for the build. Record the frontend URL.

> ⚠️ **Common error**: if you leave **Root Directory** blank and set **Publish Directory** to `frontend/dist`, Render will look for `frontend/frontend/dist` and fail with "Publish directory frontend/dist does not exist". Make sure the publish path is relative to the root directory.

---

## Post‑deployment configuration

1. Return to the backend service’s **Environment** tab and set `FRONTEND_URL` to the frontend URL obtained above.
2. If you forgot to add `NEWS_API_KEY` earlier, add it now and redeploy the backend.
3. Visit the frontend URL; register a user and test every feature. In the browser network tab ensure `/api/*` calls go to the backend URL and return `200`.
4. The news page should display headlines; if it doesn’t, verify `NEWS_API_KEY` is correct.
5. For email workflows, confirm SMTP settings work by using the forgot‑password flow.

---

## Ongoing maintenance

- Push code to the monitored branch to trigger rebuilds on both services.
- Edit environment variables via the Render dashboard’s **Environment** section; each change requires a redeploy.
- Monitor each service’s logs for runtime errors.
- If the backend build or runtime logs show errors about missing `frontend/dist/index.html`, remove or disable the static serving code in `backend/server.js` (it’s only needed for a combined service). An easy way is wrapping it in a guard such as `if (process.env.SERVE_STATIC === 'true')` or simply deleting the block before deploying.
- Add custom domains through the Render dashboard when ready.

---

These instructions deliberately cover only the separate‑service scenario. Follow them step by step, entering the build command, root directory and environment variables exactly as specified; the left‑hand field is the name you type, the right‑hand field is the value you paste. That’s all there is to it.