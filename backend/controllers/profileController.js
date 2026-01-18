const Profile = require('../models/Profile');
const Link = require('../models/Link');

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
            design_config: profileObj.design_config
        });
    } catch (err) {
        console.error('Error fetching public profile:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Update profile
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const updateData = req.body;

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
            return res.status(404).json({ error: 'Profile not found' });
        }

        res.json({ success: true, profile });
    } catch (err) {
        console.error('Error updating profile:', err);
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
    updateProfile,
    updateTheme
};
