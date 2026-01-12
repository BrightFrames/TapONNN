
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
        // We might need to check if 'decoded.sub' exists.
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
    res.send('TapONN Backend is running (PG Driver)');
});

// GET Public Profile by Username (Public)
app.get('/api/profile/:username', async (req, res) => {
    const { username } = req.params;

    try {
        // Query: select * from profiles where username = $1
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
            'SELECT * FROM links WHERE user_id = $1 AND is_active = true ORDER BY created_at DESC',
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
            'SELECT * FROM links WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// SYNC/UPDATE Links (Authenticated)
// Supabase 'upsert' handled insert/update. We simply iterate here.
// Transaction would be better for atomicity.
app.post('/api/links', authMiddleware, async (req, res) => {
    const userId = req.user.id;
    const { links } = req.body;

    if (!Array.isArray(links)) {
        return res.status(400).json({ error: "Invalid data" });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN'); // Start Transaction

        const returnData = [];

        for (const l of links) {
            // Check if update or insert
            // If ID is UUID (length > 30 approx), it's likely an update.
            // If ID is short temp string, it's an insert.

            if (l.id && l.id.length > 30) {
                // UPDATE
                const updateQuery = `
                    UPDATE links 
                    SET title =$1, url =$2, is_active =$3, clicks =$4
                    WHERE id = $5 AND user_id = $6
                    RETURNING *
                `;
                const res = await client.query(updateQuery, [l.title, l.url, l.isActive, l.clicks, l.id, userId]);
                if (res.rows[0]) returnData.push(res.rows[0]);
            } else {
                // INSERT
                const insertQuery = `
                    INSERT INTO links (user_id, title, url, is_active, clicks)
                    VALUES ($1, $2, $3, $4, $5)
                    RETURNING *
                `;
                const res = await client.query(insertQuery, [userId, l.title, l.url, l.isActive, l.clicks]);
                if (res.rows[0]) returnData.push(res.rows[0]);
            }
        }

        // What about deleted links? 
        // Logic in previous code: "Delete existing links not in the update payload? ... for now just upsert."
        // So we won't delete anything yet, matching parity.

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

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
