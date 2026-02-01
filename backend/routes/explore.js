const express = require('express');
const router = express.Router();
const exploreController = require('../controllers/exploreController');

// Get all businesses (public access allowed)
router.get('/all', exploreController.getAllBusinesses);

// Get all products for explore (public access allowed)
router.get('/products', exploreController.getAllProducts);

module.exports = router;
