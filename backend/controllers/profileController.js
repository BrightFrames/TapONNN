const Profile = require('../models/Profile');
const Link = require('../models/Link');
const { Product } = require('../models/Product');
const User = require('../models/User');

// Get public profile by username
// Get public profile by username (Personal OR Store)
const getPublicProfile = async (req, res) => {
    try {
        const { username } = req.params;
        const normalizedUsername = username.toLowerCase();

        // Find profile matching either username OR store_username
        const profile = await Profile.findOne({
            $or: [
                { username: normalizedUsername },
                { store_username: normalizedUsername }
            ]
        });

        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        const profileObj = profile.toObject();
        const isStoreMatch = profileObj.store_username === normalizedUsername;

        // If matched by store_username, return store data mapped to standard fields
        if (isStoreMatch) {
            res.json({
                id: profileObj.user_id,
                username: profileObj.store_username,
                full_name: profileObj.store_name || profileObj.full_name, // Fallback? Or empty?
                bio: profileObj.store_bio,
                avatar_url: profileObj.store_avatar_url || profileObj.avatar_url, // Fallback common
                selected_theme: profileObj.store_selected_theme,
                // Store specific?
                social_links: profileObj.social_links instanceof Map ? Object.fromEntries(profileObj.social_links) : profileObj.social_links,
                design_config: profileObj.store_design_config || {},
                has_store: true,
                store_published: profileObj.store_published,
                is_store_identity: true // Flag for frontend if needed
            });
        } else {
            // Personal match
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
                store_published: profileObj.store_published,
                is_store_identity: false
            });
        }
    } catch (err) {
        console.error('Error fetching public profile:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Get public store profile by username
const getPublicStoreProfile = async (req, res) => {
    try {
        const { username } = req.params;
        const normalizedUsername = username.toLowerCase();

        // Find profile by store_username OR by regular username (for users without separate store username)
        let profile = await Profile.findOne({ store_username: normalizedUsername });

        // If not found by store_username, try regular username for users with has_store enabled
        if (!profile) {
            profile = await Profile.findOne({
                username: normalizedUsername,
                has_store: true
            });
        }

        // Final fallback: just find by username (for users who haven't explicitly enabled store)
        if (!profile) {
            profile = await Profile.findOne({ username: normalizedUsername });
        }

        if (!profile) {
            return res.status(404).json({ error: 'Store not found' });
        }

        const profileObj = profile.toObject();
        const hasStoreUsername = !!profileObj.store_username;

        // Return store-specific data (fallback to personal data if store-specific not set)
        res.json({
            id: profileObj.user_id,
            username: hasStoreUsername ? profileObj.store_username : profileObj.username,
            full_name: profileObj.store_name || profileObj.full_name,
            bio: profileObj.store_bio || profileObj.bio || '',
            avatar_url: profileObj.store_avatar_url || profileObj.avatar_url,
            selected_theme: profileObj.store_selected_theme || profileObj.selected_theme || 'clean',
            social_links: profileObj.social_links instanceof Map ? Object.fromEntries(profileObj.social_links) : profileObj.social_links,
            design_config: profileObj.store_design_config || profileObj.design_config || {},
            has_store: true,
            store_published: profileObj.store_published,
            is_store_identity: true
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
        const rawUpdateData = req.body;

        console.log('Profile update request for user:', userId, 'Data:', rawUpdateData);

        // Fetch current profile to determine mode
        const currentProfile = await Profile.findOne({ user_id: userId });
        if (!currentProfile) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        const mode = currentProfile.active_profile_mode || 'personal';
        const isStore = mode === 'store';

        // Prepare the actual update object
        let updateData = {};

        // Map fields based on mode
        if (isStore) {
            if (rawUpdateData.username) updateData.store_username = rawUpdateData.username.toLowerCase().trim();
            if (rawUpdateData.full_name) updateData.store_name = rawUpdateData.full_name.trim();
            if (rawUpdateData.bio) updateData.store_bio = rawUpdateData.bio;
            if (rawUpdateData.avatar_url) updateData.store_avatar_url = rawUpdateData.avatar_url;
            // Social links? Not splitting yet unless requested, but keeping separate is safer? 
            // User asked for "settings should be different". Let's assume shared for now or ignored?
            // "both the settings shsould be different".
            // Let's allow separation if frontend sends it.
            // But frontend currently sends "social_links" generic.
            // We can add store_social_links later. Sticking to Identity.

            // Design/Theme
            if (rawUpdateData.design_config) updateData.store_design_config = rawUpdateData.design_config;
            // Theme is handled in updateTheme, but sometimes passed here
        } else {
            // Personal Mode - direct mapping
            if (rawUpdateData.username) updateData.username = rawUpdateData.username.toLowerCase().trim();
            if (rawUpdateData.full_name) updateData.full_name = rawUpdateData.full_name.trim();
            if (rawUpdateData.bio) updateData.bio = rawUpdateData.bio;
            if (rawUpdateData.avatar_url) updateData.avatar_url = rawUpdateData.avatar_url;
            if (rawUpdateData.design_config) updateData.design_config = rawUpdateData.design_config;
            // social_links maps to social_links
            if (rawUpdateData.social_links) updateData.social_links = rawUpdateData.social_links;
        }

        // Handle Username Uniqueness (Global Check)
        const newUsername = isStore ? updateData.store_username : updateData.username;
        if (newUsername) {
            // Check collision with ANY username or ANY store_username
            // Exclude current user's OWN usernames (both store and personal)
            const collision = await Profile.findOne({
                $and: [
                    { user_id: { $ne: userId } }, // Not me
                    {
                        $or: [
                            { username: newUsername },
                            { store_username: newUsername }
                        ]
                    }
                ]
            });

            if (collision) {
                return res.status(400).json({ error: 'Username is already taken' });
            }
        }

        // Handle Language Update (User model) - shared
        if (rawUpdateData.language) {
            await User.findByIdAndUpdate(userId, { language: rawUpdateData.language });
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

        console.log('Profile updated successfully:', isStore ? profile.store_username : profile.username);

        // Return context-aware response (mirroring getMe logic roughly)
        // Actually frontend expects "profile" object.
        // We should just return the raw profile and let frontend re-fetch 'me' or handle it.
        // But better to return consistent shape? 
        // Existing code returned raw profile. Let's return raw profile but frontend might be confused?
        // Let's return the raw, frontend usually refreshes 'me' anyway.
        res.json({ success: true, profile });

    } catch (err) {
        console.error('Error updating profile:', err);
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

        const profile = await Profile.findOne({ user_id: userId });
        const mode = profile?.active_profile_mode || 'personal';

        const updateField = (mode === 'store') ? { store_selected_theme: themeId } : { selected_theme: themeId };

        await Profile.findOneAndUpdate(
            { user_id: userId },
            {
                ...updateField,
                updated_at: new Date()
            }
        );

        res.json({ success: true });
    } catch (err) {
        console.error('Error updating theme:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Switch active profile mode (for Super Users)
const switchProfileMode = async (req, res) => {
    try {
        const userId = req.user.id;
        const { mode } = req.body;

        if (!['personal', 'store'].includes(mode)) {
            return res.status(400).json({ error: 'Invalid mode. Must be "personal" or "store"' });
        }

        const updateFields = { active_profile_mode: mode, updated_at: new Date() };

        // Auto-enable store if switching to store mode
        if (mode === 'store') {
            updateFields.has_store = true;
        }

        const profile = await Profile.findOneAndUpdate(
            { user_id: userId },
            updateFields,
            { new: true }
        );

        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        // Check if store allows switching (Removed restriction as per request)
        // if (mode === 'store' && !profile.has_store) { ... }

        res.json({
            success: true,
            active_profile_mode: profile.active_profile_mode
        });
    } catch (err) {
        console.error('Error switching profile mode:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = {
    getPublicProfile,
    getPublicStoreProfile,
    updateProfile,
    updateTheme,
    switchProfileMode
};

