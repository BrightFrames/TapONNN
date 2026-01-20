const Block = require('../models/Block');

// Get all blocks for a user
const getBlocks = async (req, res) => {
    try {
        const userId = req.user.id;

        const blocks = await Block.find({ user_id: userId })
            .sort({ position: 1 })
            .lean();

        res.json(blocks);
    } catch (err) {
        console.error('Error fetching blocks:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Get public blocks for a username (for public profile)
const getPublicBlocks = async (req, res) => {
    try {
        const { userId } = req.params;

        const blocks = await Block.find({
            user_id: userId,
            is_active: true
        })
            .sort({ position: 1 })
            .lean();

        // Track views asynchronously
        const blockIds = blocks.map(b => b._id);
        if (blockIds.length > 0) {
            Block.updateMany(
                { _id: { $in: blockIds } },
                { $inc: { 'analytics.views': 1 } }
            ).catch(err => console.error('Error tracking block views:', err));
        }

        res.json(blocks);
    } catch (err) {
        console.error('Error fetching public blocks:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Create a new block
const createBlock = async (req, res) => {
    try {
        const userId = req.user.id;
        const { block_type, title, content, cta_type, cta_label, cta_requires_login, styles, thumbnail } = req.body;

        if (!block_type || !title) {
            return res.status(400).json({ error: 'Block type and title are required' });
        }

        // Get highest position
        const lastBlock = await Block.findOne({ user_id: userId }).sort({ position: -1 });
        const position = lastBlock ? lastBlock.position + 1 : 0;

        const newBlock = new Block({
            user_id: userId,
            block_type,
            title,
            content: content || {},
            cta_type: cta_type || 'none',
            cta_label: cta_label || '',
            cta_requires_login: cta_requires_login || false,
            styles: styles || {},
            thumbnail: thumbnail || '',
            position,
            is_active: true
        });

        await newBlock.save();
        res.json(newBlock);
    } catch (err) {
        console.error('Error creating block:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Update a block
const updateBlock = async (req, res) => {
    try {
        const userId = req.user.id;
        const { blockId } = req.params;
        const updateData = req.body;

        // Remove fields that shouldn't be updated directly
        delete updateData._id;
        delete updateData.user_id;
        delete updateData.analytics;

        const block = await Block.findOneAndUpdate(
            { _id: blockId, user_id: userId },
            { $set: updateData },
            { new: true }
        );

        if (!block) {
            return res.status(404).json({ error: 'Block not found' });
        }

        res.json(block);
    } catch (err) {
        console.error('Error updating block:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Delete a block
const deleteBlock = async (req, res) => {
    try {
        const userId = req.user.id;
        const { blockId } = req.params;

        const result = await Block.findOneAndDelete({ _id: blockId, user_id: userId });

        if (!result) {
            return res.status(404).json({ error: 'Block not found' });
        }

        res.json({ success: true });
    } catch (err) {
        console.error('Error deleting block:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Reorder blocks
const reorderBlocks = async (req, res) => {
    try {
        const userId = req.user.id;
        const { blockIds } = req.body; // Array of block IDs in new order

        if (!Array.isArray(blockIds)) {
            return res.status(400).json({ error: 'blockIds must be an array' });
        }

        // Update positions in bulk
        const bulkOps = blockIds.map((id, index) => ({
            updateOne: {
                filter: { _id: id, user_id: userId },
                update: { $set: { position: index } }
            }
        }));

        await Block.bulkWrite(bulkOps);

        res.json({ success: true });
    } catch (err) {
        console.error('Error reordering blocks:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Track block click/view
const trackBlockInteraction = async (req, res) => {
    try {
        const { blockId } = req.params;
        const { type } = req.body; // 'view' or 'click'

        const updateField = type === 'click' ? 'analytics.clicks' : 'analytics.views';

        await Block.findByIdAndUpdate(blockId, {
            $inc: { [updateField]: 1 }
        });

        res.json({ success: true });
    } catch (err) {
        console.error('Error tracking block interaction:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Get block library (predefined templates)
const getBlockLibrary = async (req, res) => {
    try {
        const library = {
            content: [
                { type: 'link', name: 'Link', description: 'Add a clickable link', icon: 'link', cta_default: 'visit' },
                { type: 'text', name: 'Text', description: 'Add text content', icon: 'type', cta_default: 'none' },
                { type: 'header', name: 'Header', description: 'Section header', icon: 'heading', cta_default: 'none' },
                { type: 'image', name: 'Image', description: 'Display an image', icon: 'image', cta_default: 'none' },
                { type: 'video', name: 'Video', description: 'Embed a video', icon: 'video', cta_default: 'none' },
                { type: 'divider', name: 'Divider', description: 'Visual separator', icon: 'minus', cta_default: 'none' }
            ],
            commerce: [
                { type: 'product', name: 'Product', description: 'Showcase a product', icon: 'shopping-bag', cta_default: 'buy_now' },
                { type: 'service', name: 'Service', description: 'List a service', icon: 'briefcase', cta_default: 'enquire' },
                { type: 'pricing', name: 'Pricing Table', description: 'Show pricing options', icon: 'dollar-sign', cta_default: 'enquire' },
                { type: 'donation', name: 'Donation', description: 'Accept tips/donations', icon: 'heart', cta_default: 'donate' }
            ],
            contact: [
                { type: 'contact_card', name: 'Contact Card', description: 'Phone, email, address', icon: 'user', cta_default: 'contact' },
                { type: 'form', name: 'Enquiry Form', description: 'Custom contact form', icon: 'file-text', cta_default: 'enquire' },
                { type: 'booking', name: 'Booking', description: 'Schedule appointments', icon: 'calendar', cta_default: 'book' },
                { type: 'whatsapp', name: 'WhatsApp', description: 'Direct chat link', icon: 'message-circle', cta_default: 'contact' }
            ],
            social: [
                { type: 'social_icons', name: 'Social Icons', description: 'Social media links', icon: 'share-2', cta_default: 'visit' },
                { type: 'instagram', name: 'Instagram Feed', description: 'Show IG posts', icon: 'instagram', cta_default: 'visit' },
                { type: 'music', name: 'Music', description: 'Spotify/SoundCloud embed', icon: 'music', cta_default: 'none' },
                { type: 'youtube', name: 'YouTube', description: 'YouTube embed', icon: 'youtube', cta_default: 'none' }
            ],
            utility: [
                { type: 'button', name: 'Button', description: 'Custom action button', icon: 'square', cta_default: 'custom' },
                { type: 'countdown', name: 'Countdown', description: 'Timer to an event', icon: 'clock', cta_default: 'none' },
                { type: 'map', name: 'Map', description: 'Location embed', icon: 'map-pin', cta_default: 'none' },
                { type: 'pdf', name: 'PDF', description: 'Document viewer', icon: 'file', cta_default: 'download' }
            ]
        };

        res.json(library);
    } catch (err) {
        console.error('Error fetching block library:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = {
    getBlocks,
    getPublicBlocks,
    createBlock,
    updateBlock,
    deleteBlock,
    reorderBlocks,
    trackBlockInteraction,
    getBlockLibrary
};
