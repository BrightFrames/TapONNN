const Profile = require('../models/Profile');

exports.getAllBusinesses = async (req, res) => {
    try {
        const mongoose = require('mongoose');
        const AnalyticsEvent = require('../models/AnalyticsEvent');

        // Get current user from auth middleware (optional - for personalization)
        const currentUserId = req.user?.id; // Will be undefined for anonymous users

        // 1. Calculate Trending Scores (Last 7 Days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const trendingScores = await AnalyticsEvent.aggregate([
            {
                $match: {
                    timestamp: { $gte: sevenDaysAgo },
                    event_type: { $in: ['product_click', 'pageview'] }
                }
            },
            {
                $group: {
                    _id: "$profile_id",
                    score: {
                        $sum: {
                            $cond: [
                                { $eq: ["$event_type", "product_click"] },
                                5, // 5 points for product click (High Intent)
                                1  // 1 point for pageview (Awareness)
                            ]
                        }
                    }
                }
            },
            { $sort: { score: -1 } }
        ]);

        // Create a map of profile_id -> score
        const scoreMap = {};
        trendingScores.forEach(item => {
            scoreMap[item._id.toString()] = item.score;
        });

        // 2. Fetch all businesses
        const businesses = await Profile.find({
            store_name: { $exists: true, $ne: '' }
        })
            .select('store_name store_username store_bio store_avatar_url store_category user_id design_config store_design_config store_selected_theme')
            .lean();

        // 3. ML-LIKE PERSONALIZATION (if user is logged in)
        let userCategoryAffinity = {};
        let similarUserProfiles = new Set();

        if (currentUserId) {
            // Find current user's profile
            const currentUserProfile = await Profile.findOne({ user_id: currentUserId }).lean();

            if (currentUserProfile) {
                // 3a. CATEGORY AFFINITY - Find categories user has interacted with
                const userInteractions = await AnalyticsEvent.aggregate([
                    {
                        $match: {
                            session_id: { $regex: currentUserId }, // Rough match - improve with proper session tracking
                            timestamp: { $gte: sevenDaysAgo },
                            event_type: { $in: ['product_click', 'pageview'] }
                        }
                    },
                    {
                        $lookup: {
                            from: 'profiles',
                            localField: 'profile_id',
                            foreignField: '_id',
                            as: 'profile'
                        }
                    },
                    { $unwind: '$profile' },
                    {
                        $group: {
                            _id: '$profile.store_category',
                            interactions: { $sum: 1 }
                        }
                    },
                    { $sort: { interactions: -1 } }
                ]);

                // Build category affinity map
                userInteractions.forEach(cat => {
                    if (cat._id) {
                        userCategoryAffinity[cat._id] = cat.interactions;
                    }
                });

                // 3b. COLLABORATIVE FILTERING - Find similar users
                // Get profiles current user has viewed
                const currentUserViewedProfiles = await AnalyticsEvent.distinct('profile_id', {
                    session_id: { $regex: currentUserId },
                    timestamp: { $gte: sevenDaysAgo },
                    event_type: { $in: ['product_click', 'pageview'] }
                });

                if (currentUserViewedProfiles.length > 0) {
                    // Find other users who viewed the same profiles (Jaccard similarity)
                    const similarUsers = await AnalyticsEvent.aggregate([
                        {
                            $match: {
                                profile_id: { $in: currentUserViewedProfiles },
                                timestamp: { $gte: sevenDaysAgo },
                                session_id: { $not: { $regex: currentUserId } } // Exclude current user
                            }
                        },
                        {
                            $group: {
                                _id: '$session_id',
                                commonProfiles: { $addToSet: '$profile_id' },
                                count: { $sum: 1 }
                            }
                        },
                        {
                            $match: {
                                count: { $gte: 2 } // At least 2 common interactions
                            }
                        },
                        { $limit: 10 } // Top 10 similar users
                    ]);

                    // Get profiles that similar users viewed but current user hasn't
                    for (const simUser of similarUsers) {
                        const theirProfiles = await AnalyticsEvent.distinct('profile_id', {
                            session_id: simUser._id,
                            timestamp: { $gte: sevenDaysAgo }
                        });

                        theirProfiles.forEach(profId => {
                            if (!currentUserViewedProfiles.some(p => p.equals(profId))) {
                                similarUserProfiles.add(profId.toString());
                            }
                        });
                    }
                }
            }
        }

        // 4. HYBRID SCORING
        const businessesWithScores = businesses.map(biz => {
            const trendingScore = scoreMap[biz._id.toString()] || 0;

            // Category Affinity Boost (0-100 points)
            let categoryBoost = 0;
            if (biz.store_category && userCategoryAffinity[biz.store_category]) {
                categoryBoost = Math.min(userCategoryAffinity[biz.store_category] * 10, 100);
            }

            // Collaborative Filtering Boost (50 points if recommended by similar users)
            const collaborativeBoost = similarUserProfiles.has(biz._id.toString()) ? 50 : 0;

            // Final Score: Weighted combination
            // Trending: 50%, Category: 30%, Collaborative: 20%
            const finalScore = (trendingScore * 0.5) + (categoryBoost * 0.3) + (collaborativeBoost * 0.2);

            return {
                ...biz,
                trendingScore,
                categoryBoost,
                collaborativeBoost,
                finalScore: Math.round(finalScore * 100) / 100 // Round to 2 decimals
            };
        });

        // Sort by Final Score (desc)
        businessesWithScores.sort((a, b) => b.finalScore - a.finalScore);

        res.status(200).json(businessesWithScores);
    } catch (error) {
        console.error('Error fetching businesses:', error);
        res.status(500).json({ message: 'Server error fetching businesses' });
    }
};
