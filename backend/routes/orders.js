const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
    getSellerOrders,
    getOrderById,
    updateOrderStatus,
    createOrder,
    getOrderStats
} = require('../controllers/ordersController');

// Get all orders for authenticated seller
router.get('/', auth, getSellerOrders);

// Get order statistics
router.get('/stats', auth, getOrderStats);

// Get single order by ID
router.get('/:orderId', auth, getOrderById);

// Update order status
router.patch('/:orderId/status', auth, updateOrderStatus);

// Create new order (used by commerce flow)
router.post('/', createOrder);

module.exports = router;
