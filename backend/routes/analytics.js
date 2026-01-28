const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const analyticsController = require('../controllers/analyticsController');

// POST /api/analytics/track (Public - tracked from public profiles)
router.post('/track', analyticsController.trackEvent);

// GET /api/analytics/stats (Authenticated - for dashboard)
router.get('/stats', authMiddleware, analyticsController.getStats);

module.exports = router;
