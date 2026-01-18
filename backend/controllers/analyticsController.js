const mongoose = require('mongoose');

// Analytics Schema (for tracking views and clicks)
const profileViewSchema = new mongoose.Schema({
    profile_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile',
        required: true
    },
    viewed_at: {
        type: Date,
        default: Date.now
    },
    ip_address: String,
    user_agent: String,
    referrer: String
});

profileViewSchema.index({ profile_id: 1, viewed_at: -1 });

const ProfileView = mongoose.model('ProfileView', profileViewSchema);

// Track profile view
const trackProfileView = async (req, res) => {
    try {
        const { profileId } = req.params;

        const view = new ProfileView({
            profile_id: profileId,
            ip_address: req.ip,
            user_agent: req.get('User-Agent'),
            referrer: req.get('Referrer')
        });

        await view.save();
        res.json({ success: true });
    } catch (err) {
        console.error('Error tracking view:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Get analytics for user
const getAnalytics = async (req, res) => {
    try {
        const userId = req.user.id;
        const Profile = require('../models/Profile');
        const Link = require('../models/Link');

        // Get profile
        const profile = await Profile.findOne({ user_id: userId });
        if (!profile) {
            return res.json({ views: 0, clicks: 0, links: [] });
        }

        // Count views (last 30 days)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const viewCount = await ProfileView.countDocuments({
            profile_id: profile._id,
            viewed_at: { $gte: thirtyDaysAgo }
        });

        // Get link stats
        const links = await Link.find({ user_id: userId }).lean();
        const totalClicks = links.reduce((sum, l) => sum + (l.clicks || 0), 0);

        // Top links by clicks
        const topLinks = links
            .sort((a, b) => (b.clicks || 0) - (a.clicks || 0))
            .slice(0, 5)
            .map(l => ({
                id: l._id,
                title: l.title,
                url: l.url,
                clicks: l.clicks || 0
            }));

        res.json({
            views: viewCount,
            clicks: totalClicks,
            topLinks,
            linkCount: links.length
        });
    } catch (err) {
        console.error('Error fetching analytics:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = {
    trackProfileView,
    getAnalytics,
    ProfileView
};
