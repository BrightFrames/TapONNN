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

// POST /api/auth/forgot-password/send-otp
router.post('/forgot-password/send-otp', authController.forgotPasswordSendOTP);

// POST /api/auth/forgot-password/verify-otp
router.post('/forgot-password/verify-otp', authController.forgotPasswordVerifyOTP);

// POST /api/auth/forgot-password/reset
router.post('/forgot-password/reset', authController.resetPassword);

// POST /api/auth/forgot-password/resend-otp
router.post('/forgot-password/resend-otp', authController.resendOTP);

module.exports = router;
