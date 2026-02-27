Backend scaffold (Node/Express)

Quick start:

1. cd backend
2. npm install
3. copy `.env.example` to `.env` and set values
4. npm run dev

Endpoints:
- POST /api/auth/register {username,email,password}  *(auto-login; email verification is disabled)*
- POST /api/auth/login {username,password}
- POST /api/auth/forgot-password {email}
- POST /api/auth/reset-password {token,password}
- POST /api/auth/logout
- GET /api/auth/check  _(returns logged‑in user)"
