const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const analyticsController = require('../controllers/analyticsController');

// POST /api/analytics/track (Public - tracked from public profiles)
router.post('/track', analyticsController.trackEvent);

// GET /api/analytics/stats (Authenticated - for store dashboard)
router.get('/stats', authMiddleware, analyticsController.getStats);

// GET /api/analytics/personal-stats (Authenticated - for personal profiles)
router.get('/personal-stats', authMiddleware, analyticsController.getPersonalStats);

module.exports = router;
