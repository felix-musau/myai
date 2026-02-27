# Quick Start Commands

## 🚀 Start All Services (Open 3 terminals)

### Terminal 1: Frontend
```bash
cd frontend
npm install
npm run dev
```
→ http://localhost:3000

### Terminal 2: Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with Gmail credentials
npm run dev
```
→ http://localhost:4000

### Terminal 3: ML Service (Optional)
```bash
cd ml_service
python -m venv .venv-ml
.venv-ml\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --port 8000
```
→ http://localhost:8000

---

## 📋 Configuration Needed

### Backend `.env` Setup
1. Copy `backend/.env.example` to `backend/.env`
2. Get Gmail App Password:
   - Go to myaccount.google.com → Security → App passwords
   - Select Mail + Windows Computer → Google generates 16-char password
3. Fill in:
   ```
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-16-char-app-password
   JWT_SECRET=your-very-long-random-secret-at-least-32-chars
   ```

---

## ✅ Verify Setup Works

```bash
# Terminal 4: Test endpoints
curl http://localhost:4000/api/health
# Should return: {"ok":true}

curl http://localhost:3000
# Should see React login page
```

---

## 🔄 Next Steps After Setup

1. **Test registration → email verification → login flow**
2. **Implement hospital map** (add coordinates to Leaflet)
3. **Connect ML prediction** to `/api/predict`
4. **Add consultation history** endpoint
5. **Migrate JSON database** to PostgreSQL

See `SETUP_GUIDE.md` for full documentation.
