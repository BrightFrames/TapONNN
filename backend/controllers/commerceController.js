const pool = require('../config/db');

// CREATE Product (Authenticated)
const createProduct = async (req, res) => {
    const userId = req.user.id;
    const { title, price, description, type, image_url, file_url, is_active } = req.body;

    if (!title || price === undefined) {
        return res.status(400).json({ error: "Title and Price are required" });
    }

    try {
        const result = await pool.query(
            'INSERT INTO products (user_id, title, description, price, type, image_url, file_url, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [userId, title, description || '', price, type || 'physical', image_url || null, file_url || null, is_active !== false]
        );
        res.json({ success: true, product: result.rows[0] });
    } catch (err) {
        console.error("Error creating product:", err);
        res.status(500).json({ error: err.message });
    }
};

// GET My Products (Authenticated)
const getProducts = async (req, res) => {
    const userId = req.user.id;
    try {
        const result = await pool.query(
            'SELECT * FROM products WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching products:", err);
        res.status(500).json({ error: err.message });
    }
};

// DELETE Product (Authenticated)
const deleteProduct = async (req, res) => {
    const userId = req.user.id;
    const { productId } = req.params;

    try {
        const result = await pool.query(
            'DELETE FROM products WHERE id = $1 AND user_id = $2 RETURNING id',
            [productId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found or access denied' });
        }
        res.json({ success: true, deletedId: productId });
    } catch (err) {
        console.error("Error deleting product:", err);
        res.status(500).json({ error: err.message });
    }
};

// GET Public Products (Public Shop)
const getPublicProducts = async (req, res) => {
    const { username } = req.params;

    try {
        // First get user_id from username
        const userRes = await pool.query('SELECT id FROM profiles WHERE username = $1', [username]);
        if (userRes.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        const userId = userRes.rows[0].id;

        // Get active products
        const result = await pool.query(
            'SELECT * FROM products WHERE user_id = $1 AND is_active = true ORDER BY created_at DESC',
            [userId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching shop:", err);
        res.status(500).json({ error: err.message });
    }
};

// CREATE Order (Checkout/Donation) - Public or Auth
const createOrder = async (req, res) => {
    const { seller_id, buyer_email, product_id, amount, type } = req.body;

    // Basic validation
    if (!seller_id || !amount) {
        return res.status(400).json({ error: "Missing required order fields" });
    }

    try {
        const result = await pool.query(
            'INSERT INTO orders (seller_id, buyer_email, product_id, amount, status, type) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [seller_id, buyer_email || 'anonymous', product_id || null, amount, 'completed', type || 'product_sale']
        );
        res.json({ success: true, order: result.rows[0] });
    } catch (err) {
        console.error("Error creating order:", err);
        res.status(500).json({ error: err.message });
    }
};

// GET My Orders (Authenticated - for Earnings)
const getOrders = async (req, res) => {
    const userId = req.user.id;

    try {
        const result = await pool.query(
            'SELECT * FROM orders WHERE seller_id = $1 ORDER BY created_at DESC',
            [userId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching orders:", err);
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    createProduct,
    getProducts,
    deleteProduct,
    getPublicProducts,
    createOrder,
    getOrders
};
