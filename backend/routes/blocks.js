const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const blocksController = require('../controllers/blocksController');

// --- Block Library (Public) ---
router.get('/library', blocksController.getBlockLibrary);

// --- Public Blocks ---
router.get('/public/:userId', blocksController.getPublicBlocks);

// --- Block Tracking (Public) ---
router.post('/:blockId/track', blocksController.trackBlockInteraction);

// --- Authenticated Routes ---

// GET /api/blocks - Get user's blocks
router.get('/', authMiddleware, blocksController.getBlocks);

// POST /api/blocks - Create a new block
router.post('/', authMiddleware, blocksController.createBlock);

// PUT /api/blocks/reorder - Reorder blocks
router.put('/reorder', authMiddleware, blocksController.reorderBlocks);

// PUT /api/blocks/:blockId - Update a block
router.put('/:blockId', authMiddleware, blocksController.updateBlock);

// DELETE /api/blocks/:blockId - Delete a block
router.delete('/:blockId', authMiddleware, blocksController.deleteBlock);

module.exports = router;
