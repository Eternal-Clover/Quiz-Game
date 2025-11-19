const express = require('express');
const router = express.Router();

// Import all routes
const authRoutes = require('./authRoutes');
const quizRoutes = require('./quizRoutes');
const roomRoutes = require('./roomRoutes');

// API routes
router.use('/auth', authRoutes);
router.use('/quizzes', quizRoutes);
router.use('/rooms', roomRoutes);

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
