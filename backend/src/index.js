// Scripture Memory Backend API
// Entry point

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later.'
    }
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/', limiter); // Apply rate limiting to all API routes

// Basic health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'scripture-memory-api',
    version: '0.1.0'
  });
});

// API routes (to be implemented)
app.get('/api/v1', (req, res) => {
  res.json({
    message: 'Scripture Memory API v1',
    endpoints: {
      auth: '/api/v1/auth',
      bible: '/api/v1/bible',
      songs: '/api/v1/songs',
      library: '/api/v1/library',
      progress: '/api/v1/progress'
    }
  });
});

// Import and mount route modules
const bibleRoutes = require('./routes/bible');
const songRoutes = require('./routes/songs');
// const authRoutes = require('./routes/auth');
// const libraryRoutes = require('./routes/library');
// const progressRoutes = require('./routes/progress');

app.use('/api/v1/bible', bibleRoutes);
app.use('/api/v1/songs', songRoutes);
// app.use('/api/v1/auth', authRoutes);
// app.use('/api/v1/library', libraryRoutes);
// app.use('/api/v1/progress', progressRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found'
    }
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Something went wrong'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Scripture Memory API running on port ${PORT}`);
  console.log(`📖 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API docs: http://localhost:${PORT}/api/v1`);
});

module.exports = app;
