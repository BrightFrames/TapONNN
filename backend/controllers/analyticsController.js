const AnalyticsEvent = require('../models/AnalyticsEvent');
const Profile = require('../models/Profile');
const Link = require('../models/Link');

// Track an analytics event
const trackEvent = async (req, res) => {
    try {
        const { event_type, url, path, referrer, browser, os, device, country, link_id, link_url } = req.body;

        // Use session_id from client or generate if missing (for robust tracking)
        // In a real app, we validate the header/cookie
        let session_id = req.headers['x-session-id'] || req.body.session_id;

        if (!session_id || !event_type) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Determine profile_id from path (e.g. /username or /s/username) or body
        // Ideally, frontend sends profile_id
        const profile_id = req.body.profile_id;

        if (!profile_id) {
            return res.status(400).json({ error: 'Missing profile_id' });
        }

        const event = new AnalyticsEvent({
            profile_id,
            session_id,
            event_type,
            url,
            path,
            referrer,
            browser,
            os,
            device,
            country,
            link_id,
            link_url,
            timestamp: new Date()
        });

        await event.save();
        res.json({ success: true });

    } catch (error) {
        console.error('Track event error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Get Dashboard Stats
const getStats = async (req, res) => {
    try {
        const userId = req.user.id;
        // Find profile for this user
        // Assuming single profile for now or pass profile_id in query
        const profile = await Profile.findOne({ user_id: userId });

        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        const profileId = profile._id;
        const { period = '30d' } = req.query; // '24h', '7d', '30d'

        let startDate = new Date();
        if (period === '24h') startDate.setHours(startDate.getHours() - 24);
        else if (period === '7d') startDate.setDate(startDate.getDate() - 7);
        else startDate.setDate(startDate.getDate() - 30);

        // Active Visitors (last 5 mins)
        const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);
        const activeVisitors = (await AnalyticsEvent.distinct('session_id', {
            profile_id: profileId,
            timestamp: { $gte: fiveMinsAgo }
        })).length;

        // Aggregation Pipeline
        const stats = await AnalyticsEvent.aggregate([
            {
                $match: {
                    profile_id: profileId,
                    timestamp: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: null,
                    totalViews: {
                        $sum: { $cond: [{ $eq: ["$event_type", "pageview"] }, 1, 0] }
                    },
                    totalClicks: {
                        $sum: { $cond: [{ $eq: ["$event_type", "click"] }, 1, 0] }
                    },
                    sessions: { $addToSet: "$session_id" },
                    // For bounce rate, we need to group by session first
                }
            }
        ]);

        // Detailed aggregated stats for Bounce Rate and Duration
        const sessionStats = await AnalyticsEvent.aggregate([
            {
                $match: {
                    profile_id: profileId,
                    timestamp: { $gte: startDate },
                    event_type: 'pageview'
                }
            },
            {
                $group: {
                    _id: "$session_id",
                    pageviews: { $sum: 1 },
                    startTime: { $min: "$timestamp" },
                    endTime: { $max: "$timestamp" }
                }
            },
            {
                $project: {
                    pageviews: 1,
                    duration: { $subtract: ["$endTime", "$startTime"] },
                    isBounce: { $eq: ["$pageviews", 1] }
                }
            }
        ]);

        const totalSessions = sessionStats.length;
        const bounces = sessionStats.filter(s => s.isBounce).length;
        const bounceRate = totalSessions > 0 ? Math.round((bounces / totalSessions) * 100) : 0;

        const totalDuration = sessionStats.reduce((acc, curr) => acc + (curr.duration || 0), 0);
        const avgDuration = totalSessions > 0 ? Math.round(totalDuration / totalSessions / 1000) : 0; // seconds

        const overview = {
            uniqueVisitors: stats[0]?.sessions.length || 0,
            totalVisits: totalSessions, // Approximation: 1 session = 1 visit
            pageviews: stats[0]?.totalViews || 0,
            viewsPerVisit: totalSessions > 0 ? ((stats[0]?.totalViews || 0) / totalSessions).toFixed(1) : 0,
            bounceRate: bounceRate,
            avgVisitDuration: avgDuration,
            activeVisitors
        };

        // Time Series Data (group by day or hour)
        const timeFormat = period === '24h' ? {
            year: { $year: "$timestamp" },
            month: { $month: "$timestamp" },
            day: { $dayOfMonth: "$timestamp" },
            hour: { $hour: "$timestamp" }
        } : {
            year: { $year: "$timestamp" },
            month: { $month: "$timestamp" },
            day: { $dayOfMonth: "$timestamp" }
        };

        const chartData = await AnalyticsEvent.aggregate([
            {
                $match: {
                    profile_id: profileId,
                    timestamp: { $gte: startDate },
                    event_type: 'pageview'
                }
            },
            {
                $group: {
                    _id: timeFormat,
                    visitors: { $addToSet: "$session_id" },
                    pageviews: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1, "_id.hour": 1 } }
        ]);

        // Breakdowns
        const getBreakdown = async (field) => {
            return await AnalyticsEvent.aggregate([
                { $match: { profile_id: profileId, timestamp: { $gte: startDate }, event_type: 'pageview' } },
                { $group: { _id: `$${field}`, count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ]);
        };

        const topPages = await getBreakdown('path');
        const topReferrers = await getBreakdown('referrer');
        const topCountries = await getBreakdown('country');
        const topDevices = await getBreakdown('device');

        res.json({
            overview,
            chart: chartData.map(d => ({
                date: period === '24h'
                    ? `${d._id.hour}:00`
                    : `${d._id.day}/${d._id.month}`,
                visitors: d.visitors.length,
                pageviews: d.pageviews
            })),
            breakdowns: {
                pages: topPages,
                referrers: topReferrers,
                countries: topCountries,
                devices: topDevices
            }
        });

    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = { trackEvent, getStats };
