# Task: Fix Render Postgres, Email Verification, Admin Data Consistency

## Plan Breakdown & Progress

**Completed:**
- [x] 1. Harden backend/db.js: Add PG retry (3x, 5s delay), fallback JSON writes + logs on PG error, JSON→PG migrate on startup, PREFER_POSTGRES env (default false for Render).

**Pending:**
- [ ] 2. Update backend/controllers/authController.js: Improve email SendGrid/SMTP handling, clean logs, keep 1min expiry.
- [ ] 3. Update README.md: Add Render deploy guide (env vars, PG limits, SendGrid).
- [ ] 4. Create backend/.env.example: Render env template.
- [ ] 5. Test: Local `npm run dev`, register/verify/admin data.
- [ ] 6. Render redeploy sim (set PREFER_POSTGRES=false).

Next step: Improve authController.js for reliable emails.

