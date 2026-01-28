const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const profileController = require('../controllers/profileController');
const analyticsController = require('../controllers/analyticsController');

// --- Specific routes MUST come before parameterized routes ---

// PUT /api/profile (Authenticated) - Update own profile
router.put('/', authMiddleware, profileController.updateProfile);

// POST /api/profile/theme (Authenticated)
router.post('/theme', authMiddleware, profileController.updateTheme);

// POST /api/profile/switch-mode (Authenticated) - Switch between personal/store mode
router.post('/switch-mode', authMiddleware, profileController.switchProfileMode);

// GET /api/profile/store/:username (Public) - Get store profile
router.get('/store/:username', profileController.getPublicStoreProfile);

// --- Parameterized routes (catch-all patterns) ---

// GET /api/profile/:username (Public)
router.get('/:username', profileController.getPublicProfile);

// POST /api/profile/:profileId/view (Public) - Track view


module.exports = router;


