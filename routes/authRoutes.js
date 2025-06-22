const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateLogin, validateRegister } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

// POST /api/v1/auth/register - Register new user
router.post('/register', validateRegister, authController.register);

// POST /api/v1/auth/login - Login user
router.post('/login', validateLogin, authController.login);

// POST /api/v1/auth/logout - Logout user
router.post('/logout', authenticateToken, authController.logout);

// GET /api/v1/auth/me - Get current user profile
router.get('/me', authenticateToken, authController.getCurrentUser);

// POST /api/v1/auth/refresh - Refresh access token
router.post('/refresh', authController.refreshToken);

module.exports = router; 