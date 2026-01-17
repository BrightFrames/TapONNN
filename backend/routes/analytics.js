const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const analyticsController = require('../controllers/analyticsController');

// GET /api/analytics/summary (Authenticated)
router.get('/summary', authMiddleware, analyticsController.getSummary);

module.exports = router;
