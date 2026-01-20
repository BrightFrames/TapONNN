const Plugin = require('../models/Plugin');
const UserPlugin = require('../models/UserPlugin');
const Intent = require('../models/Intent');

// Get all available plugins
const getAllPlugins = async (req, res) => {
    try {
        const plugins = await Plugin.find().sort({ category: 1, name: 1 });
        res.json(plugins);
    } catch (error) {
        console.error('Error fetching plugins:', error);
        res.status(500).json({ error: 'Failed to fetch plugins' });
    }
};

// Get plugins by category
const getPluginsByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const plugins = await Plugin.find({ category }).sort({ name: 1 });
        res.json(plugins);
    } catch (error) {
        console.error('Error fetching plugins by category:', error);
        res.status(500).json({ error: 'Failed to fetch plugins' });
    }
};

// Get user's installed plugins
const getUserPlugins = async (req, res) => {
    try {
        const userId = req.user.id;
        const userPlugins = await UserPlugin.find({ user_id: userId })
            .populate('plugin_id')
            .sort({ installed_at: -1 });

        res.json(userPlugins);
    } catch (error) {
        console.error('Error fetching user plugins:', error);
        res.status(500).json({ error: 'Failed to fetch installed plugins' });
    }
};

// Install a plugin for user
const installPlugin = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id: pluginId } = req.params;
        const { intent_id } = req.body; // Optional intent tracking

        // Check if plugin exists
        const plugin = await Plugin.findById(pluginId);
        if (!plugin) {
            return res.status(404).json({ error: 'Plugin not found' });
        }

        // Check if already installed
        const existingInstall = await UserPlugin.findOne({
            user_id: userId,
            plugin_id: pluginId
        });

        if (existingInstall) {
            return res.status(400).json({ error: 'Plugin already installed' });
        }

        // Install the plugin
        const userPlugin = new UserPlugin({
            user_id: userId,
            plugin_id: pluginId,
            is_active: true,
            config: {}
        });

        await userPlugin.save();

        // Increment install count
        await Plugin.findByIdAndUpdate(pluginId, { $inc: { install_count: 1 } });

        // Update Intent if provided
        if (intent_id) {
            await Intent.findByIdAndUpdate(intent_id, {
                status: 'completed',
                linked_plugin_install_id: userPlugin._id,
                completed_at: new Date()
            });
        }

        // Return populated plugin
        const populated = await UserPlugin.findById(userPlugin._id).populate('plugin_id');

        res.status(201).json(populated);
    } catch (error) {
        console.error('Error installing plugin:', error);
        res.status(500).json({ error: 'Failed to install plugin' });
    }
};

// Uninstall a plugin for user
const uninstallPlugin = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id: pluginId } = req.params;

        const result = await UserPlugin.findOneAndDelete({
            user_id: userId,
            plugin_id: pluginId
        });

        if (!result) {
            return res.status(404).json({ error: 'Plugin not installed' });
        }

        // Decrement install count
        await Plugin.findByIdAndUpdate(pluginId, { $inc: { install_count: -1 } });

        res.json({ message: 'Plugin uninstalled successfully' });
    } catch (error) {
        console.error('Error uninstalling plugin:', error);
        res.status(500).json({ error: 'Failed to uninstall plugin' });
    }
};

// Toggle plugin active status
const togglePluginStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id: pluginId } = req.params;

        const userPlugin = await UserPlugin.findOne({
            user_id: userId,
            plugin_id: pluginId
        });

        if (!userPlugin) {
            return res.status(404).json({ error: 'Plugin not installed' });
        }

        userPlugin.is_active = !userPlugin.is_active;
        await userPlugin.save();

        const populated = await UserPlugin.findById(userPlugin._id).populate('plugin_id');
        res.json(populated);
    } catch (error) {
        console.error('Error toggling plugin status:', error);
        res.status(500).json({ error: 'Failed to toggle plugin status' });
    }
};

// Update plugin configuration
const updatePluginConfig = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id: pluginId } = req.params;
        const { config } = req.body;

        const userPlugin = await UserPlugin.findOneAndUpdate(
            { user_id: userId, plugin_id: pluginId },
            { config },
            { new: true }
        ).populate('plugin_id');

        if (!userPlugin) {
            return res.status(404).json({ error: 'Plugin not installed' });
        }

        res.json(userPlugin);
    } catch (error) {
        console.error('Error updating plugin config:', error);
        res.status(500).json({ error: 'Failed to update plugin config' });
    }
};

// Seed initial plugins (for development)
const seedPlugins = async (req, res) => {
    try {
        const existingCount = await Plugin.countDocuments();
        if (existingCount > 0) {
            return res.json({ message: 'Plugins already seeded', count: existingCount });
        }

        const plugins = [
            // Social
            { name: 'Instagram', slug: 'instagram', description: 'Display your Instagram feed and posts', icon: 'instagram', category: 'Social', type: 'embed' },
            { name: 'X / Twitter', slug: 'twitter', description: 'Embed tweets and your Twitter profile', icon: 'twitter', category: 'Social', type: 'embed' },
            { name: 'TikTok', slug: 'tiktok', description: 'Showcase your TikTok videos', icon: 'tiktok', category: 'Social', type: 'embed' },
            { name: 'LinkedIn', slug: 'linkedin', description: 'Connect your LinkedIn profile', icon: 'linkedin', category: 'Social', type: 'link_enhancement' },
            { name: 'Snapchat', slug: 'snapchat', description: 'Share your Snapchat profile', icon: 'snapchat', category: 'Social', type: 'link_enhancement' },

            // Music
            { name: 'Spotify', slug: 'spotify', description: 'Embed Spotify tracks and playlists', icon: 'spotify', category: 'Music', type: 'embed' },
            { name: 'Apple Music', slug: 'apple-music', description: 'Share Apple Music content', icon: 'apple', category: 'Music', type: 'embed' },
            { name: 'SoundCloud', slug: 'soundcloud', description: 'Embed SoundCloud tracks', icon: 'soundcloud', category: 'Music', type: 'embed' },
            { name: 'Bandcamp', slug: 'bandcamp', description: 'Sell and share music via Bandcamp', icon: 'bandcamp', category: 'Music', type: 'embed' },
            { name: 'Deezer', slug: 'deezer', description: 'Share Deezer tracks and playlists', icon: 'deezer', category: 'Music', type: 'embed' },

            // Video
            { name: 'YouTube', slug: 'youtube', description: 'Embed YouTube videos and channels', icon: 'youtube', category: 'Video', type: 'embed' },
            { name: 'Twitch', slug: 'twitch', description: 'Embed Twitch streams and clips', icon: 'twitch', category: 'Video', type: 'embed' },
            { name: 'Vimeo', slug: 'vimeo', description: 'Showcase Vimeo videos', icon: 'vimeo', category: 'Video', type: 'embed' },

            // Commerce
            { name: 'Shopify', slug: 'shopify', description: 'Connect your Shopify store', icon: 'shopify', category: 'Commerce', type: 'link_enhancement', is_premium: true },
            { name: 'Spring', slug: 'spring', description: 'Sell merchandise through Spring', icon: 'spring', category: 'Commerce', type: 'embed' },
            { name: 'GoFundMe', slug: 'gofundme', description: 'Add donation and fundraising links', icon: 'gofundme', category: 'Commerce', type: 'link_enhancement' },
            { name: 'PayPal', slug: 'paypal', description: 'Accept payments via PayPal', icon: 'paypal', category: 'Commerce', type: 'payment' },
            { name: 'Buy Me a Coffee', slug: 'buymeacoffee', description: 'Accept tips and support', icon: 'coffee', category: 'Commerce', type: 'payment' },
            { name: 'Patreon', slug: 'patreon', description: 'Connect your Patreon for memberships', icon: 'patreon', category: 'Commerce', type: 'link_enhancement' },

            // Scheduling
            { name: 'Calendly', slug: 'calendly', description: 'Book appointments and meetings', icon: 'calendar', category: 'Scheduling', type: 'scheduling' },
            { name: 'Cal.com', slug: 'calcom', description: 'Open-source scheduling solution', icon: 'calendar', category: 'Scheduling', type: 'scheduling' },

            // Forms
            { name: 'Typeform', slug: 'typeform', description: 'Create beautiful forms and surveys', icon: 'typeform', category: 'Forms', type: 'embed' },
            { name: 'Google Forms', slug: 'google-forms', description: 'Embed Google Forms', icon: 'google', category: 'Forms', type: 'embed' },

            // Marketing
            { name: 'Mailchimp', slug: 'mailchimp', description: 'Email newsletter signup', icon: 'mailchimp', category: 'Marketing', type: 'embed' },
            { name: 'ConvertKit', slug: 'convertkit', description: 'Creator email marketing', icon: 'convertkit', category: 'Marketing', type: 'embed', is_premium: true },

            // Community
            { name: 'Discord', slug: 'discord', description: 'Join your Discord community', icon: 'discord', category: 'Community', type: 'link_enhancement' },
            { name: 'Telegram', slug: 'telegram', description: 'Join Telegram channel or group', icon: 'telegram', category: 'Community', type: 'link_enhancement' },
            { name: 'WhatsApp', slug: 'whatsapp', description: 'Direct WhatsApp contact', icon: 'whatsapp', category: 'Community', type: 'link_enhancement' },
        ];

        await Plugin.insertMany(plugins);
        res.json({ message: 'Plugins seeded successfully', count: plugins.length });
    } catch (error) {
        console.error('Error seeding plugins:', error);
        res.status(500).json({ error: 'Failed to seed plugins' });
    }
};

module.exports = {
    getAllPlugins,
    getPluginsByCategory,
    getUserPlugins,
    installPlugin,
    uninstallPlugin,
    togglePluginStatus,
    updatePluginConfig,
    seedPlugins
};
