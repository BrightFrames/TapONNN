const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const profileController = require('../controllers/profileController');

// GET /api/profile/:username (Public)
router.get('/:username', profileController.getPublicProfile);

// POST /api/profile/theme (Authenticated)
router.post('/theme', authMiddleware, profileController.updateTheme);

// PUT /api/profile (Authenticated)
router.put('/', authMiddleware, profileController.updateProfile);

// POST /api/profile/:username/view (Public) - Track view
router.post('/:username/view', profileController.trackView);

module.exports = router;
