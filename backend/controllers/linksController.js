const pool = require('../config/db');

// GET Public Links for a User
const getPublicLinks = async (req, res) => {
    const { userId } = req.params;

    try {
        const result = await pool.query(
            'SELECT * FROM links WHERE user_id = $1 AND is_active = true ORDER BY COALESCE(position, 0) ASC, created_at DESC',
            [userId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

// GET All Links for Owner (Authenticated)
const getMyLinks = async (req, res) => {
    const userId = req.user.id;

    try {
        const result = await pool.query(
            'SELECT * FROM links WHERE user_id = $1 ORDER BY COALESCE(position, 0) ASC, created_at DESC',
            [userId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

// SYNC/UPDATE Links (Authenticated)
const syncLinks = async (req, res) => {
    const userId = req.user.id;
    const { links } = req.body;

    if (!Array.isArray(links)) {
        return res.status(400).json({ error: "Invalid data" });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const returnData = [];

        for (let i = 0; i < links.length; i++) {
            const l = links[i];
            const position = l.position !== undefined ? l.position : i;

            if (l.id && l.id.length > 30) {
                // UPDATE
                const updateQuery = `
                    UPDATE links 
                    SET title = $1, url = $2, is_active = $3, clicks = $4, position = $5, thumbnail = $6
                    WHERE id = $7 AND user_id = $8
                    RETURNING *
                `;
                const result = await client.query(updateQuery, [l.title, l.url, l.isActive, l.clicks || 0, position, l.thumbnail || null, l.id, userId]);
                if (result.rows[0]) returnData.push(result.rows[0]);
            } else {
                // INSERT
                const insertQuery = `
                    INSERT INTO links (user_id, title, url, is_active, clicks, position, thumbnail)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                    RETURNING *
                `;
                const result = await client.query(insertQuery, [userId, l.title, l.url, l.isActive, l.clicks || 0, position, l.thumbnail || null]);
                if (result.rows[0]) returnData.push(result.rows[0]);
            }
        }

        await client.query('COMMIT');
        res.json({ success: true, data: returnData });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Error updating links:", err);
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
};

// DELETE a specific link (Authenticated)
const deleteLink = async (req, res) => {
    const userId = req.user.id;
    const { linkId } = req.params;

    try {
        // Only delete if the link belongs to the authenticated user
        const result = await pool.query(
            'DELETE FROM links WHERE id = $1 AND user_id = $2 RETURNING id',
            [linkId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Link not found or access denied' });
        }

        res.json({ success: true, deletedId: linkId });
    } catch (err) {
        console.error("Error deleting link:", err);
        res.status(500).json({ error: err.message });
    }
};

// REORDER Links (Authenticated)
const reorderLinks = async (req, res) => {
    const userId = req.user.id;
    const { links } = req.body; // Array of { id, position }

    if (!Array.isArray(links)) {
        return res.status(400).json({ error: "Invalid data: expected array of {id, position}" });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        for (const link of links) {
            if (!link.id || link.position === undefined) continue;

            await client.query(
                'UPDATE links SET position = $1 WHERE id = $2 AND user_id = $3',
                [link.position, link.id, userId]
            );
        }

        await client.query('COMMIT');
        res.json({ success: true });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Error reordering links:", err);
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
};

// Track Link Click (Public)
const trackClick = async (req, res) => {
    const { linkId } = req.params;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Increment click count
        const result = await client.query(
            'UPDATE links SET clicks = COALESCE(clicks, 0) + 1 WHERE id = $1 RETURNING clicks, user_id',
            [linkId]
        );

        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Link not found' });
        }

        const userId = result.rows[0].user_id;

        // Log event for history
        await client.query(
            'INSERT INTO analytics_events (user_id, event_type, link_id) VALUES ($1, $2, $3)',
            [userId, 'click', linkId]
        );

        await client.query('COMMIT');
        res.json({ success: true, clicks: result.rows[0].clicks });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Error tracking click:", err);
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
};

module.exports = {
    getPublicLinks,
    getMyLinks,
    syncLinks,
    deleteLink,
    reorderLinks,
    trackClick
};
