"# MyAI

A full-stack healthcare platform with AI-powered symptom analysis, doctor consultations, lab results management, and medical news integration.

## Architecture

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express + PostgreSQL
- **ML Engine**: Python + Flask + scikit-learn

## Requirements

- Node.js (v16+)
- Python (3.8+)
- PostgreSQL (or use JSON file storage)

## Installation

```bash
# Install dependencies
npm install
cd backend then npm install
cd frontend then npm install 

pip install -r requirements.txt
```

## Configuration

Create `.env` in the `backend/` directory:

```
PORT=5000
JWT_SECRET=your_secret_key
DATABASE_URL=postgresql://user:password@localhost:5432/myai
SENDGRID_API_KEY=your_key
NODEMAILER_EMAIL=your_email
NODEMAILER_PASSWORD=your_password
```

## Running the Application

**Backend:**
```bash
cd backend
npm run dev
```
Runs on `http://localhost:5000`

**Frontend:**
```bash
cd frontend
npm run dev
```
Runs on `http://localhost:5173`

**ML Engine (Optional):**
```bash
python -m flask run
```

## Project Structure

```
backend/
  ├── server.js              # Express app entry point
  ├── db.js                  # Database configuration
  ├── controllers/           # Business logic
  ├── routes/                # API endpoints
  ├── middleware/            # Auth, authorization
  └── db/                    # JSON storage (dev)

frontend/
  ├── src/
  │   ├── pages/             # Page components
  │   ├── components/        # Reusable components
  │   ├── services/api.js    # API client
  │   └── App.jsx            # Root component
  └── vite.config.js

```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/forgot-password` - Request reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/check` - Get current user

### Features
- `POST /api/chatbot` - Symptom analysis
- `GET /api/consultations` - Consultations
- `POST /api/doctor-requests` - Request doctor
- `GET /api/medical-news` - Medical news
- `POST /api/lab-results` - Lab results

## Development

Frontend changes automatically reload via Vite. Backend restarts with nodemon.

To add a page: Create component in `frontend/src/pages/` and add route to `App.jsx`

To add an endpoint: Create route in `backend/routes/` and register in `server.js`

## Database

By default uses JSON files in `backend/db/`. To use PostgreSQL, update `DATABASE_URL` in `.env` and modify `backend/db.js`.

## Troubleshooting

**Port already in use:** Update `PORT` in `.env` or kill existing process

**Module not found:** Run `npm install` and `pip install -r requirements.txt`

**Database connection error:** Verify `DATABASE_URL` or use JSON fallback

**Frontend can't reach backend:** Check API URL in `frontend/src/services/api.js` and ensure backend is running " 
