const Enquiry = require('../models/Enquiry');
const Block = require('../models/Block');
const mongoose = require('mongoose');

// Create an enquiry (public - visitors can submit)
const createEnquiry = async (req, res) => {
    try {
        const { seller_id, block_id, visitor_email, visitor_name, visitor_phone, message, source } = req.body;

        if (!seller_id || !block_id || !visitor_email) {
            return res.status(400).json({ error: 'Seller ID, block ID, and email are required' });
        }

        // Get block details
        const block = await Block.findById(block_id);
        if (!block) {
            return res.status(404).json({ error: 'Block not found' });
        }

        // Get visitor ID if authenticated
        let visitor_id = null;
        if (req.user) {
            visitor_id = req.user.id;
        }

        // Create enquiry
        const enquiry = new Enquiry({
            seller_id,
            visitor_id,
            visitor_email,
            visitor_name: visitor_name || '',
            visitor_phone: visitor_phone || '',
            block_id,
            block_type: block.block_type,
            block_title: block.title,
            cta_type: block.cta_type,
            message: message || '',
            status: 'new',
            metadata: {
                ip: req.ip || req.connection?.remoteAddress,
                user_agent: req.get('User-Agent'),
                referrer: req.get('Referrer'),
                source: source || 'profile'
            }
        });

        await enquiry.save();

        // Increment block enquiry count
        await Block.findByIdAndUpdate(block_id, {
            $inc: { 'analytics.enquiries': 1 }
        });

        res.json({ success: true, enquiry: { id: enquiry._id, status: enquiry.status } });
    } catch (err) {
        console.error('Error creating enquiry:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Get enquiries for a seller (authenticated)
const getEnquiries = async (req, res) => {
    try {
        const userId = req.user.id;
        const { status, limit = 50, skip = 0 } = req.query;

        const filter = { seller_id: userId };
        if (status) {
            filter.status = status;
        }

        const enquiries = await Enquiry.find(filter)
            .sort({ created_at: -1 })
            .skip(parseInt(skip))
            .limit(parseInt(limit))
            .lean();

        const total = await Enquiry.countDocuments(filter);
        const unreadCount = await Enquiry.countDocuments({ seller_id: userId, status: 'new' });

        res.json({
            enquiries,
            total,
            unreadCount
        });
    } catch (err) {
        console.error('Error fetching enquiries:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Update enquiry status
const updateEnquiryStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const { enquiryId } = req.params;
        const { status, seller_response } = req.body;

        const validStatuses = ['new', 'read', 'responded', 'converted', 'closed'];
        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const updateData = {};
        if (status) updateData.status = status;
        if (seller_response) {
            updateData.seller_response = seller_response;
            updateData.responded_at = new Date();
        }

        const enquiry = await Enquiry.findOneAndUpdate(
            { _id: enquiryId, seller_id: userId },
            { $set: updateData },
            { new: true }
        );

        if (!enquiry) {
            return res.status(404).json({ error: 'Enquiry not found' });
        }

        res.json(enquiry);
    } catch (err) {
        console.error('Error updating enquiry:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Get enquiry stats
const getEnquiryStats = async (req, res) => {
    try {
        const userId = req.user.id;

        let matchStage = { seller_id: userId };
        try {
            matchStage = { seller_id: new mongoose.Types.ObjectId(userId) };
        } catch (e) {
            console.warn("Could not cast seller_id to ObjectId:", userId);
        }

        const stats = await Enquiry.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Total enquiries
        const total = stats.reduce((sum, s) => sum + s.count, 0);

        // Format stats
        const formatted = {
            total,
            new: 0,
            read: 0,
            responded: 0,
            converted: 0,
            closed: 0
        };

        stats.forEach(s => {
            formatted[s._id] = s.count;
        });

        // Get recent enquiries (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentCount = await Enquiry.countDocuments({
            seller_id: userId,
            created_at: { $gte: sevenDaysAgo }
        });

        formatted.recent = recentCount;

        res.json(formatted);
    } catch (err) {
        console.error('Error fetching enquiry stats:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Delete an enquiry
const deleteEnquiry = async (req, res) => {
    try {
        const userId = req.user.id;
        const { enquiryId } = req.params;

        const result = await Enquiry.findOneAndDelete({ _id: enquiryId, seller_id: userId });

        if (!result) {
            return res.status(404).json({ error: 'Enquiry not found' });
        }

        res.json({ success: true });
    } catch (err) {
        console.error('Error deleting enquiry:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = {
    createEnquiry,
    getEnquiries,
    updateEnquiryStatus,
    getEnquiryStats,
    deleteEnquiry
};
