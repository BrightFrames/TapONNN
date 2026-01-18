const { SubscriptionOrder, UserSubscription } = require('../models/Subscription');
const Profile = require('../models/Profile');

// Create a new subscription order (initiates payment)
const createOrder = async (req, res) => {
    try {
        const userId = req.user.id;
        const { planId, planName, amount } = req.body;

        if (!planId || !planName || !amount) {
            return res.status(400).json({ error: 'Plan details required' });
        }

        // Generate unique order ID
        const orderId = `TAP2_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Create order in database
        const newOrder = new SubscriptionOrder({
            order_id: orderId,
            user_id: userId,
            plan_id: planId,
            plan_name: planName,
            amount,
            status: 'pending'
        });

        await newOrder.save();

        res.json({
            success: true,
            order: {
                id: orderId,
                planName: newOrder.plan_name,
                amount: newOrder.amount,
                status: newOrder.status,
                qrCodeUrl: process.env.ZEROGATEWAY_QR_BASE_URL
                    ? `${process.env.ZEROGATEWAY_QR_BASE_URL}?orderId=${orderId}&amount=${amount}`
                    : null,
                upiId: process.env.ZEROGATEWAY_UPI_ID || 'TO_BE_CONFIGURED',
                expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 min expiry
            }
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
};

// Zero Gateway Webhook - receives payment confirmation
const handleWebhook = async (req, res) => {
    try {
        const { orderId, status, transactionId, amount } = req.body;

        if (!orderId) {
            return res.status(400).json({ error: 'Order ID required' });
        }

        // Update order status
        const order = await SubscriptionOrder.findOneAndUpdate(
            { order_id: orderId },
            {
                status: status === 'success' ? 'paid' : 'failed',
                transaction_id: transactionId,
                updated_at: new Date()
            },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // If payment successful, activate subscription
        if (status === 'success') {
            const planDuration = getPlanDuration(order.plan_id);
            const expiresAt = new Date(Date.now() + planDuration);

            await UserSubscription.findOneAndUpdate(
                { user_id: order.user_id },
                {
                    plan_id: order.plan_id,
                    plan_name: order.plan_name,
                    starts_at: new Date(),
                    expires_at: expiresAt,
                    status: 'active',
                    order_id: orderId,
                    updated_at: new Date()
                },
                { upsert: true, new: true }
            );

            // Send subscription email
            try {
                const profile = await Profile.findOne({ user_id: order.user_id });
                if (profile) {
                    const { sendSubscriptionEmail } = require('../services/msg91Service');
                    await sendSubscriptionEmail(
                        profile.email,
                        profile.full_name,
                        order.plan_name,
                        order.amount,
                        expiresAt
                    );
                }
            } catch (emailErr) {
                console.error('Failed to send subscription email:', emailErr);
            }

            console.log(`Subscription activated for user ${order.user_id}: ${order.plan_name}`);
        }

        res.json({ success: true, message: 'Webhook processed' });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
};

// Get plan duration in milliseconds
const getPlanDuration = (planId) => {
    const durations = {
        'free': 0,
        'personal': 365 * 24 * 60 * 60 * 1000,
        'creator': 365 * 24 * 60 * 60 * 1000,
        'professional': 365 * 24 * 60 * 60 * 1000,
        'starter': 365 * 24 * 60 * 60 * 1000,
        'business': 365 * 24 * 60 * 60 * 1000,
        'enterprise': 365 * 24 * 60 * 60 * 1000,
    };
    return durations[planId] || 365 * 24 * 60 * 60 * 1000;
};

// Get user's current subscription
const getSubscription = async (req, res) => {
    try {
        const userId = req.user.id;

        const subscription = await UserSubscription.findOne({
            user_id: userId,
            status: 'active',
            $or: [
                { expires_at: null },
                { expires_at: { $gt: new Date() } }
            ]
        });

        if (!subscription) {
            return res.json({
                subscription: null,
                plan: 'free',
                message: 'No active subscription'
            });
        }

        res.json({ subscription });
    } catch (error) {
        console.error('Error fetching subscription:', error);
        res.status(500).json({ error: 'Failed to fetch subscription' });
    }
};

// Check order status (for polling from frontend)
const checkOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user.id;

        const order = await SubscriptionOrder.findOne({ order_id: orderId, user_id: userId });

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json({
            status: order.status,
            isPaid: order.status === 'paid'
        });
    } catch (error) {
        console.error('Error checking order:', error);
        res.status(500).json({ error: 'Failed to check order status' });
    }
};

module.exports = {
    createOrder,
    handleWebhook,
    getSubscription,
    checkOrderStatus
};
