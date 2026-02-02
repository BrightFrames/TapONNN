const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require("socket.io");
require('dotenv').config();

// Initialize express
const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 5000; // Updated to 5001 via .env

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
        'http://localhost:8080',
        'http://localhost:8081',
        'http://localhost:8082',
        'http://localhost:8083',
        'https://tap-onnn.vercel.app',
        'https://taponn.vercel.app',
        'http://taponn.me',
        'https://taponn.me',
        'https://www.taponn.me',
        'https://tapx.bio',
        'https://www.tapx.bio'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-session-id']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use((req, res, next) => {
    console.error(`[ReqDebug] ${req.method} ${req.url}`);
    next();
});

// Socket.io Setup
const io = new Server(server, {
    cors: corsOptions
});

io.on("connection", (socket) => {
    // console.log("New client connected", socket.id);

    socket.on("joinProfile", (username) => {
        if (username) {
            const roomName = username.toLowerCase();
            socket.join(roomName);
            console.error(`[SocketDebug] Socket ${socket.id} joined ${roomName}`);
        }
    });

    // Chat room joining
    socket.on("joinChat", (conversationId) => {
        if (conversationId) {
            socket.join(`chat_${conversationId}`);
            console.log(`[ChatDebug] Socket ${socket.id} joined chat_${conversationId}`);
        }
    });

    socket.on("leaveChat", (conversationId) => {
        if (conversationId) {
            socket.leave(`chat_${conversationId}`);
        }
    });

    // User room for notifications
    socket.on("joinUser", (userId) => {
        if (userId) {
            socket.join(`user_${userId}`);
            console.log(`[ChatDebug] Socket ${socket.id} joined user_${userId}`);
        }
    });

    // Typing indicator
    socket.on("typing", ({ conversationId, userId, isTyping }) => {
        socket.to(`chat_${conversationId}`).emit("userTyping", { userId, isTyping });
    });

    socket.on("disconnect", () => {
        // console.log("Client disconnected", socket.id);
    });
});

// Make io available in routes
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Initialize database connection (runs on import)
require('./config/db');

// Serve static uploads
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import Routes
const authRoutes = require('./routes/auth');
const linksRoutes = require('./routes/links');
const profileRoutes = require('./routes/profile');
const analyticsRoutes = require('./routes/analytics');
const commerceRoutes = require('./routes/commerce');
const subscriptionRoutes = require('./routes/subscription');
const marketplaceRoutes = require('./routes/marketplace');
const blocksRoutes = require('./routes/blocks');
const enquiriesRoutes = require('./routes/enquiries');
const intentsRoutes = require('./routes/intents');
const uploadRoutes = require('./routes/upload');
const exploreRoutes = require('./routes/explore');
const connectRoutes = require('./routes/connect');
const likesRoutes = require('./routes/likes');
const chatRoutes = require('./routes/chat');

// --- Routes ---

// Health check
app.get('/', (req, res) => {
    res.send('TapONN Backend is running (MongoDB)');
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/links', linksRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api', commerceRoutes); // Products, orders, public/products
app.use('/api/payments', subscriptionRoutes); // Subscription & payments
app.use('/api/marketplace', marketplaceRoutes); // Marketplace plugins
app.use('/api/blocks', blocksRoutes); // Blocks system
app.use('/api/enquiries', enquiriesRoutes); // Enquiries/CTA tracking
app.use('/api/intents', intentsRoutes); // Core intent tracking
app.use('/api/upload', uploadRoutes); // File upload
app.use('/api/explore', exploreRoutes);
app.use('/api/connect', connectRoutes); // Connect registration flow
app.use('/api/products', likesRoutes); // Product likes
app.use('/api/chat', chatRoutes); // Real-time chat

// Legacy route support - /api/my-links is now under /api/links/my-links
// But since it was originally at /api/my-links, we add an alias
const linksController = require('./controllers/linksController');
const authMiddleware = require('./middleware/auth');
app.get('/api/my-links', authMiddleware, linksController.getMyLinks);



// Migration to ensure schema is up to date


// Start Server
console.log('Attempting to start server on port:', port);
server.listen(port, () => {
    console.log(`Server successfully running on port ${port}`);
    // Run migration in background
});
server.on('error', (e) => {
    console.error('SERVER LISTEN ERROR:', e);
});
