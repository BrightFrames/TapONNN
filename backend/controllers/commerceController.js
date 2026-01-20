const { Product } = require('../models/Product');
const Order = require('../models/Order');
const Intent = require('../models/Intent');

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

// Get public products for a user
const getPublicProducts = async (req, res) => {
    try {
        const { userId } = req.params;

        const products = await Product.find({
            user_id: userId,
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
        const { title, description, price, image_url, product_type } = req.body;

        if (!title || price === undefined) {
            return res.status(400).json({ error: 'Title and price are required' });
        }

        const newProduct = new Product({
            user_id: userId,
            title,
            description: description || '',
            price,
            image_url: image_url || '',
            product_type: product_type || 'physical_product',
            is_active: true
        });

        await newProduct.save();
        res.json(newProduct);
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

        res.json({ success: true });
    } catch (err) {
        console.error('Error deleting product:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Create an order (Intent-Aware)
const createOrder = async (req, res) => {
    try {
        const { seller_id, buyer_email, product_id, amount, type, intent_id, transaction } = req.body;
        const buyer_id = req.user ? req.user.id : null;

        if (!seller_id || !amount || !intent_id) {
            return res.status(400).json({ error: 'Seller ID, amount, and intent_id are required' });
        }

        const newOrder = new Order({
            buyer_id,
            seller_id,
            profile_id: seller_id, // Assuming profile matches seller user
            buyer_email: buyer_email || 'anonymous',
            product_id: product_id || null,
            intent_id,
            amount,
            status: 'completed', // Mock success
            type: type || 'product_sale',
            transaction: transaction || {},
            payment_method: transaction?.method || 'unknown'
        });

        await newOrder.save();

        // Update Intent
        await Intent.findByIdAndUpdate(intent_id, {
            status: 'completed',
            linked_order_id: newOrder._id,
            transaction: transaction,
            completed_at: new Date()
        });

        res.json(newOrder);
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
    createOrder,
    getOrders,
    updateOrderStatus
};
