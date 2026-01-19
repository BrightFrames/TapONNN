const { Product, Order } = require('../models/Product');

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
        const { title, description, price, image_url } = req.body;

        if (!title || price === undefined) {
            return res.status(400).json({ error: 'Title and price are required' });
        }

        const newProduct = new Product({
            user_id: userId,
            title,
            description: description || '',
            price,
            image_url: image_url || '',
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

// Create an order
const createOrder = async (req, res) => {
    try {
        const { seller_id, buyer_email, product_id, amount, type } = req.body;

        if (!seller_id || !amount) {
            return res.status(400).json({ error: 'Seller ID and amount are required' });
        }

        const newOrder = new Order({
            seller_id,
            buyer_email: buyer_email || 'anonymous',
            product_id: product_id || null,
            amount,
            status: 'completed',
            type: type || 'product_sale'
        });

        await newOrder.save();
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

module.exports = {
    getProducts,
    getPublicProducts,
    createProduct,
    deleteProduct,
    createOrder,
    getOrders
};
