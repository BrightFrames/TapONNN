const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const mongoose = require('mongoose');
const { sendOrderNotificationEmail } = require('../services/emailService');

// Get all orders for the authenticated seller
const getSellerOrders = async (req, res) => {
    try {
        const sellerId = mongoose.Types.ObjectId(req.user.id);

        const { status, limit = 50, skip = 0 } = req.query;

        const filter = { seller_id: sellerId };
        if (status && status !== 'all') {
            filter.status = status;
        }

        const orders = await Order.find(filter)
            .populate('product_id', 'title image_url')
            .populate('buyer_id', 'name email')
            .sort({ created_at: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(skip));

        // Format orders for frontend
        const formattedOrders = orders.map(order => ({
            _id: order._id,
            payment_id: order.payment_id,
            invoice_id: order.invoice_id,
            product_name: order.product_name || order.product_id?.title,
            buyer_name: order.customer_details?.name || order.buyer_id?.name || 'Guest',
            buyer_email: order.buyer_id?.email || order.guest_email,
            paid_at: order.paid_at,
            created_at: order.created_at,
            amount: order.amount,
            status: order.status,
            currency: order.currency,
            payment_method: order.payment_method,
            customer_details: order.customer_details,
            delivery_status: order.delivery_status,
            product_type: order.product_type
        }));

        res.json({
            success: true,
            orders: formattedOrders,
            total: orders.length
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch orders',
            error: error.message
        });
    }
};

// Get single order details
const getOrderById = async (req, res) => {
    try {
        const sellerId = mongoose.Types.ObjectId(req.user.id);
        const { orderId } = req.params;

        const order = await Order.findOne({ _id: orderId, seller_id: sellerId })
            .populate('product_id', 'title image_url description price')
            .populate('buyer_id', 'name email phone');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.json({
            success: true,
            order: {
                _id: order._id,
                payment_id: order.payment_id,
                invoice_id: order.invoice_id,
                transaction_id: order.transaction_id,
                product: order.product_id,
                product_name: order.product_name,
                product_type: order.product_type,
                buyer: order.buyer_id,
                buyer_email: order.guest_email || order.buyer_id?.email,
                customer_details: order.customer_details,
                amount: order.amount,
                currency: order.currency,
                status: order.status,
                payment_method: order.payment_method,
                delivery_status: order.delivery_status,
                paid_at: order.paid_at,
                created_at: order.created_at,
                updated_at: order.updated_at
            }
        });
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch order details',
            error: error.message
        });
    }
};

// Update order status
const updateOrderStatus = async (req, res) => {
    try {
        const sellerId = mongoose.Types.ObjectId(req.user.id);
        const { orderId } = req.params;
        const { status, delivery_status } = req.body;

        const order = await Order.findOne({ _id: orderId, seller_id: sellerId });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Update status
        if (status) {
            order.status = status;
        }
        if (delivery_status) {
            order.delivery_status = delivery_status;
        }

        await order.save();

        res.json({
            success: true,
            message: 'Order updated successfully',
            order: {
                _id: order._id,
                status: order.status,
                delivery_status: order.delivery_status
            }
        });
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update order',
            error: error.message
        });
    }
};

// Create new order (called from commerce flow)
const createOrder = async (req, res) => {
    try {
        const {
            product_id,
            seller_id,
            profile_id,
            intent_id,
            amount,
            buyer_id,
            guest_email,
            customer_details,
            payment_method
        } = req.body;

        // Get product details
        const product = await Product.findById(product_id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Get seller details for email
        const seller = await User.findById(seller_id);

        // Generate unique IDs
        const payment_id = `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        const invoice_id = `INV-${new Date().getFullYear()}-${String(await Order.countDocuments() + 1).padStart(6, '0')}`;

        // Create order
        const order = new Order({
            buyer_id: buyer_id || null,
            guest_email,
            seller_id,
            profile_id,
            product_id,
            product_name: product.title,
            product_type: product.product_type || 'digital',
            intent_id,
            amount,
            payment_id,
            invoice_id,
            payment_method,
            customer_details,
            status: 'pending',
            delivery_status: 'pending'
        });

        await order.save();

        // Send email notification to seller
        if (seller && seller.email) {
            try {
                await sendOrderNotificationEmail(
                    seller.email,
                    seller.name,
                    {
                        orderId: order._id,
                        payment_id,
                        invoice_id,
                        product_name: product.title,
                        amount,
                        currency: order.currency,
                        buyer_name: customer_details?.name || 'Guest Customer',
                        buyer_email: guest_email || buyer_id?.email || 'N/A'
                    }
                );
            } catch (emailError) {
                console.error('Failed to send order notification email:', emailError);
                // Don't fail the order creation if email fails
            }
        }

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            order: {
                _id: order._id,
                payment_id: order.payment_id,
                invoice_id: order.invoice_id,
                status: order.status
            }
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create order',
            error: error.message
        });
    }
};

// Get order statistics
const getOrderStats = async (req, res) => {
    try {
        const sellerId = mongoose.Types.ObjectId(req.user.id);

        const stats = await Order.aggregate([
            { $match: { seller_id: sellerId } },
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    totalRevenue: { $sum: '$amount' },
                    paidOrders: {
                        $sum: { $cond: [{ $eq: ['$status', 'paid'] }, 1, 0] }
                    },
                    pendingOrders: {
                        $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
                    },
                    completedOrders: {
                        $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                    }
                }
            }
        ]);

        const result = stats[0] || {
            totalOrders: 0,
            totalRevenue: 0,
            paidOrders: 0,
            pendingOrders: 0,
            completedOrders: 0
        };

        res.json({
            success: true,
            stats: result
        });
    } catch (error) {
        console.error('Error fetching order stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch order statistics',
            error: error.message
        });
    }
};

module.exports = {
    getSellerOrders,
    getOrderById,
    updateOrderStatus,
    createOrder,
    getOrderStats
};
