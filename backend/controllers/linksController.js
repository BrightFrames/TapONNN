const Link = require('../models/Link');
const Profile = require('../models/Profile');

// Get user's links
const notifyUpdate = async (req, userId) => {
    console.error(`[SocketDebug] notifyUpdate called for userId: ${userId}`);
    try {
        const profile = await Profile.findOne({ user_id: userId });
        if (!profile) {
            console.error('[SocketDebug] Profile not found for userId:', userId);
            return;
        }

        const roomName = profile.username.toLowerCase();
        console.error(`[SocketDebug] Emitting 'profileUpdated' to room: '${roomName}'`);

        if (req.io) {
            req.io.to(roomName).emit('profileUpdated', { type: 'links' });
            console.error('[SocketDebug] Emit successful');
        } else {
            console.error('[SocketDebug] req.io is UNDEFINED');
        }
    } catch (e) {
        console.error("[SocketDebug] Socket emit error", e);
    }
};

const getMyLinks = async (req, res) => {
    try {
        const userId = req.user.id;

        const links = await Link.find({ user_id: userId })
            .sort({ position: 1 })
            .lean();

        // Format for frontend
        const formattedLinks = links.map(l => ({
            id: l._id,
            title: l.title,
            url: l.url,
            isActive: l.is_active,
            clicks: l.clicks,
            position: l.position,
            thumbnail: l.thumbnail,
            isFeatured: l.is_featured,
            isPriority: l.is_priority,
            isArchived: l.is_archived,
            scheduledStart: l.scheduled_start,
            scheduledEnd: l.scheduled_end
        }));

        res.json(formattedLinks);
    } catch (err) {
        console.error('Error fetching links:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Get public links for a user
const getPublicLinks = async (req, res) => {
    try {
        const { userId } = req.params;

        const links = await Link.find({
            user_id: userId,
            is_active: true,
            is_archived: { $ne: true }
        })
            .sort({ position: 1 })
            .lean();

        const formattedLinks = links.map(l => ({
            id: l._id,
            title: l.title,
            url: l.url,
            isActive: l.is_active,
            clicks: l.clicks,
            thumbnail: l.thumbnail,
            isFeatured: l.is_featured,
            isPriority: l.is_priority
        }));

        res.json(formattedLinks);
    } catch (err) {
        console.error('Error fetching public links:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Create a single link
const createLink = async (req, res) => {
    console.error('[ReqDebug] createLink controller hit');
    try {
        const userId = req.user.id;
        const { title, url, isActive, thumbnail } = req.body;

        const newLink = new Link({
            user_id: userId,
            title: title || 'New Link',
            url: url || '',
            is_active: isActive !== undefined ? isActive : true,
            thumbnail: thumbnail || '',
            position: 0
        });

        await newLink.save();

        // Update positions for other links
        await Link.updateMany(
            { user_id: userId, _id: { $ne: newLink._id } },
            { $inc: { position: 1 } }
        );

        notifyUpdate(req, userId);

        res.json({
            id: newLink._id,
            title: newLink.title,
            url: newLink.url,
            is_active: newLink.is_active,
            clicks: newLink.clicks,
            position: newLink.position,
            thumbnail: newLink.thumbnail
        });
    } catch (err) {
        console.error('Error creating link:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Sync all links (bulk update)
const syncLinks = async (req, res) => {
    try {
        const userId = req.user.id;
        const { links } = req.body;

        if (!Array.isArray(links)) {
            return res.status(400).json({ error: 'Links must be an array' });
        }

        // Process each link
        for (const link of links) {
            if (link.id && !link.id.startsWith('temp_')) {
                // Update existing link
                await Link.findOneAndUpdate(
                    { _id: link.id, user_id: userId },
                    {
                        title: link.title,
                        url: link.url,
                        is_active: link.isActive,
                        position: link.position,
                        thumbnail: link.thumbnail,
                        is_featured: link.isFeatured,
                        is_priority: link.isPriority,
                        is_archived: link.isArchived,
                        scheduled_start: link.scheduledStart,
                        scheduled_end: link.scheduledEnd,
                        updated_at: new Date()
                    }
                );
            } else {
                // Create new link
                const newLink = new Link({
                    user_id: userId,
                    title: link.title || 'New Link',
                    url: link.url || '',
                    is_active: link.isActive !== undefined ? link.isActive : true,
                    position: link.position || 0,
                    thumbnail: link.thumbnail || '',
                    is_featured: link.isFeatured || false,
                    is_priority: link.isPriority || false,
                    is_archived: link.isArchived || false
                });
                await newLink.save();
            }
        }

        notifyUpdate(req, userId);

        res.json({ success: true });
    } catch (err) {
        console.error('Error syncing links:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Delete a link
const deleteLink = async (req, res) => {
    try {
        const userId = req.user.id;
        const { linkId } = req.params;

        const result = await Link.findOneAndDelete({ _id: linkId, user_id: userId });

        if (!result) {
            return res.status(404).json({ error: 'Link not found' });
        }

        notifyUpdate(req, userId);

        res.json({ success: true });
    } catch (err) {
        console.error('Error deleting link:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Track link click
const trackClick = async (req, res) => {
    try {
        const { linkId } = req.params;

        await Link.findByIdAndUpdate(linkId, { $inc: { clicks: 1 } });

        res.json({ success: true });
    } catch (err) {
        console.error('Error tracking click:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = {
    getMyLinks,
    getPublicLinks,
    createLink,
    syncLinks,
    deleteLink,
    trackClick
};
