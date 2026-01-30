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
        const plugins = [
            // Shipping & Logistics
            {
                name: 'Shiprocket',
                slug: 'shiprocket',
                description: 'India\'s #1 Shipping Solution. Automated shipping for eCommerce.',
                icon: 'truck',
                category: 'Commerce',
                type: 'integration',
                is_premium: true,
                config_schema: [
                    { name: 'email', label: 'Email', type: 'email', placeholder: 'Enter your Shiprocket email' },
                    { name: 'password', label: 'Password', type: 'password', placeholder: 'Enter your Shiprocket password' }
                ]
            },
            {
                name: 'Delhivery',
                slug: 'delhivery',
                description: 'Integrated logistics for deliveries across 18000+ pincodes.',
                icon: 'box',
                category: 'Commerce',
                type: 'integration',
                is_premium: true,
                config_schema: [
                    { name: 'api_token', label: 'API Token', type: 'password', placeholder: 'Enter your Delhivery API Token' },
                    { name: 'client_id', label: 'Client ID', type: 'text', placeholder: 'Enter your Client ID' }
                ]
            },

            // Payments
            {
                name: 'Razorpay',
                slug: 'razorpay',
                description: 'Accept payments via UPI, Cards, Netbanking & Wallets.',
                icon: 'credit-card',
                category: 'Commerce',
                type: 'payment',
                is_premium: false,
                config_schema: [
                    { name: 'key_id', label: 'Key ID', type: 'text', placeholder: 'rzp_test_...' },
                    { name: 'key_secret', label: 'Key Secret', type: 'password', placeholder: 'Enter your Key Secret' }
                ]
            },
            {
                name: 'Stripe',
                slug: 'stripe',
                description: 'The new standard in online payments.',
                icon: 'credit-card',
                category: 'Commerce',
                type: 'payment',
                is_premium: false,
                config_schema: [
                    { name: 'publishable_key', label: 'Publishable Key', type: 'text', placeholder: 'pk_test_...' },
                    { name: 'secret_key', label: 'Secret Key', type: 'password', placeholder: 'sk_test_...' }
                ]
            },

            // Scheduling
            {
                name: 'Calendly',
                slug: 'calendly',
                description: 'Professional scheduling for meetings and appointments.',
                icon: 'calendar',
                category: 'Scheduling',
                type: 'integration',
                config_schema: [
                    { name: 'personal_token', label: 'Personal Access Token', type: 'password', placeholder: 'Enter your Calendly PAT' },
                    { name: 'scheduling_url', label: 'Scheduling Link', type: 'url', placeholder: 'https://calendly.com/your-link' }
                ]
            },

             // Existing Social & Content (Updated with empty config_schema where needed)
            { name: 'Instagram', slug: 'instagram', description: 'Display your Instagram feed and posts', icon: 'instagram', category: 'Social', type: 'embed', config_schema: [] },
            { name: 'X / Twitter', slug: 'twitter', description: 'Embed tweets and your Twitter profile', icon: 'twitter', category: 'Social', type: 'embed', config_schema: [] },
            { name: 'YouTube', slug: 'youtube', description: 'Embed YouTube videos and channels', icon: 'youtube', category: 'Video', type: 'embed', config_schema: [] },
            { name: 'Spotify', slug: 'spotify', description: 'Embed Spotify tracks and playlists', icon: 'spotify', category: 'Music', type: 'embed', config_schema: [] },
            { name: 'Shopify', slug: 'shopify', description: 'Connect your Shopify store', icon: 'shopify', category: 'Commerce', type: 'link_enhancement', is_premium: true, config_schema: [{ name: 'shop_url', label: 'Shop URL', type: 'url', placeholder: 'https://your-store.myshopify.com' }] },
            { name: 'WhatsApp', slug: 'whatsapp', description: 'Direct WhatsApp contact', icon: 'whatsapp', category: 'Community', type: 'link_enhancement', config_schema: [{ name: 'phone_number', label: 'Phone Number', type: 'tel', placeholder: '+91 9999999999' }] },
        ];

        let operations = plugins.map(plugin => ({
            updateOne: {
                filter: { slug: plugin.slug },
                update: { $set: plugin },
                upsert: true
            }
        }));

        const result = await Plugin.bulkWrite(operations);
        res.json({ 
            message: 'Plugins seeded successfully', 
            matchedCount: result.matchedCount,
            modifiedCount: result.modifiedCount,
            upsertedCount: result.upsertedCount
        });
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
