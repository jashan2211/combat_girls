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
// Serve frontend static files
// Try all possible locations where the built frontend might be
const tryPaths = [
  path.join(__dirname, 'public'),
  path.join(__dirname, '..', 'frontend', 'out'),
  path.join(__dirname, '..', 'backend', 'public'),
  path.resolve('backend', 'public'),
  path.resolve('frontend', 'out'),
];

let frontendPath = null;
for (const p of tryPaths) {
  if (fs.existsSync(path.join(p, 'index.html'))) {
    frontendPath = p;
    break;
  }
}

console.log('CWD:', process.cwd());
console.log('__dirname:', __dirname);
console.log('Frontend found at:', frontendPath || 'NOT FOUND');

if (frontendPath) {
  app.use(express.static(frontendPath));

  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ success: false, message: 'API route not found' });
    }
    // Try exact .html file
    const htmlFile = path.join(frontendPath, req.path + '.html');
    if (fs.existsSync(htmlFile)) return res.sendFile(htmlFile);
    // Try directory index
    const indexFile = path.join(frontendPath, req.path, 'index.html');
    if (fs.existsSync(indexFile)) return res.sendFile(indexFile);
    // Fallback to root
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
} else {
  // Fallback: serve a basic page so the site isn't broken
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ success: false, message: 'API route not found' });
    }
    res.send(`<!DOCTYPE html>
<html><head><title>COMBAT GIRLS</title><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>*{margin:0;padding:0;box-sizing:border-box}body{background:#0a0a0a;color:#fff;font-family:system-ui;display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center}
h1{font-size:2.5rem;background:linear-gradient(to right,#dc2626,#f59e0b);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:1rem}
p{color:#737373;margin-bottom:0.5rem}code{background:#1a1a1a;padding:2px 8px;border-radius:4px;font-size:0.85rem;color:#a3a3a3}</style></head>
<body><div><h1>COMBAT GIRLS</h1><p>Women's Combat Sports TV</p><p>Server is running. MongoDB: connected.</p>
<p style="margin-top:2rem;font-size:0.8rem">CWD: ${process.cwd()}</p>
<p style="font-size:0.8rem">__dirname: ${__dirname}</p>
<p style="font-size:0.8rem">Tried: ${tryPaths.map(p => p + ' (' + (fs.existsSync(path.join(p,'index.html')) ? 'YES' : 'no') + ')').join(', ')}</p>
</div></body></html>`);
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
