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

// GET /api/public/products/:username (Public)
router.get('/public/products/:username', commerceController.getPublicProducts);

// --- Orders ---
// POST /api/orders (Public or Auth)
router.post('/orders', commerceController.createOrder);

// GET /api/orders (Authenticated)
router.get('/orders', authMiddleware, commerceController.getOrders);

module.exports = router;
