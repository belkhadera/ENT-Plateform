const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  getMe, 
  refreshToken, 
  logout 
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);
router.post('/refresh', protect, refreshToken);
router.post('/logout', protect, logout);

module.exports = router;
