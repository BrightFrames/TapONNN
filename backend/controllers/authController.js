const pool = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// SIGNUP
const signup = async (req, res) => {
    const { email, password, username, full_name } = req.body;

    if (!email || !password || !username || !full_name) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    let client;
    try {
        client = await pool.connect();
        try {
            await client.query('BEGIN');

            // 1. Check if user already exists
            const userCheck = await client.query('SELECT * FROM users WHERE email = $1', [email]);
            if (userCheck.rows.length > 0) {
                await client.query('ROLLBACK');
                return res.status(400).json({ error: "User already exists with this email" });
            }

            const profileCheck = await client.query('SELECT * FROM profiles WHERE username = $1', [username]);
            if (profileCheck.rows.length > 0) {
                await client.query('ROLLBACK');
                return res.status(400).json({ error: "Username already taken" });
            }

            // 2. Hash password
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password, salt);

            // 3. Create User
            const userResult = await client.query(
                'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
                [email, passwordHash]
            );
            const newUser = userResult.rows[0];

            // 4. Create Profile
            const profileResult = await client.query(
                'INSERT INTO profiles (id, username, full_name, email, selected_theme) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                [newUser.id, username, full_name, email, 'artemis']
            );
            const newProfile = profileResult.rows[0];

            await client.query('COMMIT');

            // 5. Generate Token
            const token = jwt.sign(
                { id: newUser.id, email: newUser.email },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );

            res.json({
                token,
                user: {
                    id: newUser.id,
                    email: newUser.email,
                    username: newProfile.username,
                    full_name: newProfile.full_name
                }
            });

        } catch (err) {
            if (client) {
                try {
                    await client.query('ROLLBACK');
                } catch (rollbackErr) {
                    console.error("Rollback error:", rollbackErr);
                }
            }
            console.error("Signup Error:", err);
            res.status(500).json({ error: err.message });
        } finally {
            if (client) client.release();
        }
    } catch (err) {
        if (client) client.release();
        res.status(500).json({ error: err.message });
    }
};

// LOGIN
const login = async (req, res) => {
    const { email, password } = req.body;
    console.log("Login attempt:", { email, passwordProvided: !!password });

    if (!email || !password) {
        console.log("Login failed: Missing credentials");
        return res.status(400).json({ error: "Missing credentials" });
    }

    try {
        // 1. Find user
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            console.log("Login failed: User not found", email);
            return res.status(400).json({ error: "Invalid credentials" });
        }

        const user = result.rows[0];

        // 2. Check password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            console.log("Login failed: Password mismatch for", email);
            return res.status(400).json({ error: "Invalid credentials" });
        }

        // 3. Get User Profile for extra data
        const profileResult = await pool.query('SELECT * FROM profiles WHERE id = $1', [user.id]);
        const profile = profileResult.rows[0] || {};

        // 4. Generate Token
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                username: profile.username,
                full_name: profile.full_name,
                avatar: profile.avatar_url
            }
        });

    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// GET CURRENT USER (Me)
const me = async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch profile
        const profileResult = await pool.query('SELECT * FROM profiles WHERE id = $1', [userId]);

        if (profileResult.rows.length === 0) {
            // Fallback if profile missing but user exists (should rarely happen)
            return res.json({ id: userId, email: req.user.email });
        }

        res.json(profileResult.rows[0]);
    } catch (err) {
        console.error("Me Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// CHANGE PASSWORD
const changePassword = async (req, res) => {
    const userId = req.user.id;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(newPassword, salt);

        await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, userId]);
        res.json({ success: true });
    } catch (err) {
        console.error("Error changing password:", err);
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    signup,
    login,
    me,
    changePassword
};
