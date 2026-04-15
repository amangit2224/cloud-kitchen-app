const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { testConnection } = require('./config/database');
const { sequelize } = require('./config/database');
const routes = require('./routes');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// ── Rate limiting ─────────────────────────────────────────────────────────────
let rateLimit;
try {
  rateLimit = require('express-rate-limit');
} catch (e) {
  // express-rate-limit not installed — skip rate limiting
  rateLimit = null;
}

const authLimiter = rateLimit ? rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { success: false, message: 'Too many attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
}) : (req, res, next) => next();

const apiLimiter = rateLimit ? rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120,
  message: { success: false, message: 'Too many requests. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
}) : (req, res, next) => next();

const app = express();
const server = http.createServer(app);

// ── Socket.io setup ──────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  }
});

// Make io accessible from anywhere in the app
app.set('io', io);

io.on('connection', (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  // Each user joins their own room using their userId
  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`👤 User ${userId} joined room user_${userId}`);
  });

  // Admin joins admin room to get all order updates
  socket.on('joinAdmin', () => {
    socket.join('admin_room');
    console.log(`🛡️  Admin joined admin room`);
  });

  // Rider joins rider room
  socket.on('joinRider', (riderId) => {
    socket.join(`rider_${riderId}`);
    console.log(`🛵 Rider ${riderId} joined room rider_${riderId}`);
  });

  socket.on('disconnect', () => {
    console.log(`❌ Socket disconnected: ${socket.id}`);
  });
});

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// ── FIX: Increased payload limits for image uploads ───────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/v1/auth', authLimiter);  // strict limit on login/register
app.use('/api/v1', apiLimiter);        // general API limit
app.use('/api/v1', routes);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── 404 handler ──────────────────────────────────────────────────────────────
app.use(notFound);

// ── Error handler ─────────────────────────────────────────────────────────────
app.use(errorHandler);

// ── Start server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await testConnection();
    //await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('✅ Database synchronized successfully');

    server.listen(PORT, () => {
      console.log('\n╔════════════════════════════════════════════════╗');
      console.log('║     Cloud Kitchen API Server Started           ║');
      console.log('╚════════════════════════════════════════════════╝');
      console.log(`\n📡 Server running on: http://localhost:${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🗄️  Database: Connected to MySQL`);
      console.log(`🔌 Socket.io: Ready for real-time connections`);
      console.log('\nAPI Endpoints:');
      console.log(`   ➜ Auth:      http://localhost:${PORT}/api/v1/auth`);
      console.log(`   ➜ Menu:      http://localhost:${PORT}/api/v1/menu`);
      console.log(`   ➜ Orders:    http://localhost:${PORT}/api/v1/orders`);
      console.log(`   ➜ Riders:    http://localhost:${PORT}/api/v1/riders`);
      console.log(`   ➜ Analytics: http://localhost:${PORT}/api/v1/analytics`);
      console.log(`   ➜ Upload:    http://localhost:${PORT}/api/v1/upload`);
      console.log(`   ➜ Promo:     http://localhost:${PORT}/api/v1/promo`);
      console.log(`   ➜ Health:    http://localhost:${PORT}/api/v1/health`);
      console.log('\nPress CTRL+C to stop the server');
      console.log('═══════════════════════════════════════════════════\n');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();