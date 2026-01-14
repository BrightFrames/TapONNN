
const express = require('express');
const cors = require('cors');

// Keep process alive hack (Debug)
setInterval(() => { }, 60000);
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Global Error Handlers to prevent silent exits
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION:', err);
    // Keep running if possible, or exit with error
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('UNHANDLED REJECTION:', reason);
});

process.on('exit', (code) => {
    console.log(`Process exited with code: ${code}`);
});

process.on('beforeExit', (code) => {
    console.log('Process execution completed. Node is initiating exit...');
});

// Middleware
app.use(cors());
app.use(express.json());

// Postgres Client
const pool = new Pool({
    connectionString: process.env.DB_URI,
});

// Check DB Connection
pool.connect((err, client, release) => {
    if (err) {
        return console.error('Error acquiring client', err.stack);
    }
    console.log('Connected to Database via PG');
    release();
});

// Auth Middleware (Manual JWT Verification)
const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: "No authorization header" });
    }

    const token = authHeader.split(' ')[1];
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
        console.error("Missing JWT_SECRET in .env");
        return res.status(500).json({ error: "Server Configuration Error" });
    }

    try {
        const decoded = jwt.verify(token, jwtSecret);
        // Supabase JWTs typically assume the 'sub' claim is the user ID.
        req.user = { id: decoded.sub, email: decoded.email };
        next();
    } catch (err) {
        console.error("JWT Verification Fail:", err.message);
        return res.status(401).json({ error: "Unauthorized" });
    }
};

// --- Routes ---

// Health check
app.get('/', (req, res) => {
    res.send('TapVisit Backend is running (PG Driver)');
});

// GET Public Profile by Username (Public)
app.get('/api/profile/:username', async (req, res) => {
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
});

// GET Links for a User (Public - for viewing profiles)
app.get('/api/links/public/:userId', async (req, res) => {
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
});

// GET All Links for Owner (Authenticated)
app.get('/api/my-links', authMiddleware, async (req, res) => {
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
});

// SYNC/UPDATE Links (Authenticated)
app.post('/api/links', authMiddleware, async (req, res) => {
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
                    SET title = $1, url = $2, is_active = $3, clicks = $4, position = $5
                    WHERE id = $6 AND user_id = $7
                    RETURNING *
                `;
                const result = await client.query(updateQuery, [l.title, l.url, l.isActive, l.clicks || 0, position, l.id, userId]);
                if (result.rows[0]) returnData.push(result.rows[0]);
            } else {
                // INSERT
                const insertQuery = `
                    INSERT INTO links (user_id, title, url, is_active, clicks, position)
                    VALUES ($1, $2, $3, $4, $5, $6)
                    RETURNING *
                `;
                const result = await client.query(insertQuery, [userId, l.title, l.url, l.isActive, l.clicks || 0, position]);
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
});

// DELETE a specific link (Authenticated)
app.delete('/api/links/:linkId', authMiddleware, async (req, res) => {
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
});

// REORDER Links (Authenticated)
app.put('/api/links/reorder', authMiddleware, async (req, res) => {
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
});

// Track Link Click (Public - called when someone clicks a link on public profile)
app.post('/api/links/:linkId/click', async (req, res) => {
    const { linkId } = req.params;

    try {
        // Increment click count
        const result = await pool.query(
            'UPDATE links SET clicks = COALESCE(clicks, 0) + 1 WHERE id = $1 RETURNING clicks',
            [linkId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Link not found' });
        }

        res.json({ success: true, clicks: result.rows[0].clicks });
    } catch (err) {
        console.error("Error tracking click:", err);
        res.status(500).json({ error: err.message });
    }
});

// Track Profile View (Public - called when someone views a public profile)
app.post('/api/profile/:username/view', async (req, res) => {
    const { username } = req.params;

    try {
        // First get the profile to ensure it exists
        const profileResult = await pool.query('SELECT id FROM profiles WHERE username = $1', [username]);

        if (profileResult.rows.length === 0) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        // Increment view count (add view_count column if not exists, or just return success)
        // For now, just return success - full analytics tracking can be added later with a separate table
        res.json({ success: true });
    } catch (err) {
        console.error("Error tracking view:", err);
        res.status(500).json({ error: err.message });
    }
});

// Update Theme (Authenticated)
app.post('/api/profile/theme', authMiddleware, async (req, res) => {
    const userId = req.user.id;
    const { themeId } = req.body;

    try {
        await pool.query('UPDATE profiles SET selected_theme = $1 WHERE id = $2', [themeId, userId]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Update Profile (Authenticated) - bio, avatar, etc.
app.put('/api/profile', authMiddleware, async (req, res) => {
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
});

// Get Analytics Summary (Authenticated)
app.get('/api/analytics/summary', authMiddleware, async (req, res) => {
    const userId = req.user.id;

    try {
        // Get total clicks across all links
        const clicksResult = await pool.query(
            'SELECT COALESCE(SUM(clicks), 0) as total_clicks FROM links WHERE user_id = $1',
            [userId]
        );

        // Get link count
        const linksResult = await pool.query(
            'SELECT COUNT(*) as link_count FROM links WHERE user_id = $1',
            [userId]
        );

        // Get top links
        const topLinksResult = await pool.query(
            'SELECT id, title, url, clicks FROM links WHERE user_id = $1 ORDER BY clicks DESC LIMIT 5',
            [userId]
        );

        res.json({
            totalClicks: parseInt(clicksResult.rows[0].total_clicks) || 0,
            linkCount: parseInt(linksResult.rows[0].link_count) || 0,
            topLinks: topLinksResult.rows
        });
    } catch (err) {
        console.error("Error fetching analytics:", err);
        res.status(500).json({ error: err.message });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

