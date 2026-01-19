const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const marketplaceController = require('../controllers/marketplaceController');

// Public routes
router.get('/plugins', marketplaceController.getAllPlugins);
router.get('/plugins/category/:category', marketplaceController.getPluginsByCategory);

// Protected routes (require authentication)
router.get('/my-plugins', authMiddleware, marketplaceController.getUserPlugins);
router.post('/install/:id', authMiddleware, marketplaceController.installPlugin);
router.delete('/uninstall/:id', authMiddleware, marketplaceController.uninstallPlugin);
router.put('/toggle/:id', authMiddleware, marketplaceController.togglePluginStatus);
router.put('/config/:id', authMiddleware, marketplaceController.updatePluginConfig);

// Seed route (for development)
router.post('/seed', marketplaceController.seedPlugins);

module.exports = router;
