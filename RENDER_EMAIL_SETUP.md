# Render Email Service Setup — SMTP Fix

## ⚠️ Render Blocks Gmail SMTP

Render's network does **NOT** allow direct outbound SMTP to Gmail.

**Error:**
```
sendVerificationEmail error: Error: connect ENETUNREACH 2607:f8b0:400e:c1b::6d:587 ...
```

---

## ✅ Solution: SendGrid (Recommended)

**Why SendGrid:**
- ✅ Works perfectly with Render
- ✅ Free tier: 100 emails/day
- ✅ Takes 5 minutes to setup
- ✅ No network restrictions

### Step 1: Create SendGrid Account

1. Go to https://sendgrid.com
2. Click "Start Free" or "Sign Up"
3. Complete signup
4. Verify your email

### Step 2: Get API Key

1. Log in to SendGrid dashboard
2. Go to **Settings** → **API Keys**
3. Click **"Create API Key"**
4. Name it: `MyAI-Render`
5. Select **"Full Access"**
6. Click **Create & Copy**
7. **Save this key somewhere safe** (you'll need it once)

### Step 3: Update Render Environment

1. Open your Render dashboard
2. Click your **backend service**
3. Click **"Environment"** tab
4. **Delete these variables:**
   - `SMTP_HOST`
   - `SMTP_PORT`
   - `SMTP_USER`
   - `SMTP_PASS`
   - `FROM_EMAIL`

5. **Add these variables:**
   ```
   SENDGRID_API_KEY=SG.xxxxx_your_key_here_xxxxx
   SENDGRID_FROM_EMAIL=noreply@MyAIHealthcare.com
   FRONTEND_URL=https://myai-ai-juzh.onrender.com
   REQUIRE_EMAIL_VERIFICATION=true
   ```

6. Click **"Save Environment Variables"**

### Step 4: Update Backend Code

In `backend/controllers/authController.js`, replace the `getTransporter()` function:

```javascript
function getTransporter() {
  // Try SendGrid first
  if (process.env.SENDGRID_API_KEY) {
    const sgMail = require('@sendgrid/mail')
    sgMail.setApiKey(process.env.SENDGRID_API_KEY)
    
    return {
      sendMail: async (options) => {
        const msg = {
          to: options.to,
          from: process.env.SENDGRID_FROM_EMAIL || 'noreply@example.com',
          subject: options.subject,
          text: options.text,
          html: options.html
        }
        await sgMail.send(msg)
      }
    }
  }
  
  // Fallback to nodemailer for local SMTP
  if (process.env.SMTP_HOST) {
    const host = process.env.EMAIL_HOST || process.env.SMTP_HOST
    const port = Number(process.env.EMAIL_PORT || process.env.SMTP_PORT || 587)
    const user = process.env.EMAIL_USER || process.env.SMTP_USER
    const pass = process.env.EMAIL_PASS || process.env.SMTP_PASS
    const secure = (process.env.EMAIL_SECURE === 'true') || false

    if (host && user && pass) {
      return nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass }
      })
    }
  }
  
  return null
}
```

### Step 5: Install SendGrid Package

```bash
cd backend
npm install @sendgrid/mail
```

### Step 6: Deploy to Render

```bash
git add .
git commit -m "Add SendGrid email support for Render"
git push origin main
```

Wait for deploy to complete (check logs in Render dashboard).

### Step 7: Test Registration

1. Go to your app: `https://myai-ai-juzh.onrender.com`
2. Click **Register**
3. Fill in form and click **Create Account**
4. Check your inbox for verification email
5. ✅ You should receive it within 30 seconds

### Step 8: Test Password Reset

1. Go to **Login** → **Forgot Password**
2. Enter your email
3. Check inbox for **"Reset your MyAI Healthcare password"**
4. Click link and change password
5. ✅ Login with new password

---

## 🔍 Check Render Logs

If email not working:

1. Open Render dashboard
2. Click your **backend service**
3. Click **"Logs"** tab
4. Look for:
   - `✅ Verification email sent to ...` (success)
   - `✅ Password reset email sent to ...` (success)
   - `⚠️ Failed to send ...` (failure → but continues anyway)

---

## 📋 Checklist

- [ ] SendGrid account created
- [ ] API key generated
- [ ] Render env vars updated (`SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL`)
- [ ] `getTransporter()` function updated in code
- [ ] `npm install @sendgrid/mail` run
- [ ] Code pushed to GitHub
- [ ] Render redeployed (check logs)
- [ ] Test registration → check email ✅
- [ ] Test forgot password → check email ✅

---

## ⚡ If SendGrid is Too Much

**Alternative: Skip Email Verification for Now**

In `.env` on Render:
```
REQUIRE_EMAIL_VERIFICATION=false
```

This allows:
- ✅ Instant signup (no email verification)
- ✅ Forgot password still works (but logs token to console)
- ⚠️ Less secure but works immediately

Later upgrade to SendGrid when ready.

---

## 💡 Key Points

- ✅ Email failures **don't block signup** (graceful fallback)
- ✅ Tokens logged to console/logs if email fails
- ✅ SendGrid free tier covers 100 emails/day
- ✅ Costs $0 for testing
- ✅ No Render network restrictions with SendGrid

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| "Missing SENDGRID_API_KEY" | Add it to Render env vars |
| Email still not arriving | Check Render logs for errors |
| Tests locally, fails on Render | Verify API key is correct |
| SendGrid quota exceeded | Create new account (free) for more emails |

---

## ✨ Done!

Once SendGrid is set up:
- ✅ Signups send verification emails
- ✅ Forgot password sends reset links
- ✅ Works reliably on Render
- ✅ Free tier sufficient for MVP
