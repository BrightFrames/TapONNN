const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const storeController = require('../controllers/storeController');

// Check username availability (no auth required)
router.get('/check-username/:username', storeController.checkUsernameAvailability);

// Get all stores for authenticated user
router.get('/my-stores', authMiddleware, storeController.getUserStores);

// Create a new store
router.post('/', authMiddleware, storeController.createStore);

// Get specific store by ID (authenticated)
router.get('/:storeId', authMiddleware, storeController.getStoreById);

// Update store
router.put('/:storeId', authMiddleware, storeController.updateStore);

// Get public store by username
router.get('/public/:username', storeController.getPublicStore);

module.exports = router;
