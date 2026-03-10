# Deployment & Render Update Guide

This document consolidates all of the deployment-related instructions youll need going forward.  It covers both **static (frontend)** and **non‑static (backend)** parts of the app, and it assumes that a number of changes have been made since the original Render setup (chatbot, auth, APIs, etc.).  Use this file as your single source of truth when editing environment variables or triggering new builds.

---

## 1. Overview

- The project consists of two Render services:
  1. **Frontend** – a static site built with Vite/React.
  2. **Backend** – an Express web service providing `/api/*` endpoints.
- The backend handles authentication, chat, medical news, and data storage.
- Most of the configuration is managed via environment variables on Render.
- The frontend is redeployed only when you change client code or its own env vars.

> **Note:** if you only update backend environment variables (e.g. add the GPT key) you do **not** need to rebuild the frontend unless it consumes that variable directly (rare).

---

## 2. Environment variable checklist

| Variable | Service | Required? | Purpose |
|----------|---------|-----------|---------|
| `JWT_SECRET` | Backend | **Yes** | Signing JSON web tokens for auth.
| `GROQ_API_KEY` | Backend | Yes (for chatbot) | Your Groq AI key.
| `GROQ_MODEL` | Backend | No (defaults to `gpt-4o-mini`) | Model used by chatbot.
| `GROQ_URL` | Backend | Rarely | Override API URL (auto‑retry logic exists).
| `NEWS_API_KEY` | Backend | Yes | NewsAPI key for medical headlines.
| `PORT` | Backend | No | Adjust only if you override frontend proxy.
| `VITE_API_BASE` or `VITE_API_URL` | Frontend | No* | Base URL for backend (defaults to `/api`).
| `FRONTEND_URL` | Backend | No | If the backend needs to know its public origin.


*
The frontend will ordinarily proxy `/api` to whatever address the backend is listening on in development; only set this in production if you host the API somewhere else.

---

## 3. Making a change on Render

1. **Go to the Render dashboard** and select the service you intend to update.
2. **Environment** tab: add, modify, or remove variables from the checklist above.
   - When adding keys, there is no public history; keep a local copy or use a secrets manager.
   - Remove obsolete variables (e.g. `ML_SERVICE_URL` or old `OPENAI_API_KEY`).
3. **Deploy**:
   - Trigger a deploy manually via the deploy button, or push a commit to the monitored branch.
   - Render will install dependencies, run any `build` scripts (`npm run build` for frontend, `npm install && npm run start` for backend), and publish the updated service.
   - Watch build logs for errors—missing env vars usually surface as runtime errors after deployment.
4. **Verify**:
   - Visit the frontend URL. Test login/register, chat, emergency page, maps, and news.
   - Check backend logs (Dashboard > Logs) for warnings/errors such as missing API keys or 404s from Groq.

---

## 4. Backend-specific notes

- The authentication system was revised: tokens are now blacklisted on logout and cache-control headers prevent back-button reuse.
  - No additional Render config is required, but ensure `JWT_SECRET` remains consistent across redeploys.
- The chatbot now defaults to `https://api.groq.com/v1` and will automatically retry the legacy `/openai/v1` path if a 404 is returned.  You should only set `GROQ_URL` manually if you know you need a custom host/path.
- If you change `PORT`, update the frontend proxy (`vite.config.js` or `VITE_API_BASE`).
- Always rebuild the backend after modifying its code; environment variable updates automatically restart the service.

---

## 5. Frontend-specific notes

- The static site live on a Render *static* service; any code changes (new pages, components, styling) require a redeploy.
- You generally will not change frontend env vars frequently. When you do:
  - Modify the variables in the Render dashboard.
  - Trigger a redeploy or commit a dummy change to the frontend repo.

---

## 6. Local testing before Render

1. **Setup** `.env` files in `backend/` and `frontend/` if needed (you can copy `.env.example`).
2. **Install deps**: `cd backend && npm install`; `cd frontend && npm install`.
3. **Start services**:
   ```bash
   cd backend && npm run dev   # listens on PORT (default 10000)
   cd ../frontend && npm run dev  # proxies `/api` to backend
   ```
4. **Test endpoints** manually (e.g. `curl http://localhost:10000/api/medical-news`).
5. **Check chat**: log in via the frontend and send messages to verify Groq integration.

Make sure the above works *before* pushing to Render; it avoids failed deployments.

---

## 7. Editing past Render changes

If youve already made a change on Render and need to modify/edit it:

1. **Review your commit history** to see what code/config you changed.
2. **Make new commits** locally and push; Render will detect the push and rebuild.
3. **If you only need to adjust env vars**, update them in the dashboard and redeploy without touching code.
4. **Rollback**: use Renders dashboard to revert to a previous deploy if needed.

---

## 8. Troubleshooting

- **404 from chatbot**: ensure `GROQ_API_KEY` is set, model is valid, and the base URL is correct (defaults handle most cases).
- **Authentication issues**: check logs for `JWT_SECRET` mismatch, or missing cookie headers.
- **News/other API errors**: missing/invalid keys show up in backend logs with detailed messages.


---

Keep this file up-to-date as you continue to make changes. It replaces any ad-hoc instruction markdowns that were scattered around the project.