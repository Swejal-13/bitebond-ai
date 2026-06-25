# 🚀 BiteBond AI — Deployment Guide

This guide walks through deploying BiteBond AI to production using the specified stack:
**Vercel** (frontend) · **Render** (backend) · **MongoDB Atlas** (database) · **Cloudinary** (media) · **Firebase** (notifications).

Estimated time: 30–45 minutes for a first deployment.

---

## 0. Pre-Deployment Checklist

Before deploying, make sure you have accounts for:

- [ ] [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) (free M0 tier is enough to start)
- [ ] [Render](https://render.com) (free tier for backend)
- [ ] [Vercel](https://vercel.com) (free tier for frontend)
- [ ] [Cloudinary](https://cloudinary.com/users/register/free) (free tier for images/media)
- [ ] [Google AI Studio](https://aistudio.google.com/apikey) for a free Gemini API key (optional — app works without it via fallback mode)
- [ ] [Google Cloud Console](https://console.cloud.google.com/) for OAuth credentials (optional — email/password auth works without it)
- [ ] A Gmail account with an [App Password](https://myaccount.google.com/apppasswords) generated, for sending verification/reset emails (or use SendGrid/Mailgun instead)
- [ ] [Firebase Console](https://console.firebase.google.com/) project (optional — for push notifications)
- [ ] GitHub account with this repo pushed

---

## 1. MongoDB Atlas Setup

1. Create a free cluster (M0, shared tier).
2. Under **Database Access**, create a database user with a strong password — note the username and password.
3. Under **Network Access**, add IP address `0.0.0.0/0` (allow access from anywhere) — Render's outbound IPs are dynamic on the free tier, so this is required unless you're on a paid Render plan with static IPs.
4. Click **Connect** on your cluster → **Drivers** → copy the connection string. It looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Append your database name before the `?`:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/bitebond?retryWrites=true&w=majority
   ```
6. Save this as `MONGODB_URI` — you'll need it for Render.

---

## 2. Cloudinary Setup

1. Sign up and go to your **Dashboard**.
2. Copy three values: **Cloud Name**, **API Key**, **API Secret**.
3. Save these as `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.

No further configuration needed — the app's `multer-storage-cloudinary` integration (see `server/config/cloudinary.js`) handles folder structure and transformations automatically.

---

## 3. Gmail App Password (for transactional emails)

1. Enable 2-Step Verification on your Google account.
2. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords).
3. Generate an app password for "Mail".
4. Save as `EMAIL_USER` (your full Gmail address) and `EMAIL_PASS` (the 16-character app password, no spaces).

**Alternative**: Use SendGrid or Mailgun's SMTP credentials instead — just update `EMAIL_HOST` and `EMAIL_PORT` accordingly in `server/services/email.service.js`'s transporter config.

---

## 4. Google Gemini API Key (optional but recommended)

1. Go to [aistudio.google.com/apikey](https://aistudio.google.com/apikey).
2. Click **Create API key** (free tier includes generous rate limits).
3. Save as `GEMINI_API_KEY`.

If skipped, every AI feature (food/gift recommendations, celebration planner, wish generator, support chatbot) automatically falls back to curated, database-driven responses — the app remains fully functional and demoable.

---

## 5. Google OAuth Setup (optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → create a new project (or reuse one).
2. Navigate to **APIs & Services → Credentials → Create Credentials → OAuth Client ID**.
3. Application type: **Web application**.
4. Authorized redirect URIs — add both:
   - `http://localhost:5000/api/auth/google/callback` (local dev)
   - `https://your-render-app.onrender.com/api/auth/google/callback` (production — update after Render deploy)
5. Save the **Client ID** and **Client Secret** as `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
6. Set `GOOGLE_CALLBACK_URL` to the production redirect URI above.

If skipped, the "Continue with Google" buttons will simply error if clicked — email/password signup and login work regardless.

---

## 6. Restaurant API Key (optional)

The app ships with 6 rich mock restaurants covering multiple cuisines, fully functional for demos. To pull live restaurant data instead:

1. Sign up at [RapidAPI](https://rapidapi.com) and subscribe to a restaurant-data API (e.g. a Yelp-compatible endpoint).
2. Save your key as `RESTAURANT_API_KEY` and the API host as `RESTAURANT_API_HOST`.

Without these, `server/services/restaurant.service.js` automatically serves the bundled mock catalogue.

---

## 7. Deploy the Backend to Render

1. Push your code to GitHub if you haven't already:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/bitebond-ai.git
   git push -u origin main
   ```
2. Log into [Render](https://render.com) → **New +** → **Blueprint**.
3. Connect your GitHub repo. Render will detect `render.yaml` automatically and propose the `bitebond-api` service.
4. Render will prompt you to fill in the env vars marked `sync: false` in `render.yaml`. Enter:
   - `MONGODB_URI` (from step 1)
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` (from step 2)
   - `EMAIL_USER`, `EMAIL_PASS` (from step 3)
   - `GEMINI_API_KEY` (from step 4, optional)
   - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL` (from step 5, optional)
   - `RESTAURANT_API_KEY`, `RESTAURANT_API_HOST` (from step 6, optional)
   - `CLIENT_URL` — leave as a placeholder for now (e.g. `https://placeholder.vercel.app`); you'll update this after deploying the frontend in step 8
5. Click **Apply** to deploy. Render will run `npm install` then `npm start` inside the `server/` directory.
6. Once live, note your backend URL, e.g. `https://bitebond-api.onrender.com`.
7. Verify it's running by visiting `https://bitebond-api.onrender.com/health` — you should see a JSON success response.

> **Free tier note**: Render's free web services spin down after 15 minutes of inactivity and take ~30–50 seconds to wake on the next request. This is normal — upgrade to the Starter plan ($7/mo) for always-on hosting in production.

---

## 8. Deploy the Frontend to Vercel

1. Log into [Vercel](https://vercel.com) → **Add New** → **Project**.
2. Import your GitHub repo.
3. Vercel will read `vercel.json` at the repo root, which sets:
   - Build command: `cd client && npm install && npm run build`
   - Output directory: `client/build`
4. Add one environment variable in the Vercel dashboard:
   - `REACT_APP_API_URL` = `https://bitebond-api.onrender.com/api` (your Render URL + `/api`)
5. Click **Deploy**.
6. Once live, note your frontend URL, e.g. `https://bitebond.vercel.app`.

---

## 9. Connect Frontend ↔ Backend (final step)

Now that both are live, close the loop:

1. **On Render**: update the `CLIENT_URL` env var to your real Vercel URL (e.g. `https://bitebond.vercel.app`). This is required for CORS to allow requests from your frontend. Save — Render will auto-redeploy.
2. **On Google Cloud Console** (if using OAuth): no change needed here since the redirect URI points to Render, not Vercel.
3. **Test the full flow**:
   - Visit your Vercel URL
   - Sign up for a new account → check your email for the OTP → verify
   - Browse restaurants, add items to cart, place an order
   - Try the Occasion Planner and AI features
   - Check `/admin` (after manually promoting a user to `admin` role in MongoDB Atlas's data browser, since there's no UI for the first admin)

---

## 10. Promote Your First Admin User

There's no signup flow for admin accounts (by design, for security). To create your first admin:

1. Sign up normally through the app.
2. Go to MongoDB Atlas → **Browse Collections** → `bitebond` database → `users` collection.
3. Find your user document and edit the `role` field from `"user"` to `"admin"`.
4. Log out and back in on the app — you'll now see "Admin Dashboard" in your profile menu.

For restaurant owner accounts, follow the same process but set `role` to `"restaurant_owner"`, and additionally set a `managedRestaurantId` field to the `_id` of a restaurant document in the `restaurants` collection (this links the owner to their restaurant dashboard).

---

## 11. Firebase Cloud Messaging (optional, for push notifications)

This is the one integration left as a stub in the codebase since it requires platform-specific setup (web push certificates, service worker registration) beyond a backend deployment guide's scope:

1. Create a project at [Firebase Console](https://console.firebase.google.com/).
2. Under **Project Settings → Cloud Messaging**, generate a **Web Push certificate** (VAPID key).
3. Under **Project Settings → Service Accounts**, generate a private key for backend use.
4. Add the resulting values to both `server/.env` (`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`) and `client/.env` (`REACT_APP_FIREBASE_*` keys).
5. Implement a service worker (`public/firebase-messaging-sw.js`) in the client to receive push events, and wire `user.fcmToken` (already stored on the User model) into Firebase Admin SDK calls server-side when order status changes.

The User model and order status-change hooks are already in place to support this — only the Firebase SDK wiring itself is left for your specific notification requirements.

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---|---|---|
| Frontend shows network errors | `REACT_APP_API_URL` wrong or backend asleep | Check Render logs; free tier wakes slowly on first request |
| CORS errors in browser console | `CLIENT_URL` on Render doesn't match Vercel URL exactly | Update `CLIENT_URL` on Render (no trailing slash) |
| Emails never arrive | Gmail app password wrong, or using regular password | Regenerate app password; check Render logs for SMTP errors |
| "Gemini API key not configured" in logs | Expected if `GEMINI_API_KEY` unset | App falls back automatically — not an error |
| MongoDB connection timeout | IP not whitelisted | Add `0.0.0.0/0` under Atlas Network Access |
| Google OAuth redirect mismatch | Callback URL doesn't match Cloud Console exactly | Must match exactly including `https://` and path |

---

## Production Hardening (recommended before real users)

- Upgrade Render to a paid plan to avoid cold starts
- Upgrade MongoDB Atlas beyond M0 for production SLAs and backups
- Restrict MongoDB Atlas Network Access to Render's specific outbound IPs (paid Render plans provide static IPs)
- Set up a custom domain on both Vercel and Render
- Add Sentry or similar error tracking to `server/middleware/errorHandler.js`
- Add automated backups for MongoDB Atlas
- Rotate `JWT_SECRET` and re-issue tokens periodically
- Review Cloudinary upload limits and add file-size/type validation if not already sufficient
