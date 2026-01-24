const express = require('express');
const router = express.Router();
const exploreController = require('../controllers/exploreController');

// Get all businesses (public access allowed)
router.get('/all', exploreController.getAllBusinesses);

module.exports = router;
