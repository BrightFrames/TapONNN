const Store = require('../models/Store');
const Profile = require('../models/Profile');
const User = require('../models/User');
const { Product } = require('../models/Product');
const StoreSubscriber = require('../models/StoreSubscriber');
const emailService = require('../services/emailService');

// Check if username is available
const checkUsernameAvailability = async (req, res) => {
    try {
        const { username } = req.params;
        const normalizedUsername = username.toLowerCase().trim();

        // Check if username is already taken in stores
        const storeExists = await Store.findOne({ username: normalizedUsername });
        if (storeExists) {
            return res.json({ available: false, message: 'Username already taken' });
        }

        // Check if username exists in profiles (personal usernames)
        const profileExists = await Profile.findOne({ username: normalizedUsername });
        if (profileExists) {
            return res.json({ available: false, message: 'Username already taken' });
        }

        res.json({ available: true, message: 'Username is available' });
    } catch (err) {
        console.error('Error checking username:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Create a new store
const createStore = async (req, res) => {
    try {
        const userId = req.user.id || req.user.userId;
        const { username, store_name, bio, avatar_url, category } = req.body;

        if (!username || !store_name) {
            return res.status(400).json({ error: 'Username and store name are required' });
        }

        const normalizedUsername = username.toLowerCase().trim();

        // Check username availability again
        const storeExists = await Store.findOne({ username: normalizedUsername });
        if (storeExists) {
            return res.status(400).json({ error: 'Username already taken' });
        }

        const profileExists = await Profile.findOne({ username: normalizedUsername });
        if (profileExists) {
            return res.status(400).json({ error: 'Username already taken' });
        }

        // Get user's profile
        const profile = await Profile.findOne({ user_id: userId });
        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        // Create new store
        const newStore = new Store({
            user_id: userId,
            profile_id: profile._id,
            profile_username: profile.username,
            username: normalizedUsername,
            store_name: store_name.trim(),
            bio: bio || '',
            avatar_url: avatar_url || profile.avatar_url || '',
            category: category || ''
        });

        await newStore.save();

        res.status(201).json({
            message: 'Store created successfully',
            store: {
                id: newStore._id,
                username: newStore.username,
                store_name: newStore.store_name,
                bio: newStore.bio,
                avatar_url: newStore.avatar_url,
                category: newStore.category,
                published: newStore.published
            }
        });
    } catch (err) {
        console.error('Error creating store:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Get all stores for the authenticated user
const getUserStores = async (req, res) => {
    try {
        const userId = req.user.id || req.user.userId;
        const profile = await Profile.findOne({ user_id: userId });

        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        let stores = await Store.find({ profile_id: profile._id }).sort({ created_at: -1 });

        // Legacy fallback: if profile has store identity but no Store docs, create one
        if (stores.length === 0 && profile.store_username) {
            const existingByProfile = await Store.findOne({ profile_id: profile._id });
            const existingByUsername = await Store.findOne({ username: profile.store_username.toLowerCase() });

            if (!existingByProfile && !existingByUsername) {
                const legacyStore = new Store({
                    user_id: userId,
                    profile_id: profile._id,
                    profile_username: profile.username,
                    username: profile.store_username.toLowerCase(),
                    store_name: profile.store_name || `${profile.full_name}'s Business`,
                    bio: profile.store_bio || '',
                    avatar_url: profile.store_avatar_url || profile.avatar_url || '',
                    published: profile.store_published || false,
                    selected_theme: profile.store_selected_theme || profile.selected_theme || 'clean',
                    design_config: profile.store_design_config || profile.design_config || {},
                });
                await legacyStore.save();
            }

            stores = await Store.find({ profile_id: profile._id }).sort({ created_at: -1 });
        }

        res.json({
            stores: stores.map(store => ({
                id: store._id,
                username: store.username,
                store_name: store.store_name,
                bio: store.bio,
                avatar_url: store.avatar_url,
                category: store.category,
                published: store.published,
                created_at: store.created_at
            }))
        });
    } catch (err) {
        console.error('Error fetching user stores:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Get a specific store by ID
const getStoreById = async (req, res) => {
    try {
        const userId = req.user.id || req.user.userId;
        const { storeId } = req.params;

        const store = await Store.findOne({ _id: storeId, user_id: userId });

        if (!store) {
            return res.status(404).json({ error: 'Store not found' });
        }

        res.json({
            id: store._id,
            username: store.username,
            store_name: store.store_name,
            bio: store.bio,
            avatar_url: store.avatar_url,
            category: store.category,
            published: store.published,
            selected_theme: store.selected_theme,
            design_config: store.design_config,
            payment_instructions: store.payment_instructions,
            phone_number: store.phone_number,
            email: store.email
        });
    } catch (err) {
        console.error('Error fetching store:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Update store
const updateStore = async (req, res) => {
    try {
        const userId = req.user.id || req.user.userId;
        const { storeId } = req.params;
        const updates = req.body;

        // Don't allow username or user_id changes
        delete updates.username;
        delete updates.user_id;
        delete updates.profile_id;

        const store = await Store.findOneAndUpdate(
            { _id: storeId, user_id: userId },
            { $set: updates },
            { new: true }
        );

        if (!store) {
            return res.status(404).json({ error: 'Store not found' });
        }

        res.json({
            message: 'Store updated successfully',
            store: {
                id: store._id,
                username: store.username,
                store_name: store.store_name,
                bio: store.bio,
                avatar_url: store.avatar_url,
                category: store.category,
                published: store.published
            }
        });
    } catch (err) {
        console.error('Error updating store:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Get public store by username
const getPublicStore = async (req, res) => {
    try {
        const { username } = req.params;
        const normalizedUsername = username.toLowerCase();

        const store = await Store.findOne({ username: normalizedUsername });

        if (!store) {
            return res.status(404).json({ error: 'Store not found' });
        }

        res.json({
            id: store._id,
            username: store.username,
            store_name: store.store_name,
            bio: store.bio,
            avatar_url: store.avatar_url,
            category: store.category,
            selected_theme: store.selected_theme,
            design_config: store.design_config,
            published: store.published
        });
    } catch (err) {
        console.error('Error fetching public store:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const subscribeToStore = async (req, res) => {
    try {
        const { seller_id, email, username } = req.body;

        if (!seller_id) {
            return res.status(400).json({ error: 'Seller ID is required' });
        }

        if (!email && !username) {
            return res.status(400).json({ error: 'Email or username is required' });
        }

        let subscriberData = { seller_id };

        if (username) {
            // Verify username exists
            const profile = await Profile.findOne({ username: username.toLowerCase() });
            if (!profile) {
                return res.status(404).json({ error: 'Invalid tapx.bio username' });
            }
            subscriberData.tapx_username = username.toLowerCase();
            // Also store email if available from profile
            if (profile.email) {
                subscriberData.email = profile.email;
            }
        } else if (email) {
            subscriberData.email = email.toLowerCase();
        }

        // Use upsert to avoid duplicates
        await StoreSubscriber.findOneAndUpdate(
            subscriberData,
            subscriberData,
            { upsert: true, new: true }
        );

        // Notify the seller via email
        try {
            const seller = await User.findById(seller_id);
            if (seller && seller.email) {
                // Find store name to make email better
                const store = await Store.findOne({ user_id: seller_id });
                const storeName = store ? store.store_name : 'Your Store';
                
                await emailService.sendStoreSubscriptionNotification(
                    seller.email,
                    storeName,
                    subscriberData.email,
                    subscriberData.tapx_username
                );
            }
        } catch (emailErr) {
            console.error('Failed to send subscription notification email:', emailErr);
            // Don't fail the request if email fails
        }

        res.json({ success: true, message: 'Subscribed successfully' });
    } catch (err) {
        console.error('Error subscribing to store:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = {
    checkUsernameAvailability,
    createStore,
    getUserStores,
    getStoreById,
    updateStore,
    getPublicStore,
    subscribeToStore
};
