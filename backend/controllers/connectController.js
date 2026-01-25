const Lead = require('../models/Lead');
const User = require('../models/User');
const Profile = require('../models/Profile');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendEmailOTP, verifyEmailOTP } = require('../services/msg91Service');

// DiceBear Avatar Generation
const { createAvatar } = require('@dicebear/core');
const { initials } = require('@dicebear/collection');

/**
 * Generate a DiceBear avatar based on user's name
 */
const generateAvatar = (seed) => {
    const avatar = createAvatar(initials, {
        seed: seed,
        backgroundColor: ['7c3aed', '2563eb', '059669', 'dc2626', 'ea580c'],
        radius: 50
    });
    return avatar.toDataUri();
};

/**
 * Generate a unique username from full name
 */
const generateUsername = async (fullName) => {
    const base = fullName.toLowerCase().replace(/[^a-z0-9]/g, '');
    let username = base;
    let counter = 1;

    while (await Profile.findOne({ username })) {
        username = `${base}${counter}`;
        counter++;
    }

    return username;
};

/**
 * Step 1: Initialize Lead - Capture name and phone
 * POST /api/connect/init
 */
const initLead = async (req, res) => {
    try {
        const { full_name, phone_number, product_id, seller_id } = req.body;

        if (!full_name || !phone_number || !seller_id) {
            return res.status(400).json({
                error: 'Full name, phone number, and seller ID are required'
            });
        }

        // Create new lead
        const lead = new Lead({
            full_name,
            phone_number,
            product_id: product_id || null,
            seller_id,
            status: 'pending'
        });

        await lead.save();

        res.json({
            success: true,
            lead_id: lead._id,
            message: 'Lead created successfully'
        });

    } catch (error) {
        console.error('Init Lead Error:', error);
        res.status(500).json({ error: 'Failed to initialize connection' });
    }
};

/**
 * Step 2: Send OTP to email
 * POST /api/connect/send-otp
 */
const sendOTP = async (req, res) => {
    try {
        const { lead_id, email } = req.body;

        if (!lead_id || !email) {
            return res.status(400).json({ error: 'Lead ID and email are required' });
        }

        // Find lead
        const lead = await Lead.findById(lead_id);
        if (!lead) {
            return res.status(404).json({ error: 'Lead not found or expired' });
        }

        // Check if email already registered
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({
                error: 'An account with this email already exists. Please sign in instead.',
                code: 'EMAIL_EXISTS'
            });
        }

        // Update lead with email
        lead.email = email.toLowerCase();
        lead.status = 'otp_sent';
        await lead.save();

        // Send OTP
        const result = await sendEmailOTP(email);

        if (result.success) {
            res.json({
                success: true,
                message: 'OTP sent to your email'
            });
        } else {
            res.status(500).json({ error: result.message || 'Failed to send OTP' });
        }

    } catch (error) {
        console.error('Send OTP Error:', error);
        res.status(500).json({ error: 'Failed to send verification code' });
    }
};

/**
 * Step 3: Verify OTP and create account
 * POST /api/connect/verify-otp
 */
const verifyOTPAndRegister = async (req, res) => {
    try {
        const { lead_id, email, otp } = req.body;

        if (!lead_id || !email || !otp) {
            return res.status(400).json({ error: 'Lead ID, email, and OTP are required' });
        }

        // Find lead
        const lead = await Lead.findById(lead_id);
        if (!lead) {
            return res.status(404).json({ error: 'Lead not found or expired' });
        }

        if (lead.email !== email.toLowerCase()) {
            return res.status(400).json({ error: 'Email mismatch' });
        }

        // Verify OTP
        const otpResult = await verifyEmailOTP(email, otp);
        if (!otpResult.success) {
            return res.status(400).json({ error: otpResult.message || 'Invalid OTP' });
        }

        // Double-check email availability
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ error: 'Account already exists with this email' });
        }

        // Generate a random password (user can change later)
        const tempPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(tempPassword, salt);

        // Create User
        const newUser = new User({
            email: email.toLowerCase(),
            password_hash: passwordHash
        });
        await newUser.save();

        // Generate username
        const username = await generateUsername(lead.full_name);

        // Generate avatar
        const avatarDataUri = generateAvatar(lead.full_name);

        // Create Profile
        const newProfile = new Profile({
            user_id: newUser._id,
            username,
            full_name: lead.full_name,
            email: email.toLowerCase(),
            phone_number: lead.phone_number,
            avatar_url: avatarDataUri,
            selected_theme: 'artemis'
        });
        await newProfile.save();

        // Update lead status
        lead.status = 'converted';
        await lead.save();

        // Generate JWT token
        const token = jwt.sign(
            { id: newUser._id.toString(), email: newUser.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            token,
            user: {
                id: newUser._id,
                email: newUser.email,
                username: newProfile.username,
                full_name: newProfile.full_name,
                avatar: avatarDataUri,
                phone_number: lead.phone_number
            },
            message: 'Account created successfully! You are now connected.'
        });

    } catch (error) {
        console.error('Verify OTP Error:', error);
        res.status(500).json({ error: 'Failed to verify and create account' });
    }
};

/**
 * Resend OTP for a lead
 * POST /api/connect/resend-otp
 */
const resendOTP = async (req, res) => {
    try {
        const { lead_id } = req.body;

        if (!lead_id) {
            return res.status(400).json({ error: 'Lead ID is required' });
        }

        const lead = await Lead.findById(lead_id);
        if (!lead || !lead.email) {
            return res.status(404).json({ error: 'Lead not found or email not set' });
        }

        // Send OTP
        const result = await sendEmailOTP(lead.email);

        if (result.success) {
            res.json({
                success: true,
                message: 'OTP resent to your email'
            });
        } else {
            res.status(500).json({ error: result.message || 'Failed to resend OTP' });
        }

    } catch (error) {
        console.error('Resend OTP Error:', error);
        res.status(500).json({ error: 'Failed to resend verification code' });
    }
};

module.exports = {
    initLead,
    sendOTP,
    verifyOTPAndRegister,
    resendOTP
};
