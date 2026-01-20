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

// CORS Configuration
const corsOptions = {
    origin: [
        'http://localhost:5173',
        'http://localhost:3000',
        'https://tap-onnn.vercel.app',
        'https://taponn.vercel.app'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
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
const subscriptionRoutes = require('./routes/subscription');
const marketplaceRoutes = require('./routes/marketplace');

// --- Routes ---

// Health check
app.get('/', (req, res) => {
    res.send('Tap2 Backend is running (MongoDB)');
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/links', linksRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api', commerceRoutes); // Products, orders, public/products
app.use('/api/payments', subscriptionRoutes); // Subscription & payments
app.use('/api/marketplace', marketplaceRoutes); // Marketplace plugins

// Legacy route support - /api/my-links is now under /api/links/my-links
// But since it was originally at /api/my-links, we add an alias
const linksController = require('./controllers/linksController');
const authMiddleware = require('./middleware/auth');
app.get('/api/my-links', authMiddleware, linksController.getMyLinks);



// Migration to ensure schema is up to date


// Start Server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    // Run migration in background

});
