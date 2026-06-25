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

## 📁 Project Structure

```
bitebond/
├── client/                          # React frontend
│   └── src/
│       ├── components/
│       │   ├── common/              # ProtectedRoute, LoadingScreen
│       │   ├── layout/              # Navbar, Footer, MainLayout, AuthLayout
│       │   ├── auth/                 # VerificationBanner
│       │   ├── restaurant/           # RestaurantCard, skeletons
│       │   ├── gift/                 # GiftCard, skeletons
│       │   └── ai/                   # AIWishGenerator, AICelebrationPlanner,
│       │                             # AIFoodRecommendations, AIGiftRecommendations,
│       │                             # SupportChatWidget
│       ├── pages/
│       │   ├── auth/                 # Login, Signup, VerifyEmail, ForgotPassword, OAuthCallback
│       │   ├── admin/                # AdminDashboard + Users/Orders/Restaurants tabs
│       │   ├── restaurant-dashboard/ # RestaurantDashboard + Menu/Orders tabs
│       │   └── *.jsx                 # Home, Restaurants, Gifts, Cart, Orders,
│       │                             # OccasionPlanner, Profile, NotFound
│       ├── redux/slices/             # authSlice, cartSlice, themeSlice
│       ├── services/                 # api.js + one service per domain
│       └── utils/occasions.js
│
├── server/                          # Express backend
│   ├── config/                      # db, cloudinary, passport (Google OAuth)
│   ├── models/                      # User, Restaurant, Order, Gift
│   ├── controllers/                  # auth, user, restaurant, order, gift,
│   │                                 # ai, admin, restaurantDashboard
│   ├── routes/                       # one router per controller
│   ├── middleware/                   # auth, errorHandler, notFound, validate
│   ├── services/                     # email, restaurant (external API), gemini
│   ├── data/                         # gifts.seed.js
│   └── utils/                        # response helpers, OTP generator
│
├── render.yaml                      # Render deployment blueprint
├── vercel.json                      # Vercel build config
├── DEPLOYMENT.md                    # Full production deployment walkthrough
└── README.md
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Cloudinary account
- Google Gemini API key

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/bitebond-ai.git
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

## 🗺️ Development Phases

| Phase | Module | Status |
|---|---|---|
| **Phase 1** | Project Setup + Auth Foundation | ✅ Complete |
| **Phase 2** | Full Authentication Flow | ✅ Complete |
| **Phase 3** | Restaurant Module (Live API) | ✅ Complete |
| **Phase 4** | Food Ordering + Cart + Checkout | ✅ Complete |
| **Phase 5** | Gift Marketplace | ✅ Complete |
| **Phase 6** | Remote Ordering | ✅ Complete |
| **Phase 7** | Gemini AI Integration | ✅ Complete |
| **Phase 8** | Admin & Restaurant Dashboards | ✅ Complete |
| **Phase 9** | Deployment | 🔜 Next |

---

### AI Endpoints (Gemini-powered, all fall back gracefully without an API key)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/ai/recommend-food` | Food recommendations by budget/occasion/preferences |
| POST | `/api/ai/recommend-gift` | Gift recommendations by relationship/budget/age/occasion |
| POST | `/api/ai/plan-celebration` | Full celebration plan: food + gift + schedule |
| POST | `/api/ai/generate-wish` | AI-generated wish message (birthday/romantic/funny/emotional) |
| POST | `/api/ai/chat-support` | Customer support chatbot (order tracking, FAQs, refunds) |

---

### Admin Dashboard Endpoints (role: admin)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/overview` | Platform KPIs: users, orders, restaurants, revenue |
| GET | `/api/admin/revenue?days=14` | Daily revenue trend |
| GET | `/api/admin/analytics` | Order type/status breakdown, top restaurants |
| GET | `/api/admin/users` | User list with search/pagination |
| PUT | `/api/admin/users/:id` | Activate/deactivate, change role |
| GET | `/api/admin/orders` | All orders with filters |
| GET | `/api/admin/restaurants` | All restaurants |
| PUT | `/api/admin/restaurants/:id` | Toggle active/featured |

### Restaurant Dashboard Endpoints (role: restaurant_owner)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/restaurant-dashboard/:id/overview` | Restaurant KPIs |
| GET | `/api/restaurant-dashboard/:id/analytics` | Revenue trend, top items |
| GET | `/api/restaurant-dashboard/:id/orders` | Incoming orders |
| PUT | `/api/restaurant-dashboard/:id/orders/:orderId/status` | Advance order status |
| GET/POST | `/api/restaurant-dashboard/:id/menu` | View/add menu items |
| PUT/DELETE | `/api/restaurant-dashboard/:id/menu/:itemId` | Edit/remove menu item |
| PUT | `/api/restaurant-dashboard/:id/toggle-open` | Open/close restaurant |

---

## 🌐 API Reference (Phase 1)

### Auth Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | ❌ | Register new user |
| POST | `/api/auth/login` | ❌ | Login |
| GET | `/api/auth/me` | ✅ | Get current user |
| PUT | `/api/auth/profile` | ✅ | Update profile |
| PUT | `/api/auth/change-password` | ✅ | Change password |
| POST | `/api/auth/logout` | ✅ | Logout |

### User Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET/POST | `/api/users/addresses` | Get / add address |
| PUT/DELETE | `/api/users/addresses/:id` | Update / delete address |
| GET/POST | `/api/users/contacts` | Get / add contact |
| PUT/DELETE | `/api/users/contacts/:id` | Update / delete contact |
| PUT | `/api/users/fcm-token` | Update FCM token |

---

## ☁️ Deployment

Full step-by-step production deployment instructions — including MongoDB Atlas, Cloudinary, Gmail SMTP, Google OAuth, and Gemini API setup — are in **[DEPLOYMENT.md](DEPLOYMENT.md)**.

Quick summary:

### Backend → Render
1. Push to GitHub
2. Render → New + → Blueprint → select repo (auto-detects `render.yaml`)
3. Fill in the prompted environment variables
4. Deploy — verify at `https://your-app.onrender.com/health`

### Frontend → Vercel
1. Vercel → Add New → Project → import repo (auto-detects `vercel.json`)
2. Add `REACT_APP_API_URL` pointing to your Render backend + `/api`
3. Deploy

### Final step
Update `CLIENT_URL` on Render to your live Vercel URL so CORS allows requests from production.

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

## 📦 Database Models

### User
`name` · `email` · `phone` · `password` (hashed) · `avatar` · `role` (user/admin/restaurant_owner) · `addresses[]` · `contacts[]` (family & friends) · `favoriteRestaurants[]` · `loyaltyPoints` · `preferences` · `fcmToken` · `isVerified` · `googleId` · `authProvider` · OTP fields for email verification & password reset

### Restaurant
`name` · `description` · `image`/`banner` · `cuisine[]` · `address` · `location` (geo) · `rating` · `deliveryTime`/`deliveryFee` · `menu[]` (embedded items with price, customizations) · `isOpen`/`isFeatured` · `cachedAt` (external API cache TTL)

### Gift
`name` · `description` · `category` (cake/flowers/chocolates/personalized/greeting_card/hamper) · `images[]` · `variants[]` (size/price options) · `occasions[]` · `personalizationOptions` (text/photo) · `rating` · `isBestseller`

### Order
`user` · `restaurant` (optional for gift-only orders) · `orderType` (food/gift/combo) · `items[]` · `giftItems[]` (with personalization) · `deliveryAddress` · `isRemoteOrder`/`isSurpriseMode`/`isAnonymous` · `occasion` · `scheduledFor` · `senderName`/`personalMessage` · pricing breakdown · `status` (scheduled→placed→accepted→preparing→out_for_delivery→delivered/cancelled) with `statusHistory[]` · loyalty points earned/used

---

## 🤝 Contributing

1. Fork the repo
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

*Built with ❤️ by the BiteBond team*
