const JourneyEvent = require('../models/JourneyEvent');
const Enquiry = require('../models/Enquiry');
const Profile = require('../models/Profile');
const mongoose = require('mongoose');

/**
 * Track a customer journey event
 * Public endpoint - visitors can track their behavior
 */
const trackJourneyEvent = async (req, res) => {
    try {
        const {
            session_id,
            profile_id,
            event_type,
            event_data,
            referrer,
            utm_source,
            utm_medium,
            utm_campaign,
            utm_term,
            utm_content
        } = req.body;

        // Validation
        if (!session_id || !profile_id || !event_type) {
            return res.status(400).json({ 
                error: 'session_id, profile_id, and event_type are required' 
            });
        }

        // Extract device info from headers
        const userAgent = req.headers['user-agent'] || '';
        const device_info = {
            user_agent: userAgent,
            device_type: getDeviceType(userAgent),
            browser: getBrowser(userAgent),
            os: getOS(userAgent)
        };

        // Extract location info (basic - use a GeoIP library for production)
        const location_info = {
            ip: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress
        };

        // Get visitor info if authenticated
        let visitor_id = null;
        let visitor_email = null;
        if (req.user) {
            visitor_id = req.user.id;
            visitor_email = req.user.email;
        } else if (req.body.visitor_email) {
            visitor_email = req.body.visitor_email;
        }

        // Create journey event
        const journeyEvent = new JourneyEvent({
            session_id,
            profile_id,
            visitor_id,
            visitor_email,
            event_type,
            event_data: event_data || {},
            device_info,
            location_info,
            referrer,
            utm_source,
            utm_medium,
            utm_campaign,
            utm_term,
            utm_content,
            timestamp: new Date()
        });

        await journeyEvent.save();

        res.json({ 
            success: true, 
            event_id: journeyEvent._id 
        });

    } catch (error) {
        console.error('❌ Track journey event error:', error);
        res.status(500).json({ error: 'Failed to track event' });
    }
};

/**
 * Get journey events for a specific session
 * Used to display customer journey in enquiry details
 */
const getSessionJourney = async (req, res) => {
    try {
        const { session_id } = req.params;

        if (!session_id) {
            return res.status(400).json({ error: 'session_id is required' });
        }

        const events = await JourneyEvent.find({ session_id })
            .sort({ timestamp: 1 })
            .populate('event_data.block_id', 'type title')
            .populate('event_data.product_id', 'title price')
            .populate('event_data.link_id', 'title url')
            .lean();

        // Transform events into journey steps format
        const journey = events.map(event => ({
            id: event._id,
            type: event.event_type,
            title: getEventTitle(event),
            subtitle: getEventSubtitle(event),
            timestamp: event.timestamp,
            time: formatTime(event.timestamp),
            icon: getEventIcon(event.event_type),
            metadata: event.event_data
        }));

        res.json({ 
            success: true, 
            journey,
            total_events: journey.length 
        });

    } catch (error) {
        console.error('❌ Get session journey error:', error);
        res.status(500).json({ error: 'Failed to retrieve journey' });
    }
};

/**
 * Get journey events for an enquiry
 * Links journey events to a specific enquiry
 */
const getEnquiryJourney = async (req, res) => {
    try {
        const { enquiry_id } = req.params;

        // Verify user owns this enquiry
        const enquiry = await Enquiry.findById(enquiry_id);
        if (!enquiry) {
            return res.status(404).json({ error: 'Enquiry not found' });
        }

        if (req.user && enquiry.seller_id.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        // Get journey events - try by enquiry_id first, then by email + time window
        let events = await JourneyEvent.find({ enquiry_id })
            .sort({ timestamp: 1 })
            .lean();

        // If no events linked directly, try to find by visitor email within time window
        if (events.length === 0 && enquiry.visitor_email) {
            const timeWindow = 3600000; // 1 hour before enquiry
            const startTime = new Date(enquiry.created_at.getTime() - timeWindow);
            
            events = await JourneyEvent.find({
                visitor_email: enquiry.visitor_email,
                profile_id: enquiry.seller_id,
                timestamp: { $gte: startTime, $lte: enquiry.created_at }
            })
            .sort({ timestamp: 1 })
            .lean();

            // Link these events to the enquiry
            if (events.length > 0) {
                await JourneyEvent.updateMany(
                    { _id: { $in: events.map(e => e._id) } },
                    { $set: { enquiry_id: enquiry._id } }
                );
            }
        }

        // Transform to journey format
        const journey = events.map(event => ({
            id: event._id,
            type: event.event_type,
            title: getEventTitle(event),
            subtitle: getEventSubtitle(event),
            timestamp: event.timestamp,
            time: formatTime(event.timestamp),
            icon: getEventIcon(event.event_type),
            metadata: event.event_data
        }));

        res.json({ 
            success: true, 
            journey,
            total_events: journey.length,
            enquiry_id 
        });

    } catch (error) {
        console.error('❌ Get enquiry journey error:', error);
        res.status(500).json({ error: 'Failed to retrieve journey' });
    }
};

/**
 * Link journey events to an enquiry (called when enquiry is created)
 */
const linkJourneyToEnquiry = async (session_id, enquiry_id, visitor_email) => {
    try {
        const result = await JourneyEvent.updateMany(
            { 
                $or: [
                    { session_id },
                    { visitor_email }
                ]
            },
            { 
                $set: { 
                    enquiry_id,
                    visitor_email 
                } 
            }
        );

        console.log(`✅ Linked ${result.modifiedCount} journey events to enquiry ${enquiry_id}`);
        return result;
    } catch (error) {
        console.error('❌ Link journey error:', error);
        throw error;
    }
};

/**
 * Get journey analytics for profile owner
 */
const getJourneyAnalytics = async (req, res) => {
    try {
        const profile_id = req.user.id;
        const { days = 7 } = req.query;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));

        // Get event counts by type
        const eventStats = await JourneyEvent.aggregate([
            {
                $match: {
                    profile_id: new mongoose.Types.ObjectId(profile_id),
                    timestamp: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: '$event_type',
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);

        // Get unique sessions
        const uniqueSessions = await JourneyEvent.distinct('session_id', {
            profile_id,
            timestamp: { $gte: startDate }
        });

        // Get conversion rate (sessions that led to enquiries)
        const convertedSessions = await JourneyEvent.distinct('session_id', {
            profile_id,
            timestamp: { $gte: startDate },
            enquiry_id: { $ne: null }
        });

        // Top blocks interacted with
        const topBlocks = await JourneyEvent.aggregate([
            {
                $match: {
                    profile_id: new mongoose.Types.ObjectId(profile_id),
                    timestamp: { $gte: startDate },
                    'event_data.block_id': { $exists: true }
                }
            },
            {
                $group: {
                    _id: '$event_data.block_id',
                    title: { $first: '$event_data.block_title' },
                    type: { $first: '$event_data.block_type' },
                    interactions: { $sum: 1 }
                }
            },
            {
                $sort: { interactions: -1 }
            },
            {
                $limit: 10
            }
        ]);

        res.json({
            success: true,
            analytics: {
                total_events: eventStats.reduce((sum, e) => sum + e.count, 0),
                event_breakdown: eventStats,
                unique_sessions: uniqueSessions.length,
                converted_sessions: convertedSessions.length,
                conversion_rate: uniqueSessions.length > 0 
                    ? ((convertedSessions.length / uniqueSessions.length) * 100).toFixed(2) 
                    : 0,
                top_blocks: topBlocks
            },
            period_days: days
        });

    } catch (error) {
        console.error('❌ Get journey analytics error:', error);
        res.status(500).json({ error: 'Failed to retrieve analytics' });
    }
};

// Helper functions

function getDeviceType(userAgent) {
    if (/mobile/i.test(userAgent)) return 'mobile';
    if (/tablet|ipad/i.test(userAgent)) return 'tablet';
    if (/desktop|windows|mac|linux/i.test(userAgent)) return 'desktop';
    return 'unknown';
}

function getBrowser(userAgent) {
    if (/chrome/i.test(userAgent)) return 'Chrome';
    if (/firefox/i.test(userAgent)) return 'Firefox';
    if (/safari/i.test(userAgent)) return 'Safari';
    if (/edge/i.test(userAgent)) return 'Edge';
    if (/opera/i.test(userAgent)) return 'Opera';
    return 'Unknown';
}

function getOS(userAgent) {
    if (/windows/i.test(userAgent)) return 'Windows';
    if (/mac/i.test(userAgent)) return 'macOS';
    if (/linux/i.test(userAgent)) return 'Linux';
    if (/android/i.test(userAgent)) return 'Android';
    if (/ios|iphone|ipad/i.test(userAgent)) return 'iOS';
    return 'Unknown';
}

function getEventTitle(event) {
    const titles = {
        profile_visit: 'Visited Profile',
        block_view: event.event_data?.block_title || 'Viewed Block',
        link_click: event.event_data?.link_title || 'Clicked Link',
        product_view: `Viewed: ${event.event_data?.product_name || 'Product'}`,
        product_click: `Clicked: ${event.event_data?.product_name || 'Product'}`,
        social_click: 'Clicked Social Link',
        contact_click: 'Clicked Contact',
        message_sent: 'Sent Message',
        share_clicked: 'Shared Profile',
        download_click: 'Downloaded File',
        video_play: 'Played Video',
        scroll_depth: `Scrolled ${event.event_data?.scroll_percentage || 0}%`,
        time_spent: `Spent ${event.event_data?.duration_seconds || 0}s`,
        form_start: 'Started Form',
        form_complete: 'Completed Form'
    };
    return titles[event.event_type] || event.event_type;
}

function getEventSubtitle(event) {
    const subtitles = {
        profile_visit: 'Initial Visit',
        block_view: event.event_data?.block_type || 'Block Interaction',
        link_click: 'Link Click',
        product_view: 'Product Browse',
        product_click: 'Product Interaction',
        social_click: 'Social Media',
        contact_click: 'Contact Attempt',
        message_sent: 'Enquiry',
        share_clicked: 'Share',
        download_click: 'Download',
        video_play: 'Video',
        scroll_depth: 'Page Scroll',
        time_spent: 'Engagement',
        form_start: 'Form Interaction',
        form_complete: 'Form Submission'
    };
    return subtitles[event.event_type] || 'Event';
}

function getEventIcon(eventType) {
    const icons = {
        profile_visit: 'User',
        block_view: 'Eye',
        link_click: 'MousePointer',
        product_view: 'ShoppingBag',
        product_click: 'ShoppingCart',
        social_click: 'Share2',
        contact_click: 'Phone',
        message_sent: 'MessageSquare',
        share_clicked: 'Share',
        download_click: 'Download',
        video_play: 'Play',
        scroll_depth: 'ArrowDown',
        time_spent: 'Clock',
        form_start: 'Edit',
        form_complete: 'CheckCircle'
    };
    return icons[eventType] || 'Circle';
}

function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
    });
}

module.exports = {
    trackJourneyEvent,
    getSessionJourney,
    getEnquiryJourney,
    getJourneyAnalytics,
    linkJourneyToEnquiry
};
