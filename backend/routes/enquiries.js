const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const enquiriesController = require('../controllers/enquiriesController');

// --- Public Routes ---
// POST /api/enquiries - Create enquiry (visitors can submit)
router.post('/', enquiriesController.createEnquiry);

// --- Authenticated Routes ---

// GET /api/enquiries - Get seller's enquiries
router.get('/', authMiddleware, enquiriesController.getEnquiries);

// GET /api/enquiries/stats - Get enquiry statistics
router.get('/stats', authMiddleware, enquiriesController.getEnquiryStats);

// PUT /api/enquiries/:enquiryId/status - Update enquiry status
router.put('/:enquiryId/status', authMiddleware, enquiriesController.updateEnquiryStatus);

// DELETE /api/enquiries/:enquiryId - Delete enquiry
router.delete('/:enquiryId', authMiddleware, enquiriesController.deleteEnquiry);

module.exports = router;
