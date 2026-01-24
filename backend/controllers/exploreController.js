const Profile = require('../models/Profile');

exports.getAllBusinesses = async (req, res) => {
    try {
        // Fetch all profiles that have a store_name (implies they are a business)
        // Removing store_published: true check to allow seeing all registered businesses during dev
        const businesses = await Profile.find({
            store_name: { $exists: true, $ne: '' }
        })
            .select('store_name store_username store_bio store_avatar_url store_category user_id design_config store_selected_theme')
            .lean();

        res.status(200).json(businesses);
    } catch (error) {
        console.error('Error fetching businesses:', error);
        res.status(500).json({ message: 'Server error fetching businesses' });
    }
};
