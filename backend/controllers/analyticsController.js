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

        // Determine profile_id from path (e.g. /username or /s/username) or body
        // Ideally, frontend sends profile_id
        const profile_id = req.body.profile_id;

        console.log('📝 Analytics Track Request:', { event_type, profile_id, session_id });

        if (!session_id || !event_type || !profile_id) {
            console.log('❌ Missing required fields for analytics');
            return res.status(400).json({ error: 'Missing required fields' });
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
        // Find profile for this user - convert to ObjectId for proper lookup
        const mongoose = require('mongoose');
        const userObjectId = new mongoose.Types.ObjectId(userId);
        const profile = await Profile.findOne({ user_id: userObjectId });

        if (!profile) {
            console.log('Analytics: Profile not found for user_id:', userId);
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

// Get Personal Profile Stats (for personal accounts)
const getPersonalStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const mongoose = require('mongoose');
        const userObjectId = new mongoose.Types.ObjectId(userId);
        const profile = await Profile.findOne({ user_id: userObjectId });

        console.log('📊 Get Personal Stats:', { userId, profileFound: !!profile });

        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        const profileId = profile._id;
        const { period = '30d' } = req.query;

        console.log('🔎 Query Period:', period, 'ProfileId:', profileId);

        let startDate = new Date();
        if (period === '24h') startDate.setHours(startDate.getHours() - 24);
        else if (period === '7d') startDate.setDate(startDate.getDate() - 7);
        else startDate.setDate(startDate.getDate() - 30);

        // 1. Total Views (pageview events)
        const totalViews = await AnalyticsEvent.countDocuments({
            profile_id: profileId,
            event_type: 'pageview',
            timestamp: { $gte: startDate }
        });

        // 2. Unique Visitors (distinct session_ids)
        const uniqueVisitors = (await AnalyticsEvent.distinct('session_id', {
            profile_id: profileId,
            event_type: 'pageview',
            timestamp: { $gte: startDate }
        })).length;

        // 3. Top Clicked Links (most clicked links)
        const topLinks = await AnalyticsEvent.aggregate([
            {
                $match: {
                    profile_id: profileId,
                    event_type: 'click',
                    timestamp: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: '$link_url',
                    clicks: { $sum: 1 },
                    link_id: { $first: '$link_id' }
                }
            },
            { $sort: { clicks: -1 } },
            { $limit: 10 }
        ]);

        // Get link titles for top links
        const topLinksWithTitles = await Promise.all(
            topLinks.map(async (link) => {
                let title = link._id;
                if (link.link_id) {
                    try {
                        const linkDoc = await Link.findById(link.link_id);
                        if (linkDoc) {
                            title = linkDoc.title || linkDoc.url;
                        }
                    } catch (e) { }
                }
                // Extract domain for display
                try {
                    const url = new URL(link._id);
                    const domain = url.hostname.replace('www.', '');
                    title = title || domain;
                } catch (e) {
                    title = title || link._id;
                }
                return {
                    url: link._id,
                    title,
                    clicks: link.clicks
                };
            })
        );

        // 4. Top Referrer Sources (where visitors came from)
        const topReferrers = await AnalyticsEvent.aggregate([
            {
                $match: {
                    profile_id: profileId,
                    event_type: 'pageview',
                    timestamp: { $gte: startDate },
                    referrer: { $ne: null, $ne: '' }
                }
            },
            {
                $group: {
                    _id: '$referrer',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        // Parse referrer URLs to get friendly names
        const parsedReferrers = topReferrers.map(ref => {
            let source = ref._id || 'Direct';
            try {
                if (ref._id && ref._id.length > 0) {
                    const url = new URL(ref._id);
                    const domain = url.hostname.replace('www.', '');
                    // Friendly names for common platforms
                    const platformNames = {
                        'instagram.com': 'Instagram',
                        'facebook.com': 'Facebook',
                        'twitter.com': 'Twitter',
                        'x.com': 'X (Twitter)',
                        'youtube.com': 'YouTube',
                        'linkedin.com': 'LinkedIn',
                        'tiktok.com': 'TikTok',
                        'google.com': 'Google Search',
                        'bing.com': 'Bing Search',
                        'pinterest.com': 'Pinterest',
                        'reddit.com': 'Reddit',
                        'whatsapp.com': 'WhatsApp',
                        't.co': 'Twitter',
                        'l.facebook.com': 'Facebook',
                        'lm.facebook.com': 'Facebook Messenger'
                    };
                    source = platformNames[domain] || domain;
                }
            } catch (e) {
                source = ref._id || 'Direct';
            }
            return {
                source,
                rawUrl: ref._id,
                count: ref.count
            };
        });

        // Add Direct traffic
        const directTraffic = await AnalyticsEvent.countDocuments({
            profile_id: profileId,
            event_type: 'pageview',
            timestamp: { $gte: startDate },
            $or: [
                { referrer: null },
                { referrer: '' },
                { referrer: { $exists: false } }
            ]
        });

        if (directTraffic > 0) {
            parsedReferrers.push({
                source: 'Direct',
                rawUrl: '',
                count: directTraffic
            });
            // Re-sort
            parsedReferrers.sort((a, b) => b.count - a.count);
        }

        // 5. Active Visitors (last 5 mins)
        const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);
        const activeVisitors = (await AnalyticsEvent.distinct('session_id', {
            profile_id: profileId,
            timestamp: { $gte: fiveMinsAgo }
        })).length;

        // Find highest visited link
        const highestVisitedLink = topLinksWithTitles.length > 0 ? topLinksWithTitles[0] : null;

        res.json({
            totalViews,
            uniqueVisitors,
            activeVisitors,
            highestVisitedLink,
            topLinks: topLinksWithTitles,
            referrers: parsedReferrers,
            period
        });

    } catch (error) {
        console.error('Get personal stats error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = { trackEvent, getStats, getPersonalStats };
