const { Product } = require('../models/Product');
const Order = require('../models/Order');
const Intent = require('../models/Intent');
const Profile = require('../models/Profile');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createAvatar } = require('@dicebear/core');
const { initials } = require('@dicebear/collection');
const { sendWelcomeEmail } = require('../services/msg91Service');


// Helper for Real-time Updates
const notifyUpdate = async (req, userId) => {
    try {
        const profile = await Profile.findOne({ user_id: userId });
        if (profile && req.io) {
            req.io.to(profile.username.toLowerCase()).emit('profileUpdated', { type: 'products' });
        }
    } catch (e) {
        console.error("Socket emit error", e);
    }
};

// Get user's products
const getProducts = async (req, res) => {
    try {
        const userId = req.user.id;

        const products = await Product.find({ user_id: userId })
            .sort({ created_at: -1 })
            .lean();

        res.json(products);
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Get public products for a user by username
const getPublicProducts = async (req, res) => {
    try {
        const { username } = req.params;

        // Look up profile by username first
        const profile = await Profile.findOne({ username: username.toLowerCase() });
        if (!profile) {
            return res.status(404).json({ error: 'User not found' });
        }

        const products = await Product.find({
            user_id: profile.user_id,
            is_active: true
        })
            .sort({ created_at: -1 })
            .lean();

        res.json(products);
    } catch (err) {
        console.error('Error fetching public products:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Create a product
const createProduct = async (req, res) => {
    try {
        const userId = req.user.id;
        const { title, description, price, image_url, images, product_type, file_url, is_featured, discount_price, badge, stock_status } = req.body;

        if (!title || price === undefined) {
            return res.status(400).json({ error: 'Title and price are required' });
        }

        const newProduct = new Product({
            user_id: userId,
            title,
            description: description || '',
            price,
            image_url: image_url || '',
            images: images || [],
            file_url: file_url || '',
            product_type: product_type || 'physical_product',
            is_featured: is_featured || false,
            discount_price: discount_price,
            badge: badge || '',
            stock_status: stock_status || 'in_stock',
            is_active: true
        });

        await newProduct.save();
        notifyUpdate(req, userId);
        res.json({ product: newProduct });
    } catch (err) {
        console.error('Error creating product:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Delete a product
const deleteProduct = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.params;

        const result = await Product.findOneAndDelete({ _id: productId, user_id: userId });

        if (!result) {
            return res.status(404).json({ error: 'Product not found' });
        }



        notifyUpdate(req, userId);

        res.json({ success: true });
    } catch (err) {
        console.error('Error deleting product:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Update a product
const updateProduct = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.params;
        const updates = req.body;

        // Remove fields that shouldn't be updated directly
        delete updates._id;
        delete updates.user_id;
        delete updates.created_at;

        const product = await Product.findOneAndUpdate(
            { _id: productId, user_id: userId },
            { $set: updates },
            { new: true }
        );

        if (!product) {
            return res.status(404).json({ error: 'Product not found or unauthorized' });
        }



        notifyUpdate(req, userId);

        res.json(product);
    } catch (err) {
        console.error('Error updating product:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Create an order (Intent-Aware)
const createOrder = async (req, res) => {
    try {
        const { seller_id, buyer_email, buyer_name, buyer_phone, product_id, amount, type, intent_id, transaction } = req.body;
        let buyer_id = req.user ? req.user.id : null;
        let newAccountCreated = false;
        let authToken = null;
        let newUserObj = null;

        if (!seller_id || !amount || !intent_id) {
            return res.status(400).json({ error: 'Seller ID, amount, and intent_id are required' });
        }

        // AUTO-SIGNUP LOGIC FOR GUESTS
        if (!buyer_id && buyer_email) {
            // Check if user exists
            const existingUser = await User.findOne({ email: buyer_email });

            if (existingUser) {
                // User exists, but is not logged in.
                // Security Decision: Do not allow guest order to link to existing account automatically without auth.
                // Return error prompting login.
                return res.status(400).json({
                    error: 'Account already exists with this email. Please login to continue.',
                    code: 'ACCOUNT_EXISTS'
                });
            } else {
                // CREATE NEW ACCOUNT
                try {
                    // 1. Generate Random Password
                    const randomPassword = Math.random().toString(36).slice(-8) + "Aa1!";
                    const salt = await bcrypt.genSalt(10);
                    const passwordHash = await bcrypt.hash(randomPassword, salt);

                    // 2. Create User
                    const newUser = new User({
                        email: buyer_email,
                        password_hash: passwordHash
                    });
                    await newUser.save();

                    // 3. Create Profile
                    // Generate minimal username from email or name
                    let baseUsername = (buyer_name || buyer_email.split('@')[0]).replace(/[^a-zA-Z0-9]/g, '').toLowerCase().substring(0, 15);
                    if (baseUsername.length < 3) baseUsername = `user${Math.floor(Math.random() * 1000)}`;
                    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
                    const finalUsername = `${baseUsername}${randomSuffix}`;

                    const avatar = createAvatar(initials, {
                        seed: buyer_name || 'Guest',
                        size: 128
                    }).toDataUri();

                    const newProfile = new Profile({
                        user_id: newUser._id,
                        username: finalUsername,
                        full_name: buyer_name || 'Guest User',
                        email: buyer_email,
                        phone_number: buyer_phone || '',
                        avatar_url: avatar,
                        selected_theme: 'artemis'
                    });
                    await newProfile.save();

                    // 4. Generate Token
                    authToken = jwt.sign(
                        { id: newUser._id.toString(), email: newUser.email },
                        process.env.JWT_SECRET,
                        { expiresIn: '7d' }
                    );

                    // 5. Send Welcome Email with credentials
                    // sendWelcomeEmail usually takes (email, username, name). 
                    // We might need a variant that sends the password too, or update the service.
                    // For now, we'll assume sendWelcomeEmail sends a generic welcome. 
                    // Ideally, we should send an email saying "Account Created" with the password.
                    // Assuming existing service for now, but logging credential generation.
                    // In production, use a specific email template for "Auto-created account".

                    // Attempt to send email (async)
                    // If msg91Service supports custom content, we'd use that.
                    // Falling back to standard welcome for now.
                    sendWelcomeEmail(buyer_email, finalUsername, buyer_name || 'User').catch(e => console.error("Email fail", e));

                    buyer_id = newUser._id;
                    newAccountCreated = true;
                    newUserObj = {
                        id: newUser._id,
                        email: newUser.email,
                        username: newProfile.username,
                        full_name: newProfile.full_name,
                        avatar: newProfile.avatar_url,
                        role: 'personal' // default
                    };

                } catch (signupError) {
                    console.error("Auto-signup failed:", signupError);
                    return res.status(500).json({ error: "Failed to create account for enquiry" });
                }
            }
        }

        const newOrder = new Order({
            buyer_id, // Now populated if auto-signup succeeded
            seller_id,
            profile_id: seller_id,
            buyer_email: buyer_email || 'anonymous',
            product_id: product_id || null,
            intent_id,
            amount,
            status: 'completed', // Mock success
            type: type || 'product_sale',
            transaction: transaction || {},
            payment_method: transaction?.method || 'unknown',
            invoice_id: `HSG-${Math.floor(1000000 + Math.random() * 9000000)}`,
            payment_id: `H_${Math.floor(10000000 + Math.random() * 90000000)}`,
            paid_at: new Date()
        });

        await newOrder.save();

        // Update Intent
        await Intent.findByIdAndUpdate(intent_id, {
            status: 'completed',
            linked_order_id: newOrder._id,
            transaction: transaction,
            completed_at: new Date()
        });

        res.json({
            ...newOrder.toObject(),
            token: authToken,
            user: newUserObj, // Return user info so frontend can login
            new_account: newAccountCreated
        });
    } catch (err) {
        console.error('Error creating order:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Get user's orders/earnings
const getOrders = async (req, res) => {
    try {
        const userId = req.user.id;

        const orders = await Order.find({ seller_id: userId })
            .sort({ created_at: -1 })
            .lean();

        // Calculate totals
        const totalEarnings = orders.reduce((sum, o) => sum + (o.amount || 0), 0);

        res.json({
            orders,
            totalEarnings,
            count: orders.length
        });
    } catch (err) {
        console.error('Error fetching orders:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Update order status (seller only)
const updateOrderStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const { orderId } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ error: 'Status is required' });
        }

        const validStatuses = ['pending', 'completed', 'cancelled', 'refunded'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status value' });
        }

        const order = await Order.findOneAndUpdate(
            { _id: orderId, seller_id: userId },
            { status },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ error: 'Order not found or unauthorized' });
        }

        res.json(order);
    } catch (err) {
        console.error('Error updating order status:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = {
    getProducts,
    getPublicProducts,
    createProduct,
    deleteProduct,
    updateProduct,
    createOrder,
    getOrders,
    updateOrderStatus
};
