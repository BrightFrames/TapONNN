const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const authController = require('../controllers/authController');

// POST /api/auth/signup
router.post('/signup', authController.signup);

// POST /api/auth/login
router.post('/login', authController.login);

// GET /api/auth/me (Authenticated)
router.get('/me', authMiddleware, authController.me);

// POST /api/auth/change-password (Authenticated)
router.post('/change-password', authMiddleware, authController.changePassword);

module.exports = router;
