# Deployment Next Steps for Render

This document lists, **word for word**, the actions required to deploy and run the full stack app on Render. It assumes the repository contains both `frontend` and `backend` folders and the ML service in `ml_service`.

> **Tip:** Render supports monorepos. you can either create three separate services (backend, frontend, ml) pointing at subfolders, or deploy the entire repo as a single web service by building the frontend inside the backend and serving the static files. The following steps describe both approaches; pick the one you prefer.

---

## 1. Prepare codebase

1. Ensure all changes are committed and pushed to your GitHub repository (`main` or your target branch). Render will deploy from this repo.
2. Verify that `package.json` files exist in both `frontend` and `backend` directories and that the backend `start` script runs `node server.js`.
3. Confirm the backend listens on `process.env.PORT || 4000` and uses `cors`/`cookie-parser` as currently coded.
4. Ensure the frontend's `vite.config.js` proxy is set to `/api` pointing to the backend (already done); Render will serve frontend separately so API calls must use absolute URLs when deployed (see step 5).

## 2. Environment configuration on Render

When creating your Render services, the following environment variables must be added exactly as shown. Render lets you enter key/value pairs on the service settings page.

- `JWT_SECRET`: a long random string used by the backend for token signing.
- `JWT_EXPIRES`: (optional) e.g. `7d`.
- `FRONTEND_URL`: the URL Render assigns to your frontend (e.g. `https://my-app.onrender.com`) – this ensures emails and CORS are correct. If you use a single service, set this to the same URL.
- `ML_SERVICE_URL`: (only if you deploy the optional ML service separately) set this to the service's URL so the backend can call `POST ${ML_SERVICE_URL}/predict`. Defaults to `http://localhost:8000` for local work.
- `NEWS_API_KEY`: obtain a free API key from [NewsAPI.org](https://newsapi.org) (choose "Developer" plan), or use GNews similarly. Add to environment so `/api/medical-news` can fetch headlines. This is required only if you use the medical news page.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `FROM_EMAIL`: needed only if you plan to use the forgot-password feature; otherwise they can be left blank.
- `NODE_ENV`: set to `production`.

Also ensure `DATABASE_URL` or other secrets if you later integrate a DB.

## 3. Create Render services

1. **Backend Service**
   - Type: **Web Service**
   - Branch: choose your repo/branch
   - Build command: `cd backend && npm install`
   - Start command: `cd backend && npm run start` (or `node server.js`)
   - Environment: add the variables listed above
   - Set **Plan** according to your needs (free will suffice for small load).

2. **Frontend Service** (skip if you choose single-service deployment below)
   - Type: **Static Site** (Vite builds a static bundle)
   - Build command: `cd frontend && npm install && npm run build`
   - Publish directory: `frontend/dist`
   - Env var `API_BASE` (optional): if you modify the frontend to use it, set to your backend URL, e.g. `https://my-backend.onrender.com`.
   - CORS: the backend already allows any origin via `process.env.FRONTEND_URL` – update that value after you know the frontend URL.

   _Single‑service option (recommended since you want to deploy once):_ you only create **one** Web Service pointing at the repository root. In the build command, install & build both frontend and backend and copy the static files to the backend. Example command:
   ```bash
   cd frontend && npm install && npm run build && cd ../backend && npm install && npm run start
   ```
   or update `backend/package.json` to run a prestart script that builds the frontend and moves `frontend/dist` into `backend/public`.

   Add this middleware to `backend/server.js` (already added earlier):
   ```js
   if (process.env.NODE_ENV === 'production') {
     const _path = require('path')
     app.use(express.static(_path.join(__dirname, '../frontend/dist')))
     app.get('*', (req, res) => res.sendFile(_path.join(__dirname, '../frontend/dist/index.html')))
   }
   ```
   With this configuration Render will launch a single service at your repo root and serve the UI and API from the same domain.

3. **ML Service (Optional)**
   - Type: **Web Service**
   - Language: Python (use existing `ml_service` folder)
   - Build command: `cd ml_service && pip install -r requirements.txt`
   - Start command: `cd ml_service && uvicorn main:app --host 0.0.0.0 --port $PORT`
   - Env vars: none additional unless you change the ML code.
   - The backend calls this service on `localhost:8000` in development; after deployment you must update the URL in `backend/routes/chatbot.js` to the Render URL for the ML service (use an env variable like `ML_SERVICE_URL`).

## 4. Update API endpoints after deployment

1. In `frontend/src/pages/Home.jsx` and any other file calling `/api/...`, adjust fetch/axios base URLs to the full backend address, for example:
   ```js
   const res = await fetch(`${process.env.REACT_APP_API_BASE}/chat`, { ... })
   ```
   or set a global axios instance with `baseURL`.
2. Optionally, use environment variables (`REACT_APP_` prefix) in Vite or `import.meta.env`.
3. After backend is live, update `FRONTEND_URL` env var in the backend service to point to the frontend URL.

## 5. Testing the deployment

1. Visit your frontend URL; register a user and verify you can log in.
2. Try all protected routes (`/home`, `/hospitals`, `/chat`, etc.) to ensure authentication works.
   - On the hospitals or map page, the browser should immediately ask for location permission and center the map on the user if granted.
3. Use the chat widget – it should prompt as in development and the ML service (if deployed) must return predictions.
4. Submit a testimonial, request doctor, and analyze lab to confirm API calls succeed.
5. Check the network tab for any failed requests; adjust base URLs or add `withCredentials` as needed.
6. If using forgot-password, ensure emails are sent (real SMTP required).

## 6. Additional Render settings

- Enable **Auto Deploy** on push to your chosen branch.
- Add **Health Check** endpoints (e.g. `https://<backend-url>/api/health`) so Render knows the service is up.
- Configure **SSL** (Render does this automatically).
- Optionally set up **Custom Domains** via Render dashboard if you own a domain.

## 7. Maintenance notes

- To deploy updates, push to the monitored branch; Render will rebuild automatically.
- Monitor logs from each service via the Render dashboard to catch runtime errors.
- If the ML service is not needed in production, simply omit it and keep the backend pointing at a fallback or disable related code.

---

Follow the above steps verbatim: create the services, enter the environment variables as listed, update any hardcoded URLs, and verify each feature after deployment. That will ensure a successful Render deployment and a fully functional app.