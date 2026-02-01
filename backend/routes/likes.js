const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Profile = require('../models/Profile');
const { Product } = require('../models/Product');

// Like a product
router.post('/:productId/like', auth, async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user.id;

        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Find user's profile
        const profile = await Profile.findOne({ user_id: userId });
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        // Check if already liked
        const alreadyLiked = profile.liked_products.some(
            id => id.toString() === productId
        );

        if (alreadyLiked) {
            return res.status(400).json({ message: 'Product already liked' });
        }

        // Add to liked products
        profile.liked_products.push(productId);
        await profile.save();

        res.status(200).json({
            message: 'Product liked successfully',
            liked: true,
            likedProducts: profile.liked_products
        });
    } catch (error) {
        console.error('Error liking product:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Unlike a product
router.delete('/:productId/like', auth, async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user.id;

        // Find user's profile
        const profile = await Profile.findOne({ user_id: userId });
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        // Remove from liked products
        profile.liked_products = profile.liked_products.filter(
            id => id.toString() !== productId
        );
        await profile.save();

        res.status(200).json({
            message: 'Product unliked successfully',
            liked: false,
            likedProducts: profile.liked_products
        });
    } catch (error) {
        console.error('Error unliking product:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get user's liked products
router.get('/liked', auth, async (req, res) => {
    try {
        const userId = req.user.id;

        const profile = await Profile.findOne({ user_id: userId })
            .populate({
                path: 'liked_products',
                select: 'title description price image_url product_type user_id'
            });

        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        res.status(200).json({
            likedProducts: profile.liked_products || [],
            likedProductIds: profile.liked_products.map(p => p._id.toString())
        });
    } catch (error) {
        console.error('Error fetching liked products:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
