const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Profile = require('../models/Profile');
const { PasswordResetToken } = require('../models/Subscription');
const { sendWelcomeEmail } = require('../services/msg91Service');

// DiceBear Avatar Generation
const { createAvatar } = require('@dicebear/core');
const { initials, avataaars, lorelei, notionists } = require('@dicebear/collection');

/**
 * Generate a DiceBear avatar URL based on user's name and gender
 * @param {string} seed - The seed value (usually full_name or username)
 * @param {string} [gender] - Gender ('male', 'female', or 'other' for neutral)
 * @returns {string} - Data URI of the generated avatar
 */
const generateDiceBearAvatar = (seed, gender) => {
    let avatar;

    switch (gender) {
        case 'male':
            // Masculine avatar style
            avatar = createAvatar(avataaars, {
                seed: seed,
                size: 128,
                backgroundColor: ['b6e3f4', 'c0aede', 'd1d4f9'],
                accessories: ['prescription01', 'prescription02', 'round'],
                accessoriesColor: ['262e33', '65c9ff'],
                facialHair: ['beardLight', 'beardMajestic', 'moustacheFancy'],
                facialHairColor: ['2c1b18', '4a312c', '724133']
            });
            break;
        case 'female':
            // Feminine avatar style
            avatar = createAvatar(lorelei, {
                seed: seed,
                size: 128,
                backgroundColor: ['ffd5dc', 'ffdfbf', 'd1d4f9', 'c0aede']
            });
            break;
        default:
            // Neutral/Other - use initials style
            avatar = createAvatar(initials, {
                seed: seed,
                size: 128,
                backgroundColor: ['b6e3f4', 'c0aede', 'd1d4f9', 'ffd5dc', 'ffdfbf'],
                fontWeight: 500,
                fontSize: 42
            });
    }

    return avatar.toDataUri();
};

// SIGNUP - Now includes gender and phone_number
const signup = async (req, res) => {
    const { email, password, username, full_name, gender, phone_number } = req.body;

    if (!email || !password || !username || !full_name) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    // Validate gender if provided
    const validGenders = ['male', 'female', 'other'];
    const userGender = validGenders.includes(gender) ? gender : 'other';

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

        // Check if phone number is already in use (if provided)
        if (phone_number) {
            const existingPhone = await Profile.findOne({ phone_number });
            if (existingPhone) {
                return res.status(400).json({ error: "Phone number already registered" });
            }
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

        // 4. Generate DiceBear avatar based on gender
        const avatarDataUri = generateDiceBearAvatar(full_name, userGender);

        // 5. Create Profile with auto-generated avatar
        const newProfile = new Profile({
            user_id: newUser._id,
            username: username.toLowerCase(),
            full_name,
            email,
            avatar_url: avatarDataUri,
            gender: userGender,
            phone_number: phone_number || '',
            phone_verified: false,
            selected_theme: 'artemis'
        });
        await newProfile.save();

        // 6. Generate Token
        const token = jwt.sign(
            { id: newUser._id.toString(), email: newUser.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // 7. Send Welcome Email (async, don't wait)
        sendWelcomeEmail(email, username, full_name).catch(err => {
            console.error('Failed to send welcome email:', err);
        });

        res.json({
            token,
            user: {
                id: newUser._id,
                email: newUser.email,
                username: newProfile.username,
                full_name: newProfile.full_name,
                gender: newProfile.gender,
                avatar: avatarDataUri
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
            active_profile_mode: mode,
            // Optimistic UI Support: Return both identities explicitly
            identities: {
                personal: {
                    username: profileObj.username,
                    full_name: profileObj.full_name,
                    bio: profileObj.bio,
                    avatar_url: profileObj.avatar_url,
                    selected_theme: profileObj.selected_theme,
                    design_config: profileObj.design_config
                },
                store: {
                    username: profileObj.store_username || '',
                    full_name: profileObj.store_name || '',
                    bio: profileObj.store_bio || '',
                    avatar_url: profileObj.store_avatar_url || '',
                    selected_theme: profileObj.store_selected_theme || 'clean',
                    design_config: profileObj.store_design_config || {}
                }
            }
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
    const { password } = req.body; // Expect password in body

    if (!password) {
        return res.status(400).json({ error: "Password is required to delete account" });
    }

    try {
        // Verify Password first
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: "Incorrect password. Account deletion failed." });
        }

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

// SIGNUP SEND OTP - Step 1: Validate data and send OTP to email
const signupSendOTP = async (req, res) => {
    const { email, username } = req.body;

    if (!email || !username) {
        return res.status(400).json({ error: "Email and username are required" });
    }

    try {
        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists with this email" });
        }

        // Check if username is taken
        const existingProfile = await Profile.findOne({ username: username.toLowerCase() });
        if (existingProfile) {
            return res.status(400).json({ error: "Username already taken" });
        }

        // Send OTP to email via MSG91
        const msg91Service = require('../services/msg91Service');
        const result = await msg91Service.sendEmailOTP(email);

        if (result.success) {
            // Mask email for display
            const maskedEmail = email.replace(/(.{2})(.*)(@.*)/, '$1****$3');
            res.json({
                success: true,
                message: "OTP sent to your email",
                maskedEmail
            });
        } else {
            res.status(500).json({ error: result.message || "Failed to send OTP" });
        }
    } catch (err) {
        console.error("Signup Send OTP Error:", err);
        res.status(500).json({ error: "Failed to send verification code" });
    }
};

// SIGNUP VERIFY OTP - Step 2: Verify email OTP and complete registration
const signupVerifyOTP = async (req, res) => {
    const { email, password, username, full_name, gender, phone_number, otp } = req.body;

    if (!email || !password || !username || !full_name || !otp) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        // Verify email OTP via MSG91
        const msg91Service = require('../services/msg91Service');
        const otpResult = await msg91Service.verifyEmailOTP(email, otp);

        if (!otpResult.success) {
            return res.status(400).json({ error: otpResult.message || "Invalid OTP" });
        }

        // Double-check email and username availability (in case of race conditions)
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists with this email" });
        }

        const existingProfile = await Profile.findOne({ username: username.toLowerCase() });
        if (existingProfile) {
            return res.status(400).json({ error: "Username already taken" });
        }

        // Validate gender
        const validGenders = ['male', 'female', 'other'];
        const userGender = validGenders.includes(gender) ? gender : 'other';

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Create User
        const newUser = new User({
            email,
            password_hash: passwordHash
        });
        await newUser.save();

        // Generate DiceBear avatar based on gender
        const avatarDataUri = generateDiceBearAvatar(full_name, userGender);

        // Create Profile with verified email
        const newProfile = new Profile({
            user_id: newUser._id,
            username: username.toLowerCase(),
            full_name,
            email,
            avatar_url: avatarDataUri,
            gender: userGender,
            phone_number: phone_number || '',
            phone_verified: false,
            selected_theme: 'artemis'
        });
        await newProfile.save();

        // Generate Token
        const token = jwt.sign(
            { id: newUser._id.toString(), email: newUser.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Send Welcome Email (async, don't wait)
        sendWelcomeEmail(email, username, full_name).catch(err => {
            console.error('Failed to send welcome email:', err);
        });

        res.json({
            token,
            user: {
                id: newUser._id,
                email: newUser.email,
                username: newProfile.username,
                full_name: newProfile.full_name,
                gender: newProfile.gender,
                avatar: avatarDataUri,
                phone_verified: true
            }
        });

    } catch (err) {
        console.error("Signup Verify OTP Error:", err);
        res.status(500).json({ error: err.message });
    }
};

// CHECK USERNAME AVAILABILITY
const checkUsernameAvailability = async (req, res) => {
    const { username } = req.params;

    if (!username) {
        return res.status(400).json({ available: false, message: "Username is required" });
    }

    // Validate username format (alphanumeric, hyphens, underscores only, 3-30 chars)
    const usernameRegex = /^[a-z0-9_-]{3,30}$/;
    if (!usernameRegex.test(username.toLowerCase())) {
        return res.json({
            available: false,
            message: "Username must be 3-30 characters and contain only letters, numbers, hyphens, or underscores"
        });
    }

    try {
        // Check if username exists in Profile collection
        const existingProfile = await Profile.findOne({ username: username.toLowerCase() });

        if (existingProfile) {
            return res.json({
                available: false,
                message: "Username is already taken"
            });
        }

        // Also check store_username field
        const existingStoreProfile = await Profile.findOne({ store_username: username.toLowerCase() });

        if (existingStoreProfile) {
            return res.json({
                available: false,
                message: "Username is already taken"
            });
        }

        res.json({
            available: true,
            message: "Username is available"
        });

    } catch (err) {
        console.error("Check Username Error:", err);
        res.status(500).json({ available: false, message: "Error checking username availability" });
    }
};

// QUICK SIGNUP - Send OTP (Step 1)
const quickSignupSendOTP = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: "Email is required" });
    }

    try {
        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.json({
                success: false,
                error: "User already exists with this email",
                isExistingUser: true
            });
        }

        // Send OTP to email via MSG91
        const msg91Service = require('../services/msg91Service');
        const result = await msg91Service.sendEmailOTP(email);

        if (result.success) {
            // Mask email for display
            const maskedEmail = email.replace(/(.{2})(.*)(@.*)/, '$1****$3');
            res.json({
                success: true,
                message: "OTP sent to your email",
                maskedEmail
            });
        } else {
            res.status(500).json({ error: result.message || "Failed to send OTP" });
        }
    } catch (err) {
        console.error("Quick Signup Send OTP Error:", err);
        res.status(500).json({ error: "Failed to send verification code" });
    }
};

// QUICK SIGNUP - Verify OTP & Create Account (Step 2)
const quickSignupVerify = async (req, res) => {
    const { email, otp, full_name, phone_number } = req.body;

    if (!email || !otp || !full_name || !phone_number) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        // Verify email OTP via MSG91
        const msg91Service = require('../services/msg91Service');
        const otpResult = await msg91Service.verifyEmailOTP(email, otp);

        if (!otpResult.success) {
            return res.status(400).json({ error: otpResult.message || "Invalid OTP" });
        }

        // Double-check email
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.json({
                success: false,
                error: "User already exists with this email",
                isExistingUser: true
            });
        }

        // Generate base username from full_name
        let baseUsername = full_name.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (baseUsername.length < 3) baseUsername = 'user' + baseUsername;

        // Find unique username
        let username = baseUsername;
        let counter = 1;
        while (true) {
            const existingProfile = await Profile.findOne({ username });
            if (!existingProfile) break;
            username = `${baseUsername}${counter}`;
            counter++;
        }

        // Generate random secure password
        const crypto = require('crypto');
        const password = crypto.randomBytes(16).toString('hex');
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Create User
        const newUser = new User({
            email,
            password_hash: passwordHash
        });
        await newUser.save();

        // Generate Avatar
        const avatarDataUri = generateDiceBearAvatar(full_name, 'other');

        // Create Profile (Personal Mode)
        const newProfile = new Profile({
            user_id: newUser._id,
            username: username,
            full_name,
            email,
            avatar_url: avatarDataUri,
            phone_number,
            phone_verified: false,
            active_profile_mode: 'personal',
            selected_theme: 'artemis'
        });
        await newProfile.save();

        // Generate Token
        const token = jwt.sign(
            { id: newUser._id.toString(), email: newUser.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Send Welcome Email (async)
        sendWelcomeEmail(email, username, full_name).catch(err => {
            console.error('Failed to send welcome email:', err);
        });

        res.json({
            success: true,
            token,
            user: {
                id: newUser._id,
                email: newUser.email,
                username: newProfile.username,
                full_name: newProfile.full_name,
                avatar: avatarDataUri,
                active_profile_mode: 'personal' // Force personal mode initially
            }
        });

    } catch (err) {
        console.error("Quick Signup Verify Error:", err);
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    signup,
    signupSendOTP,
    signupVerifyOTP,
    login,
    me,
    changePassword,
    forgotPasswordSendOTP,
    forgotPasswordVerifyOTP,
    resetPassword,
    resendOTP,
    deleteAccount,
    checkUsernameAvailability,
    quickSignupSendOTP,
    quickSignupVerify
};
