const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const optionalAuthMiddleware = require('../middleware/optionalAuth');
const intentController = require('../controllers/intentController');

/**
 * Intent Routes
 * 
 * Core flow:
 * 1. POST /api/intents - Create intent (public, no auth)
 * 2. PUT /api/intents/:intentId/resume - Resume after login
 * 3. PUT /api/intents/:intentId/complete - Mark complete
 * 4. PUT /api/intents/:intentId/fail - Mark failed
 * 5. GET /api/intents (super user only)
 */

// --- Public Routes (Intent creation happens WITHOUT login) ---

// POST /api/intents - Create intent when CTA is clicked
// Uses optional auth to detect logged-in users
router.post('/', optionalAuthMiddleware, intentController.createIntent);

// --- Authenticated Routes ---

// PUT /api/intents/:intentId/resume - Resume flow after login
router.put('/:intentId/resume', authMiddleware, intentController.resumeAfterLogin);

// PUT /api/intents/:intentId/complete - Complete intent
router.put('/:intentId/complete', authMiddleware, intentController.completeIntent);

// PUT /api/intents/:intentId/fail - Fail intent
router.put('/:intentId/fail', authMiddleware, intentController.failIntent);

// --- Super User Routes (Dashboard only) ---

// GET /api/intents - Get intents for profile (super user only)
router.get('/', authMiddleware, intentController.getProfileIntents);

// GET /api/intents/stats - Get intent statistics (super user only)
router.get('/stats', authMiddleware, intentController.getIntentStats);

module.exports = router;
