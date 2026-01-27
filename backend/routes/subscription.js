const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const authMiddleware = require('../middleware/auth');

// Create new subscription order (requires auth)
router.post('/orders', authMiddleware, subscriptionController.createOrder);

// Get user's current subscription (requires auth)
router.get('/subscription', authMiddleware, subscriptionController.getSubscription);

// Check order status (requires auth)
router.get('/orders/:orderId/status', authMiddleware, subscriptionController.checkOrderStatus);

// Enable Store Mode (Free Upgrade)
router.post('/store-upgrade', authMiddleware, subscriptionController.enableStoreMode);

// Zero Gateway Webhook (public endpoint - no auth, but verified by signature)
router.post('/webhook/zerogateway', subscriptionController.handleWebhook);

module.exports = router;
