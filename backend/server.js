const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');
// Load .env only if it exists (dev only). Platform env vars (Hostinger) take priority.
require('dotenv').config({ override: false });

const app = express();
const httpServer = createServer(app);

// ---------------------------------------------------------------------------
// Socket.io
// ---------------------------------------------------------------------------
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// Make io accessible to routes / services
app.set('io', io);

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // Join a personal room so we can target notifications
  socket.on('join', (userId) => {
    if (userId) {
      socket.join(userId);
      console.log(`User ${userId} joined their notification room`);
    }
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// ---------------------------------------------------------------------------
// Global middleware
// ---------------------------------------------------------------------------
app.use(helmet());
app.use(morgan('dev'));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Stripe webhooks need the raw body, so we mount that route BEFORE json parsing
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/videos', require('./routes/videos'));
app.use('/api/events', require('./routes/events'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/fights', require('./routes/fights'));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
});

// ---------------------------------------------------------------------------
// Serve Next.js static export (production)
// ---------------------------------------------------------------------------
// Debug: list directory structure
console.log('__dirname:', __dirname);
try {
  console.log('Files in __dirname:', fs.readdirSync(__dirname).join(', '));
  const parentDir = path.join(__dirname, '..');
  console.log('Files in parent:', fs.readdirSync(parentDir).join(', '));
  if (fs.existsSync(path.join(__dirname, 'public'))) {
    console.log('Files in backend/public:', fs.readdirSync(path.join(__dirname, 'public')).slice(0, 10).join(', '));
  }
} catch (e) { console.log('Dir listing error:', e.message); }

// Check multiple possible frontend build locations
const possiblePaths = [
  path.join(__dirname, 'public'),                    // backend/public (copied build)
  path.join(__dirname, '..', 'frontend', 'out'),     // frontend/out (standard build)
];
const frontendPath = possiblePaths.find(p => fs.existsSync(p)) || possiblePaths[0];
console.log('Frontend path:', frontendPath, '| exists:', fs.existsSync(frontendPath));
if (fs.existsSync(frontendPath)) {
  // Serve static assets
  app.use(express.static(frontendPath));

  // SPA fallback: serve index.html for all non-API routes
  app.get('*', (req, res) => {
    // Don't serve index.html for API routes
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ success: false, message: 'Route not found' });
    }

    // Try to serve the exact file (e.g., /profile/amanda-nunes.html)
    const htmlFile = path.join(frontendPath, req.path + '.html');
    if (fs.existsSync(htmlFile)) {
      return res.sendFile(htmlFile);
    }

    // Try index.html inside directory (e.g., /profile/amanda-nunes/index.html)
    const indexFile = path.join(frontendPath, req.path, 'index.html');
    if (fs.existsSync(indexFile)) {
      return res.sendFile(indexFile);
    }

    // Fallback to root index.html (client-side routing)
    const rootIndex = path.join(frontendPath, 'index.html');
    if (fs.existsSync(rootIndex)) {
      return res.sendFile(rootIndex);
    }

    res.status(404).json({ success: false, message: 'Page not found' });
  });
} else {
  // No frontend build — API-only mode
  app.use((_req, res) => {
    res.status(404).json({ success: false, message: 'Route not found. Frontend not built — run: cd frontend && npm run build' });
  });
}

// ---------------------------------------------------------------------------
// Global error handler
// ---------------------------------------------------------------------------
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ---------------------------------------------------------------------------
// Database connection & server start
// ---------------------------------------------------------------------------
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/combat_girls';

console.log('Starting COMBAT GIRLS server...');
console.log('PORT:', PORT);
console.log('MONGODB_URI:', MONGODB_URI.includes('mongodb+srv') ? 'Atlas (cloud)' : 'localhost');
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');

// Start server immediately (don't wait for DB — serves frontend even if DB is down)
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Connect to MongoDB
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    console.error('Server will continue running but API calls will fail.');
  });

module.exports = { app, io };
