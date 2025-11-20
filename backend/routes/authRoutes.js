const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/authentication');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes (memerlukan authentication)
router.get('/profile', authenticate, authController.getProfile);
router.put('/profile', authenticate, authController.updateProfile);
router.get('/users/:id', authenticate, authController.getUserById);

module.exports = router;
