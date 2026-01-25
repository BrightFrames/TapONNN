const express = require('express');
const router = express.Router();
const {
    initLead,
    sendOTP,
    verifyOTPAndRegister,
    resendOTP
} = require('../controllers/connectController');

// Step 1: Initialize lead with name and phone
router.post('/init', initLead);

// Step 2: Send OTP to email
router.post('/send-otp', sendOTP);

// Step 3: Verify OTP and create account
router.post('/verify-otp', verifyOTPAndRegister);

// Resend OTP
router.post('/resend-otp', resendOTP);

module.exports = router;
