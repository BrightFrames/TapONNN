const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Initialize express
const app = express();
const port = process.env.PORT || 5000;

// Global Error Handlers to prevent silent exits
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('UNHANDLED REJECTION:', reason);
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialize database connection (runs on import)
require('./config/db');

// Import Routes
const authRoutes = require('./routes/auth');
const linksRoutes = require('./routes/links');
const profileRoutes = require('./routes/profile');
const analyticsRoutes = require('./routes/analytics');
const commerceRoutes = require('./routes/commerce');

// --- Routes ---

// Health check
app.get('/', (req, res) => {
    res.send('TapVisit Backend is running (PG Driver)');
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/links', linksRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api', commerceRoutes); // Products, orders, public/products

// Legacy route support - /api/my-links is now under /api/links/my-links
// But since it was originally at /api/my-links, we add an alias
const linksController = require('./controllers/linksController');
const authMiddleware = require('./middleware/auth');
app.get('/api/my-links', authMiddleware, linksController.getMyLinks);

const pool = require('./config/db');

// Migration to ensure schema is up to date
const runMigrations = async (retries = 5, delay = 5000) => {
    while (retries > 0) {
        try {
            // Ensure file_url column exists in products table
            await pool.query("ALTER TABLE products ADD COLUMN IF NOT EXISTS file_url TEXT;");
            console.log("Database schema updated: file_url column verified.");
            return;
        } catch (err) {
            console.error(`Migration Error (Retries left: ${retries - 1}):`, err.message);
            retries -= 1;
            if (retries === 0) break;
            await new Promise(res => setTimeout(res, delay));
        }
    }
    console.error("Migration failed after multiple attempts.");
};

// Start Server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    // Run migration in background
    runMigrations();
});
