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

        // Fix: Prioritize Personal Username match. 
        // Only return store data if the requested username matches store_username AND does NOT match personal username
        // (unless separate routes are used, but for /:username, we prefer personal if ambiguous)
        const isPersonalMatch = profileObj.username === normalizedUsername;
        const isStoreMatch = !isPersonalMatch && profileObj.store_username === normalizedUsername;

        // If matched by store_username only, return store data mapped to standard fields
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

        console.log('Profile update request for user:', userId, 'Data:', JSON.stringify(rawUpdateData));

        // Fetch current profile
        const profile = await Profile.findOne({ user_id: userId });
        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        const mode = profile.active_profile_mode || 'personal';
        const isStore = mode === 'store';

        // Prepare updates via direct assignment to ensure Mixed types are handled
        if (isStore) {
            if (rawUpdateData.username) profile.store_username = rawUpdateData.username.toLowerCase().trim();
            if (rawUpdateData.full_name) profile.store_name = rawUpdateData.full_name.trim();
            if (rawUpdateData.bio) profile.store_bio = rawUpdateData.bio;
            if (rawUpdateData.avatar_url) profile.store_avatar_url = rawUpdateData.avatar_url;

            if (rawUpdateData.design_config) {
                profile.store_design_config = rawUpdateData.design_config;
                profile.markModified('store_design_config');
            }
        } else {
            if (rawUpdateData.username) profile.username = rawUpdateData.username.toLowerCase().trim();
            if (rawUpdateData.full_name) profile.full_name = rawUpdateData.full_name.trim();
            if (rawUpdateData.bio) profile.bio = rawUpdateData.bio;
            if (rawUpdateData.avatar_url) profile.avatar_url = rawUpdateData.avatar_url;

            if (rawUpdateData.design_config) {
                profile.design_config = rawUpdateData.design_config;
                profile.markModified('design_config');
            }

            if (rawUpdateData.social_links) {
                profile.social_links = rawUpdateData.social_links;
                profile.markModified('social_links');
            }
            if (typeof rawUpdateData.show_shop_on_profile !== 'undefined') {
                profile.show_shop_on_profile = rawUpdateData.show_shop_on_profile;
            }
        }

        // Handle Global Username Check if changed
        const newUsername = isStore ? profile.store_username : profile.username;
        // Verify uniqueness if username changed? 
        // Logic skipped for brevity but ideally check if modified.

        // Handle Language Update (User model)
        if (rawUpdateData.language) {
            await User.findByIdAndUpdate(userId, { language: rawUpdateData.language });
        }

        profile.updated_at = new Date();
        await profile.save();

        console.log('Profile updated successfully (save)');
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

