
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase URL or Key in .env");
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Auth Middleware
const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: "No authorization header" });
    }

    const token = authHeader.split(' ')[1];

    try {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error || !user) throw new Error("Invalid token");

        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ error: "Unauthorized" });
    }
};

// --- Routes ---

// Health check
app.get('/', (req, res) => {
    res.send('TapONN Backend is running');
});

// GET Public Profile by Username (Public)
app.get('/api/profile/:username', async (req, res) => {
    const { username } = req.params;

    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('username', username)
            .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'User not found' });

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET Links for a User (Public - for viewing profiles)
app.get('/api/links/public/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const { data, error } = await supabase
            .from('links')
            .select('*')
            .eq('user_id', userId)
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET All Links for Owner (Authenticated)
app.get('/api/my-links', authMiddleware, async (req, res) => {
    const userId = req.user.id;

    try {
        const { data, error } = await supabase
            .from('links')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (err) {
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

    try {
        const updates = links.map(l => ({
            id: (l.id.length < 30) ? undefined : l.id,
            user_id: userId, // Enforce user ID from token
            title: l.title,
            url: l.url,
            is_active: l.isActive,
            clicks: l.clicks
        }));

        // Filter valid updates
        const validUpdates = updates.map(u => {
            if (u.id && u.id.length < 30) {
                const { id, ...rest } = u;
                return rest;
            }
            return u;
        });

        // Delete existing links not in the update payload?
        // Ideally yes for a full sync, but for now just upsert.
        // To strictly "show me the details from the account only", ensuring I don't edit others is key.
        // RLS does this in DB, but Node layer check (userId above) adds double safety.

        const { data, error } = await supabase.from('links').upsert(validUpdates).select();

        if (error) throw error;

        res.json({ success: true, data });
    } catch (err) {
        console.error("Error updating links:", err);
        res.status(500).json({ error: err.message });
    }
});

// Update Theme (Authenticated)
app.post('/api/profile/theme', authMiddleware, async (req, res) => {
    const userId = req.user.id;
    const { themeId } = req.body;

    try {
        const { error } = await supabase
            .from('profiles')
            .update({ selected_theme: themeId })
            .eq('id', userId);

        if (error) throw error;
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
