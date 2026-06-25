/**
 * BiteBond AI — Main Server (Phase 8)
 */
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { notFound } = require('./middleware/notFound');

const authRoutes               = require('./routes/auth.routes');
const userRoutes               = require('./routes/user.routes');
const restaurantRoutes         = require('./routes/restaurant.routes');
const orderRoutes              = require('./routes/order.routes');
const giftRoutes                = require('./routes/gift.routes');
const aiRoutes                  = require('./routes/ai.routes');
const adminRoutes               = require('./routes/admin.routes');
const restaurantDashboardRoutes = require('./routes/restaurantDashboard.routes');

const app = express();
connectDB();

app.use(helmet());
const limiter = rateLimit({ windowMs: 15*60*1000, max: 100, standardHeaders: true, legacyHeaders: false });
app.use('/api/', limiter);
const authLimiter = rateLimit({ windowMs: 15*60*1000, max: 20 });
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/signup', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','PATCH','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

app.get('/health', (req, res) => res.status(200).json({
  success: true, message: '❤️ BiteBond AI Server is running',
  environment: process.env.NODE_ENV, timestamp: new Date().toISOString(),
}));

app.use('/api/auth',                 authRoutes);
app.use('/api/users',                userRoutes);
app.use('/api/restaurants',          restaurantRoutes);
app.use('/api/orders',               orderRoutes);
app.use('/api/gifts',                giftRoutes);
app.use('/api/ai',                   aiRoutes);
app.use('/api/admin',                adminRoutes);
app.use('/api/restaurant-dashboard', restaurantDashboardRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`\n❤️  BiteBond AI Server`);
  console.log(`🚀 Port ${PORT} · ${process.env.NODE_ENV}`);
  console.log(`📡 http://localhost:${PORT}/api`);
  console.log(`🤖 Gemini AI: ${process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key' ? 'configured ✅' : 'using fallback mode ℹ️'}\n`);
});
process.on('unhandledRejection', (err) => { console.error('❌', err.message); server.close(() => process.exit(1)); });
process.on('uncaughtException', (err) => { console.error('❌', err.message); process.exit(1); });
module.exports = app;
