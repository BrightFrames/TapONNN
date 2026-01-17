const pool = require('../config/db');

// GET Public Profile by Username
const getPublicProfile = async (req, res) => {
    const { username } = req.params;

    try {
        const result = await pool.query('SELECT * FROM profiles WHERE username = $1', [username]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

// Update Theme (Authenticated)
const updateTheme = async (req, res) => {
    const userId = req.user.id;
    const { themeId } = req.body;

    try {
        await pool.query('UPDATE profiles SET selected_theme = $1 WHERE id = $2', [themeId, userId]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

// Update Profile (Authenticated) - bio, avatar, etc.
const updateProfile = async (req, res) => {
    const userId = req.user.id;
    const { bio, avatar_url, full_name, username } = req.body;

    try {
        // Build dynamic update query based on provided fields
        const updates = [];
        const values = [];
        let paramIndex = 1;

        if (bio !== undefined) {
            updates.push(`bio = $${paramIndex++}`);
            values.push(bio);
        }
        if (avatar_url !== undefined) {
            updates.push(`avatar_url = $${paramIndex++}`);
            values.push(avatar_url);
        }
        if (full_name !== undefined) {
            updates.push(`full_name = $${paramIndex++}`);
            values.push(full_name);
        }
        if (req.body.social_links !== undefined) {
            updates.push(`social_links = $${paramIndex++}`);
            values.push(req.body.social_links);
        }
        if (req.body.design_config !== undefined) {
            updates.push(`design_config = $${paramIndex++}`);
            values.push(req.body.design_config);
        }
        if (username !== undefined) {
            // Check if username is already taken
            const existing = await pool.query(
                'SELECT id FROM profiles WHERE username = $1 AND id != $2',
                [username, userId]
            );
            if (existing.rows.length > 0) {
                return res.status(400).json({ error: 'Username already taken' });
            }
            updates.push(`username = $${paramIndex++}`);
            values.push(username);
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        values.push(userId);
        const query = `UPDATE profiles SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`;

        const result = await pool.query(query, values);
        res.json({ success: true, profile: result.rows[0] });
    } catch (err) {
        console.error("Error updating profile:", err);
        res.status(500).json({ error: err.message });
    }
};

// Track Profile View (Public)
const trackView = async (req, res) => {
    const { username } = req.params;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Increment view count in profiles
        const profileResult = await client.query(
            'UPDATE profiles SET total_views = COALESCE(total_views, 0) + 1 WHERE username = $1 RETURNING id',
            [username]
        );

        if (profileResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Profile not found' });
        }

        const userId = profileResult.rows[0].id;

        // Log event for history
        await client.query(
            'INSERT INTO analytics_events (user_id, event_type) VALUES ($1, $2)',
            [userId, 'view']
        );

        await client.query('COMMIT');
        res.json({ success: true });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Error tracking view:", err);
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
};

module.exports = {
    getPublicProfile,
    updateTheme,
    updateProfile,
    trackView
};
