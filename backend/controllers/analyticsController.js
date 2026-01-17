const pool = require('../config/db');

// Get Analytics Summary (Authenticated)
const getSummary = async (req, res) => {
    const userId = req.user.id;

    try {
        // 1. Total Clicks
        const clicksResult = await pool.query(
            'SELECT COALESCE(SUM(clicks), 0) as total_clicks FROM links WHERE user_id = $1',
            [userId]
        );

        // 2. Link Count
        const linksResult = await pool.query(
            'SELECT COUNT(*) as link_count FROM links WHERE user_id = $1',
            [userId]
        );

        // 3. Top Links
        const topLinksResult = await pool.query(
            'SELECT id, title, url, clicks FROM links WHERE user_id = $1 ORDER BY clicks DESC LIMIT 5',
            [userId]
        );

        // 4. Total Views (Lifetime)
        const viewsResult = await pool.query('SELECT total_views FROM profiles WHERE id = $1', [userId]);
        const totalViews = viewsResult.rows[0]?.total_views || 0;

        // 5. Subscribers
        const subResult = await pool.query('SELECT COUNT(*) as count FROM subscribers WHERE creator_id = $1', [userId]);
        const subscriberCount = parseInt(subResult.rows[0].count) || 0;

        // 6. Chart Data (Last 7 Days)
        const chartResult = await pool.query(`
            SELECT 
                TO_CHAR(created_at, 'Mon DD') as date,
                COUNT(*) FILTER (WHERE event_type = 'view') as views,
                COUNT(*) FILTER (WHERE event_type = 'click') as clicks
            FROM analytics_events 
            WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '7 days'
            GROUP BY TO_CHAR(created_at, 'Mon DD'), created_at::date
            ORDER BY created_at::date
        `, [userId]);

        res.json({
            totalClicks: parseInt(clicksResult.rows[0].total_clicks) || 0,
            linkCount: parseInt(linksResult.rows[0].link_count) || 0,
            topLinks: topLinksResult.rows,
            totalViews: parseInt(totalViews) || 0,
            subscribers: subscriberCount,
            chartData: chartResult.rows
        });
    } catch (err) {
        console.error("Error fetching analytics:", err);
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getSummary
};
