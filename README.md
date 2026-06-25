# ❤️ BiteBond AI

**Connecting hearts through food**

A modern, AI-powered food ordering and surprise gifting platform. Order food for yourself or remotely send food and gifts to family, friends, and loved ones for any special occasion.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, Tailwind CSS, Redux Toolkit, Framer Motion |
| Backend | Node.js, Express.js, JWT Auth |
| Database | MongoDB Atlas |
| AI | Google Gemini API |
| Images | Cloudinary |
| Notifications | Firebase Cloud Messaging |
| Frontend Deploy | Vercel |
| Backend Deploy | Render |

---

## ⚡ Quick Start

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Cloudinary account
- Google Gemini API key

### 1. Clone & Install

```bash
git clone https://github.com/Swejal-13/bitebond-ai.git
cd bitebond-ai
npm install          # installs concurrently at root
cd server && npm install
cd ../client && npm install
```

### 2. Configure Environment Variables

**Server** — copy `server/.env.example` → `server/.env` and fill in:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_secret_key
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
GEMINI_API_KEY=...
CLIENT_URL=http://localhost:3000
```

**Client** — copy `client/.env.example` → `client/.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 3. Run Development Servers

```bash
# From root — runs both frontend and backend concurrently
npm run dev

# Or separately:
npm run dev:server   # http://localhost:5000
npm run dev:client   # http://localhost:3000
```

---

## 🔐 Security Features

- Passwords hashed with bcrypt (12 salt rounds)
- JWT with 7-day expiry; stricter rate limits on login/signup/forgot-password (20 req / 15 min)
- AI endpoints rate-limited separately (30 req / 5 min) since they're costlier to serve
- Email verification via OTP (SHA-256 hashed, 10-min expiry) before full account access
- Helmet.js security headers
- CORS configured for specific origins only
- Input validation via express-validator on all auth routes
- Role-based access control (`user`/`admin`/`restaurant_owner`) enforced via middleware on every dashboard and management route
- MongoDB injection prevention via Mongoose schema validation
- Google OAuth via Passport.js with stateless JWT issuance (no server-side sessions)

---

