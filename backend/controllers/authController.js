const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Profile = require('../models/Profile');
const { PasswordResetToken } = require('../models/Subscription');
const { sendWelcomeEmail } = require('../services/msg91Service');

// SIGNUP
const signup = async (req, res) => {
    const { email, password, username, full_name } = req.body;

    if (!email || !password || !username || !full_name) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        // 1. Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists with this email" });
        }

        const existingProfile = await Profile.findOne({ username: username.toLowerCase() });
        if (existingProfile) {
            return res.status(400).json({ error: "Username already taken" });
        }

        // 2. Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // 3. Create User
        const newUser = new User({
            email,
            password_hash: passwordHash
        });
        await newUser.save();

        // 4. Create Profile
        const newProfile = new Profile({
            user_id: newUser._id,
            username: username.toLowerCase(),
            full_name,
            email,
            selected_theme: 'artemis'
        });
        await newProfile.save();

        // 5. Generate Token
        const token = jwt.sign(
            { id: newUser._id.toString(), email: newUser.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // 6. Send Welcome Email (async, don't wait)
        sendWelcomeEmail(email, username, full_name).catch(err => {
            console.error('Failed to send welcome email:', err);
        });

        res.json({
            token,
            user: {
                id: newUser._id,
                email: newUser.email,
                username: newProfile.username,
                full_name: newProfile.full_name
            }
        });

    } catch (err) {
        console.error("Signup Error:", err);
        res.status(500).json({ error: err.message });
    }
};

// LOGIN
const login = async (req, res) => {
    const { email, password } = req.body;
    console.log("Login attempt:", { email, passwordProvided: !!password });

    if (!email || !password) {
        console.log("Login failed: Missing credentials");
        return res.status(400).json({ error: "Missing credentials" });
    }

    try {
        // 1. Find user
        const user = await User.findOne({ email });
        if (!user) {
            console.log("Login failed: User not found", email);
            return res.status(400).json({ error: "Invalid credentials" });
        }

        // 2. Check password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            console.log("Login failed: Password mismatch for", email);
            return res.status(400).json({ error: "Invalid credentials" });
        }

        // 3. Get User Profile for extra data
        const profile = await Profile.findOne({ user_id: user._id });

        // 4. Generate Token
        const token = jwt.sign(
            { id: user._id.toString(), email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                email: user.email,
                username: profile?.username,
                full_name: profile?.full_name,
                full_name: profile?.full_name,
                avatar: profile?.avatar_url,
                language: user.language
            }
        });

    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// GET CURRENT USER (Me)
const me = async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch user for language
        const user = await User.findById(userId);

        // Fetch profile
        const profile = await Profile.findOne({ user_id: userId });

        if (!profile) {
            // Fallback if profile missing but user exists
            return res.json({ id: userId, email: req.user.email });
        }

        // Convert to plain object and format for frontend
        // Convert to plain object and format for frontend
        const profileObj = profile.toObject();
        const mode = profileObj.active_profile_mode || 'personal';
        const isStore = mode === 'store';

        res.json({
            id: profileObj.user_id,
            // Context-Aware Fields: Return store data if in store mode
            username: (isStore && profileObj.store_username) ? profileObj.store_username : profileObj.username,
            full_name: (isStore && profileObj.store_name) ? profileObj.store_name : profileObj.full_name,
            bio: (isStore && profileObj.store_bio) ? profileObj.store_bio : profileObj.bio,
            avatar_url: (isStore && profileObj.store_avatar_url) ? profileObj.store_avatar_url : profileObj.avatar_url,
            selected_theme: (isStore && profileObj.store_selected_theme) ? profileObj.store_selected_theme : profileObj.selected_theme,
            design_config: (isStore && profileObj.store_design_config) ? profileObj.store_design_config : profileObj.design_config,

            email: profileObj.email,
            phone_number: profileObj.phone_number,
            social_links: profileObj.social_links instanceof Map ? Object.fromEntries(profileObj.social_links) : profileObj.social_links,
            language: user?.language || 'en',
            // New fields for role-based profile handling
            role: profileObj.role || 'super',
            has_store: profileObj.has_store || false,
            active_profile_mode: mode
        });
    } catch (err) {
        console.error("Me Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// CHANGE PASSWORD
const changePassword = async (req, res) => {
    const userId = req.user.id;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(newPassword, salt);

        await User.findByIdAndUpdate(userId, { password_hash: passwordHash });
        res.json({ success: true });
    } catch (err) {
        console.error("Error changing password:", err);
        res.status(500).json({ error: err.message });
    }
};

// FORGOT PASSWORD - Send OTP
const forgotPasswordSendOTP = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: "Email is required" });
    }

    try {
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: "No account found with this email" });
        }

        // Get profile with phone number
        const profile = await Profile.findOne({ user_id: user._id });

        if (!profile || !profile.phone_number) {
            return res.status(400).json({
                error: "No phone number associated with this account. Please contact support."
            });
        }

        // Send OTP via MSG91
        const msg91Service = require('../services/msg91Service');
        const result = await msg91Service.sendOTP(profile.phone_number);

        if (result.success) {
            // Mask phone number for display
            const maskedPhone = profile.phone_number.replace(/(\d{2})\d{4,}(\d{4})/, '$1****$2');
            res.json({
                success: true,
                message: "OTP sent successfully",
                maskedPhone,
                userId: user._id
            });
        } else {
            res.status(500).json({ error: result.message || "Failed to send OTP" });
        }
    } catch (err) {
        console.error("Forgot Password Send OTP Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// FORGOT PASSWORD - Verify OTP
const forgotPasswordVerifyOTP = async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ error: "Email and OTP are required" });
    }

    try {
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: "No account found with this email" });
        }

        // Get phone number
        const profile = await Profile.findOne({ user_id: user._id });

        if (!profile || !profile.phone_number) {
            return res.status(400).json({ error: "No phone number associated with this account" });
        }

        // Verify OTP via MSG91
        const msg91Service = require('../services/msg91Service');
        const result = await msg91Service.verifyOTP(profile.phone_number, otp);

        if (result.success) {
            // Generate a secure reset token
            const crypto = require('crypto');
            const resetToken = crypto.randomBytes(32).toString('hex');
            const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

            // Invalidate any existing tokens for this user
            await PasswordResetToken.updateMany(
                { user_id: user._id },
                { used: true }
            );

            // Store new reset token
            const newToken = new PasswordResetToken({
                user_id: user._id,
                token: resetToken,
                expires_at: expiresAt
            });
            await newToken.save();

            res.json({
                success: true,
                message: "OTP verified successfully",
                resetToken
            });
        } else {
            res.status(400).json({ error: result.message || "Invalid OTP" });
        }
    } catch (err) {
        console.error("Forgot Password Verify OTP Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// FORGOT PASSWORD - Reset Password
const resetPassword = async (req, res) => {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
        return res.status(400).json({ error: "Reset token and new password are required" });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    try {
        // Find valid, unused token
        const tokenRecord = await PasswordResetToken.findOne({
            token: resetToken,
            used: false,
            expires_at: { $gt: new Date() }
        });

        if (!tokenRecord) {
            return res.status(400).json({ error: "Invalid or expired reset token" });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(newPassword, salt);

        // Update password
        await User.findByIdAndUpdate(tokenRecord.user_id, { password_hash: passwordHash });

        // Mark token as used
        tokenRecord.used = true;
        await tokenRecord.save();

        res.json({ success: true, message: "Password reset successfully" });
    } catch (err) {
        console.error("Reset Password Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// RESEND OTP
const resendOTP = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: "Email is required" });
    }

    try {
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: "No account found with this email" });
        }

        // Get phone number
        const profile = await Profile.findOne({ user_id: user._id });

        if (!profile || !profile.phone_number) {
            return res.status(400).json({ error: "No phone number associated with this account" });
        }

        // Resend OTP via MSG91
        const msg91Service = require('../services/msg91Service');
        const result = await msg91Service.resendOTP(profile.phone_number);

        if (result.success) {
            res.json({ success: true, message: "OTP resent successfully" });
        } else {
            res.status(500).json({ error: result.message || "Failed to resend OTP" });
        }
    } catch (err) {
        console.error("Resend OTP Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// DELETE ACCOUNT
const deleteAccount = async (req, res) => {
    const userId = req.user.id;

    try {
        // Import all models that have user data
        const Link = require('../models/Link');
        const Block = require('../models/Block');
        let Product = require('../models/Product');
        if (Product.Product) Product = Product.Product; // Handle named export

        if (!Product || typeof Product.deleteMany !== 'function') {
            console.error("CRITICAL: Failed to load Product model:", Product);
            // Fallback: try to get it from mongoose connection
            const mongoose = require('mongoose');
            Product = mongoose.models.Product;
        }

        const Order = require('../models/Order');
        const Enquiry = require('../models/Enquiry');
        const Intent = require('../models/Intent');
        const UserPlugin = require('../models/UserPlugin');

        console.log(`Deleting account for user: ${userId}`);

        // Get user's profile first for profile_id based deletions
        const userProfile = await Profile.findOne({ user_id: userId });
        const profileId = userProfile?._id;

        // Delete all related data in parallel for efficiency
        const deletionPromises = [
            // Delete user's links
            Link.deleteMany({ user_id: userId }),
            // Delete user's blocks
            Block.deleteMany({ user_id: userId }),
            // Delete user's products
            Product.deleteMany({ user_id: userId }),
            // Delete user's orders (as buyer or seller)
            Order.deleteMany({ $or: [{ buyer_id: userId }, { seller_id: userId }] }),
            // Delete enquiries where user is seller
            Enquiry.deleteMany({ seller_id: userId }),
            // Delete user's installed plugins
            UserPlugin.deleteMany({ user_id: userId }),
            // Delete password reset tokens
            PasswordResetToken.deleteMany({ user_id: userId })
        ];

        // Add profile-based deletions if profile exists
        if (profileId) {
            deletionPromises.push(
                // Delete intents for user's profile
                Intent.deleteMany({ profile_id: profileId }),
                // Delete intents where user is actor
                Intent.deleteMany({ actor_id: userId })
            );
        }

        // Execute all deletions
        const deletionResults = await Promise.allSettled(deletionPromises);

        // Log any failed deletions (but don't fail the entire operation)
        deletionResults.forEach((result, index) => {
            if (result.status === 'rejected') {
                console.error(`Deletion step ${index} failed:`, result.reason);
            }
        });

        // Now delete profile and user (these must succeed)
        if (userProfile) {
            await Profile.deleteOne({ user_id: userId });
        }
        await User.findByIdAndDelete(userId);

        console.log(`Account deleted successfully for user: ${userId}`);

        res.json({
            success: true,
            message: "Account and all associated data deleted successfully"
        });

    } catch (err) {
        console.error("Delete Account Error:", err);
        res.status(500).json({ error: "Failed to delete account. Please try again or contact support." });
    }
};

module.exports = {
    signup,
    login,
    me,
    changePassword,
    forgotPasswordSendOTP,
    forgotPasswordVerifyOTP,
    resetPassword,
    resendOTP,
    deleteAccount
};
