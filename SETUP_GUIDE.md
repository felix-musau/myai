# Dr. AI Healthcare — Full Stack Migration Guide

## Architecture Overview
- **Frontend**: React (Vite) + Tailwind CSS + React Router + Leaflet Maps
- **Backend**: Node.js (Express) + JWT Auth + Nodemailer
- **ML Service**: Python (FastAPI) — loads trained RandomForest model
- **Database**: JSON-based (lowdb for rapid prototyping; migrate to PostgreSQL for production)
- **Email**: Nodemailer (configured for Gmail SMTP)

## Project Structure
```
myaiiiiiii/
├── frontend/          # React Vite app
├── backend/           # Express API
├── ml_service/        # FastAPI ML service
├── Training.csv       # ML training data
├── Testing.csv        # ML test data
└── ...csv files       # Symptoms, severity, precautions
```

## Quick Start (Local Development)

### Prerequisites
- Node.js 16+
- Python 3.8+
- npm or yarn
- A Gmail account (for email verification)

### Step 1: Setup Frontend

```bash
cd frontend
npm install
npm run dev
```
→ Frontend runs on `http://localhost:3000`

### Step 2: Setup Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your Gmail credentials and JWT secret
npm run dev
```
→ Backend runs on `http://localhost:4000`

**Configure `.env` in backend:**
```
PORT=4000
NODE_ENV=development
JWT_SECRET=your_very_long_random_secret_key_here_at_least_32_chars
JWT_EXPIRES=7d
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your_16_character_app_password
FROM_EMAIL=your-email@gmail.com
FRONTEND_URL=http://localhost:3000
```

**How to get Gmail App Password:**
1. Enable 2-Step Verification on your Gmail account
2. Go to `myaccount.google.com` → Security → App passwords
3. Select "Mail" and "Windows Computer"
4. Google generates a 16-char password — use this in SMTP_PASS

### Step 3: Setup ML Service (Optional)

```bash
cd ml_service
python -m venv .venv-ml
.venv-ml\Scripts\activate  # Windows
# source .venv-ml/bin/activate  # macOS/Linux
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```
→ ML service runs on `http://localhost:8000`

### Step 4: Verify Everything Works

- Frontend: http://localhost:3000 (should see login page)
- Backend: http://localhost:4000/api/health (should return `{"ok":true}`)
- ML Service: http://localhost:8000/health (should return model status)

---

## API Endpoints

### Auth (No authentication required)
- `POST /api/auth/register` — Register user
  - Body: `{username, email, password}`
  - Returns: `{message}`
- `POST /api/auth/login` — Login user
  - Body: `{username, password}`
  - Returns: `{message, username, token}` + sets HttpOnly cookie
- ~~`GET /api/auth/verify?token=...` — Verify email~~ (disabled)
  - Returns: `{message}`
- `POST /api/auth/logout` — Logout
  - Returns: `{message}`
- `GET /api/auth/check` — Check logged-in status
  - Returns: `{authenticated, username}`

### Protected Routes (Requires valid JWT in cookie)
- `POST /api/predict` — Call ML service
- `POST /api/consultations` — Save consultation
- `GET /api/history` — Get user consultation history
- `GET /api/hospitals` — Get hospitals list

---

## Frontend User Flow

1. **Register** (`/register`)
   - User fills form → Backend sends verification email → User checks email
2. **Verify Email** (Link in email)
   - User clicks link with token → Email marked verified
3. **Login** (`/login`)
   - User enters credentials → JWT stored in HttpOnly cookie
4. **Dashboard** (`/home`)
   - Map view (75% of screen) + sidebar controls (25%)
   - Map shows hospital locations, user can select symptoms
5. **History** (`/history`)
   - View past consultations and predictions

---

## Bug Fixes Applied

✅ Vite proxy now routes to `http://localhost:4000` (Express backend)
✅ Auth endpoints corrected to `/api/auth/*`
✅ JWT cookie handling with `credentials: 'include'`
✅ `useAuth()` hook exported from App.jsx for use in pages
✅ Logout endpoint and token clearing
✅ Email verification flow integrated
✅ CORS properly configured with credentials support

---

## Production Deployment

### Option A: Single-Host Deployment (Recommended for small-scale)
1. Build frontend: `cd frontend && npm run build`
2. Serve React build from Express static folder
3. Deploy Node + Python containers together

### Option B: Split Deployment
1. Deploy frontend to Vercel/Netlify
2. Deploy backend to Heroku/Railway
3. Deploy ML service to dedicated compute instance
4. Update FRONTEND_URL and CORS origins accordingly

### Docker Setup (Optional)
Create `docker-compose.yml` in repo root:
```yaml
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports: ['3000:3000']
  backend:
    build: ./backend
    ports: ['4000:4000']
    env_file: ./backend/.env
  ml:
    build: ./ml_service
    ports: ['8000:8000']
```

Run: `docker-compose up`

---

## Next Steps / Remaining Work

1. **Implement protected API endpoints** (history, consultations, hospitals)
2. **Connect ML service** to backend predict endpoint
3. **Add hospital data** (coordinates, contact info) to map
4. **Implement hospital search/filter** in sidebar
5. **Create consultation symptom picker** connected to ML model
6. **Add data persistence** (upgrade from JSON to PostgreSQL)
7. **Production environment setup** (SSL, environment-specific configs)
8. **Testing** (unit, integration, E2E tests)

---

## Troubleshooting

**Frontend can't connect to backend?**
- Check Vite proxy in `frontend/vite.config.js`
- Ensure backend is running on port 4000
- Check CORS origin matches frontend URL

**Email not sending?**
- Validate Gmail app password (16 chars, not regular password)
- Ensure 2-Step Verification is enabled
- Check SMTP credentials in `.env`
- Try with a test email first

**ML service errors?**
- Ensure `Training.csv` exists in repo root
- Check Python dependencies: `pip install -r requirements.txt`
- Model training takes ~30 seconds on first run

**Port already in use?**
- Frontend: Change Vite port in `frontend/vite.config.js`
- Backend: Change PORT in `backend/.env`
- ML service: `uvicorn main:app --port 9000`

---

## Quick Command Reference

```bash
# Terminal 1: Frontend
cd frontend && npm install && npm run dev

# Terminal 2: Backend
cd backend && npm install && npm run dev

# Terminal 3: ML Service (optional)
cd ml_service && python -m venv .venv-ml && .venv-ml/Scripts/activate && pip install -r requirements.txt && uvicorn main:app --port 8000
```

All three should be running in parallel for full functionality.
