const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const optionalAuth = require('../middleware/optionalAuth');
const {
    trackJourneyEvent,
    getSessionJourney,
    getEnquiryJourney,
    getJourneyAnalytics
} = require('../controllers/journeyController');

/**
 * @route   POST /api/journey/track
 * @desc    Track a customer journey event
 * @access  Public (with optional auth)
 */
router.post('/track', optionalAuth, trackJourneyEvent);

/**
 * @route   GET /api/journey/session/:session_id
 * @desc    Get journey events for a specific session
 * @access  Public (with optional auth)
 */
router.get('/session/:session_id', optionalAuth, getSessionJourney);

/**
 * @route   GET /api/journey/enquiry/:enquiry_id
 * @desc    Get journey events for a specific enquiry
 * @access  Private (enquiry owner only)
 */
router.get('/enquiry/:enquiry_id', auth, getEnquiryJourney);

/**
 * @route   GET /api/journey/analytics
 * @desc    Get journey analytics for profile owner
 * @access  Private
 */
router.get('/analytics', auth, getJourneyAnalytics);

module.exports = router;
