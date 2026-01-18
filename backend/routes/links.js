const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const linksController = require('../controllers/linksController');

// GET /api/links/public/:userId (Public)
router.get('/public/:userId', linksController.getPublicLinks);

// GET /api/my-links (Authenticated)
router.get('/my-links', authMiddleware, linksController.getMyLinks);

// POST /api/links/single (Authenticated) - Add a single link
router.post('/single', authMiddleware, linksController.createLink);

// POST /api/links (Authenticated) - Sync/Update links
router.post('/', authMiddleware, linksController.syncLinks);

// DELETE /api/links/:linkId (Authenticated)
router.delete('/:linkId', authMiddleware, linksController.deleteLink);

// POST /api/links/:linkId/click (Public) - Track click
router.post('/:linkId/click', linksController.trackClick);

module.exports = router;
