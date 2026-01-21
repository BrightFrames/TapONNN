const Intent = require('../models/Intent');
const Block = require('../models/Block');
const Enquiry = require('../models/Enquiry');

/**
 * Intent Controller
 * 
 * Handles the core intent recording flow:
 * 1. CTA click → Intent recorded IMMEDIATELY
 * 2. Login gated ONLY when continuation required
 * 3. Action completed → Link to enquiry/order
 */

// Create intent (PUBLIC - no auth required)
// This is called when ANY CTA is clicked
const createIntent = async (req, res) => {
    try {
        const {
            profile_id,
            store_id,
            block_id,
            visitor_fingerprint,
            session_id
        } = req.body;

        if (!profile_id || !block_id) {
            return res.status(400).json({ error: 'profile_id and block_id are required' });
        }

        // Get block details
        const block = await Block.findById(block_id);
        if (!block) {
            return res.status(404).json({ error: 'Block not found' });
        }

        // Determine actor type
        const isLoggedIn = !!req.user;
        const actor_type = isLoggedIn ? 'user' : 'visitor';
        const actor_id = isLoggedIn ? req.user.id : null;

        // Map CTA type to flow type
        const flowTypeMap = {
            'buy_now': 'buy',
            'enquire': 'enquiry',
            'contact': 'enquiry',
            'book': 'enquiry',
            'donate': 'buy',
            'download': 'redirect',
            'visit': 'redirect',
            'custom': 'redirect',
            'none': 'redirect'
        };

        const flow_type = flowTypeMap[block.cta_type] || 'redirect';

        // Create intent IMMEDIATELY (before any login gating)
        const intent = new Intent({
            actor_type,
            actor_id,
            visitor_fingerprint: visitor_fingerprint || null,
            session_id: session_id || null,
            profile_id,
            store_id: store_id || null,
            block_id,
            block_type: block.block_type,
            block_title: block.title,
            cta_type: block.cta_type,
            cta_label: block.cta_label,
            flow_type,
            status: 'created',
            login_required: block.cta_requires_login,
            metadata: {
                ip: req.ip || req.connection?.remoteAddress,
                user_agent: req.get('User-Agent'),
                referrer: req.get('Referrer'),
                device: req.get('User-Agent')?.includes('Mobile') ? 'mobile' : 'desktop',
                source: req.body.source || 'profile'
            }
        });

        await intent.save();

        // Increment block click analytics
        await Block.findByIdAndUpdate(block_id, {
            $inc: { 'analytics.clicks': 1 }
        });

        // Determine if login is required for continuation
        const requiresLogin = block.cta_requires_login && !isLoggedIn;

        if (requiresLogin) {
            await Intent.findByIdAndUpdate(intent._id, { status: 'login_required' });
        }

        res.json({
            success: true,
            intent_id: intent._id,
            flow_type,
            requires_login: requiresLogin,
            cta_type: block.cta_type,
            // Return content needed for next step
            block_content: block.content
        });
        console.log('Creating intent for block:', block);
        // ... (rest of function)
    } catch (err) {
        console.error('Error creating intent:', err);
        console.error('Error stack:', err.stack);
        res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
};

// Update intent after login (for resuming flow)
const resumeAfterLogin = async (req, res) => {
    try {
        const { intentId } = req.params;
        const userId = req.user.id;

        const intent = await Intent.findById(intentId);
        if (!intent) {
            return res.status(404).json({ error: 'Intent not found' });
        }

        // Update intent with logged-in user info
        intent.actor_type = 'user';
        intent.actor_id = userId;
        intent.status = 'login_completed';
        intent.login_completed_at = new Date();
        await intent.save();

        // Get block for next step
        const block = await Block.findById(intent.block_id);

        res.json({
            success: true,
            intent_id: intent._id,
            flow_type: intent.flow_type,
            cta_type: intent.cta_type,
            block_content: block?.content || {}
        });
    } catch (err) {
        console.error('Error resuming intent:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Complete intent (after action is done)
const completeIntent = async (req, res) => {
    try {
        const { intentId } = req.params;
        const { linked_enquiry_id, linked_order_id, linked_plugin_install_id, transaction } = req.body;

        const intent = await Intent.findById(intentId);
        if (!intent) {
            return res.status(404).json({ error: 'Intent not found' });
        }

        // Update intent with completion data
        intent.status = 'completed';
        intent.completed_at = new Date();

        if (linked_enquiry_id) intent.linked_enquiry_id = linked_enquiry_id;
        if (linked_order_id) intent.linked_order_id = linked_order_id;
        if (linked_plugin_install_id) intent.linked_plugin_install_id = linked_plugin_install_id;
        if (transaction) intent.transaction = transaction;

        await intent.save();

        // Increment block conversion analytics
        await Block.findByIdAndUpdate(intent.block_id, {
            $inc: { 'analytics.conversions': 1 }
        });

        res.json({ success: true, intent_id: intent._id });
    } catch (err) {
        console.error('Error completing intent:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Fail intent
const failIntent = async (req, res) => {
    try {
        const { intentId } = req.params;
        const { reason, transaction } = req.body;

        await Intent.findByIdAndUpdate(intentId, {
            status: 'failed',
            'metadata.failure_reason': reason,
            transaction
        });

        res.json({ success: true });
    } catch (err) {
        console.error('Error failing intent:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Get intents for super user (dashboard only - never public)
const getProfileIntents = async (req, res) => {
    try {
        const userId = req.user.id;
        const { profile_id, flow_type, status, limit = 50, skip = 0 } = req.query;

        // Verify user owns this profile
        const Profile = require('../models/Profile');
        const profile = await Profile.findOne({ _id: profile_id, user_id: userId });
        if (!profile) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const filter = { profile_id };
        if (flow_type) filter.flow_type = flow_type;
        if (status) filter.status = status;

        const intents = await Intent.find(filter)
            .sort({ created_at: -1 })
            .skip(parseInt(skip))
            .limit(parseInt(limit))
            .lean();

        const total = await Intent.countDocuments(filter);

        res.json({ intents, total });
    } catch (err) {
        console.error('Error fetching intents:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Get intent stats for super user dashboard
const getIntentStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const { profile_id } = req.query;

        // Verify user owns this profile
        const Profile = require('../models/Profile');
        const profile = await Profile.findOne({ _id: profile_id, user_id: userId });
        if (!profile) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const stats = await Intent.aggregate([
            { $match: { profile_id: profile._id } },
            {
                $group: {
                    _id: '$flow_type',
                    total: { $sum: 1 },
                    completed: {
                        $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                    }
                }
            }
        ]);

        // Today's intents
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayCount = await Intent.countDocuments({
            profile_id: profile._id,
            created_at: { $gte: today }
        });

        // This week's intents
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weekCount = await Intent.countDocuments({
            profile_id: profile._id,
            created_at: { $gte: weekAgo }
        });

        res.json({
            by_flow: stats,
            today: todayCount,
            this_week: weekCount
        });
    } catch (err) {
        console.error('Error fetching intent stats:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = {
    createIntent,
    resumeAfterLogin,
    completeIntent,
    failIntent,
    getProfileIntents,
    getIntentStats
};
