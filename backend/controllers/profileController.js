const Profile = require('../models/Profile');
const Link = require('../models/Link');
const { Product } = require('../models/Product');
const User = require('../models/User');

// Get public profile by username
const getPublicProfile = async (req, res) => {
    try {
        const { username } = req.params;

        const profile = await Profile.findOne({ username: username.toLowerCase() });

        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        const profileObj = profile.toObject();
        res.json({
            id: profileObj.user_id,
            username: profileObj.username,
            full_name: profileObj.full_name,
            bio: profileObj.bio,
            avatar_url: profileObj.avatar_url,
            selected_theme: profileObj.selected_theme,
            social_links: profileObj.social_links instanceof Map ? Object.fromEntries(profileObj.social_links) : profileObj.social_links,
            design_config: profileObj.design_config,
            has_store: profileObj.has_store,
            store_published: profileObj.store_published
        });
    } catch (err) {
        console.error('Error fetching public profile:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Get public store profile by username
const getPublicStoreProfile = async (req, res) => {
    try {
        const { username } = req.params;

        const profile = await Profile.findOne({ username: username.toLowerCase() });

        if (!profile) {
            return res.status(404).json({ error: 'Store not found' });
        }

        // Check if store is published
        if (!profile.store_published) {
            return res.status(404).json({ error: 'Store not available' });
        }

        // Get user's products
        const products = await Product.find({
            user_id: profile.user_id,
            is_active: true
        }).sort({ created_at: -1 }).lean();

        const profileObj = profile.toObject();
        res.json({
            id: profileObj.user_id,
            username: profileObj.username,
            full_name: profileObj.full_name,
            bio: profileObj.bio,
            avatar_url: profileObj.avatar_url,
            selected_theme: profileObj.selected_theme,
            products: products
        });
    } catch (err) {
        console.error('Error fetching public store:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Update profile
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const updateData = req.body;

        console.log('Profile update request for user:', userId, 'Data:', updateData);

        // If username is being updated, check for duplicates
        if (updateData.username) {
            const normalizedUsername = updateData.username.toLowerCase().trim();
            const existingProfile = await Profile.findOne({
                username: normalizedUsername,
                user_id: { $ne: userId } // Exclude current user
            });

            if (existingProfile) {
                return res.status(400).json({ error: 'Username is already taken' });
            }

            // Normalize username
            updateData.username = normalizedUsername;
        }

        // Handle Language Update (User model)
        if (updateData.language) {
            await User.findByIdAndUpdate(userId, { language: updateData.language });
            // Remove from profile update data as it's not in Profile schema
            delete updateData.language;
        }

        // Find and update profile
        const profile = await Profile.findOneAndUpdate(
            { user_id: userId },
            {
                $set: {
                    ...updateData,
                    updated_at: new Date()
                }
            },
            { new: true }
        );

        if (!profile) {
            console.log('Profile not found for user:', userId);
            return res.status(404).json({ error: 'Profile not found' });
        }

        console.log('Profile updated successfully:', profile.username);
        res.json({ success: true, profile });
    } catch (err) {
        console.error('Error updating profile:', err);
        // Handle MongoDB duplicate key error
        if (err.code === 11000) {
            return res.status(400).json({ error: 'Username is already taken' });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Update theme
const updateTheme = async (req, res) => {
    try {
        const userId = req.user.id;
        const { themeId } = req.body;

        await Profile.findOneAndUpdate(
            { user_id: userId },
            { selected_theme: themeId, updated_at: new Date() }
        );

        res.json({ success: true });
    } catch (err) {
        console.error('Error updating theme:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = {
    getPublicProfile,
    getPublicStoreProfile,
    updateProfile,
    updateTheme
};

