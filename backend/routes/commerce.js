const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const commerceController = require('../controllers/commerceController');

// --- Products ---
// POST /api/products (Authenticated)
router.post('/products', authMiddleware, commerceController.createProduct);

// GET /api/products (Authenticated)
router.get('/products', authMiddleware, commerceController.getProducts);

// DELETE /api/products/:productId (Authenticated)
router.delete('/products/:productId', authMiddleware, commerceController.deleteProduct);

// PUT /api/products/:productId (Authenticated)
router.put('/products/:productId', authMiddleware, commerceController.updateProduct);

// GET /api/public/products/:username (Public)
router.get('/public/products/:username', commerceController.getPublicProducts);

// --- Orders ---
// POST /api/orders (Public or Auth)
router.post('/orders', commerceController.createOrder);

// GET /api/orders (Authenticated)
router.get('/orders', authMiddleware, commerceController.getOrders);

// PUT /api/orders/:orderId/status (Authenticated - Seller only)
router.put('/orders/:orderId/status', authMiddleware, commerceController.updateOrderStatus);

module.exports = router;
