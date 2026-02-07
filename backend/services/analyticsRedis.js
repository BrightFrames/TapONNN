/**
 * Enterprise Analytics Redis Service
 * 
 * Provides real-time counters, unique visitor tracking, and live session management.
 * Falls back gracefully if Redis is not available.
 * 
 * ADD-ONLY: Does not replace existing MongoDB analytics.
 */

const Redis = require('ioredis');

// Redis client with fallback
let redisClient = null;
let isRedisConnected = false;
let connectionAttempted = false;

// In-memory fallback for when Redis is unavailable
const memoryStore = {
    counters: new Map(),
    visitors: new Map(),
    sessions: new Map()
};

/**
 * Initialize Redis connection
 * Uses REDIS_URL from environment or defaults to localhost
 */
const initRedis = () => {
    // Only attempt once
    if (connectionAttempted) return;
    connectionAttempted = true;

    const redisUrl = process.env.REDIS_URL;

    // Skip Redis if no URL configured
    if (!redisUrl) {
        console.log('ℹ️ REDIS_URL not configured, using in-memory analytics counters');
        return;
    }

    try {
        redisClient = new Redis(redisUrl, {
            maxRetriesPerRequest: 1,
            retryStrategy: () => null, // Don't retry - use fallback instead
            lazyConnect: true,
            enableOfflineQueue: false,
            connectTimeout: 5000
        });

        redisClient.on('connect', () => {
            console.log('✅ Redis connected for analytics');
            isRedisConnected = true;
        });

        redisClient.on('error', (err) => {
            if (isRedisConnected) {
                console.warn('⚠️ Redis error:', err.message);
            }
            isRedisConnected = false;
        });

        redisClient.on('close', () => {
            isRedisConnected = false;
        });

        // Attempt connection
        redisClient.connect().catch(() => {
            console.log('ℹ️ Redis not available, using in-memory counters');
        });

    } catch (err) {
        console.log('ℹ️ Redis init skipped, using in-memory fallback');
        isRedisConnected = false;
    }
};

// Initialize on module load
initRedis();

/**
 * Key generators for Redis
 */
const keys = {
    profileViews: (profileId) => `analytics:views:${profileId}`,
    linkClicks: (profileId) => `analytics:clicks:${profileId}`,
    uniqueVisitors: (profileId) => `analytics:visitors:${profileId}`,
    activeSession: (profileId, visitorId) => `analytics:session:${profileId}:${visitorId}`,
    dailyViews: (profileId, date) => `analytics:daily:views:${profileId}:${date}`,
    dailyClicks: (profileId, date) => `analytics:daily:clicks:${profileId}:${date}`
};

/**
 * Increment profile views counter
 * @param {string} profileId - Profile ObjectId
 * @returns {Promise<number>} New view count
 */
const incrProfileViews = async (profileId) => {
    const key = keys.profileViews(profileId);

    if (isRedisConnected && redisClient) {
        try {
            return await redisClient.incr(key);
        } catch (err) {
            console.warn('Redis incr failed:', err.message);
        }
    }

    // Fallback to memory
    const current = memoryStore.counters.get(key) || 0;
    memoryStore.counters.set(key, current + 1);
    return current + 1;
};

/**
 * Increment link clicks counter
 * @param {string} profileId - Profile ObjectId
 * @returns {Promise<number>} New click count
 */
const incrLinkClicks = async (profileId) => {
    const key = keys.linkClicks(profileId);

    if (isRedisConnected && redisClient) {
        try {
            return await redisClient.incr(key);
        } catch (err) {
            console.warn('Redis incr failed:', err.message);
        }
    }

    // Fallback to memory
    const current = memoryStore.counters.get(key) || 0;
    memoryStore.counters.set(key, current + 1);
    return current + 1;
};

/**
 * Add unique visitor (deduplicates within session window)
 * @param {string} profileId - Profile ObjectId
 * @param {string} visitorId - Visitor session ID
 * @param {number} sessionTTL - Session window in seconds (default 30 mins)
 * @returns {Promise<boolean>} True if new unique visitor
 */
const addUniqueVisitor = async (profileId, visitorId, sessionTTL = 1800) => {
    const sessionKey = keys.activeSession(profileId, visitorId);
    const visitorsKey = keys.uniqueVisitors(profileId);

    if (isRedisConnected && redisClient) {
        try {
            // Check if session exists
            const exists = await redisClient.exists(sessionKey);
            if (exists) {
                // Extend session TTL
                await redisClient.expire(sessionKey, sessionTTL);
                return false; // Not unique within session
            }

            // New session - mark as active and add to unique visitors
            await redisClient.setex(sessionKey, sessionTTL, '1');
            await redisClient.sadd(visitorsKey, visitorId);

            // Set TTL on visitors set (24 hours)
            await redisClient.expire(visitorsKey, 86400);

            return true; // Unique visitor
        } catch (err) {
            console.warn('Redis unique visitor failed:', err.message);
        }
    }

    // Fallback to memory
    const sessionMap = memoryStore.sessions.get(profileId) || new Map();
    const lastVisit = sessionMap.get(visitorId) || 0;
    const now = Date.now();

    if (now - lastVisit > sessionTTL * 1000) {
        sessionMap.set(visitorId, now);
        memoryStore.sessions.set(profileId, sessionMap);

        // Track unique visitors
        const visitors = memoryStore.visitors.get(profileId) || new Set();
        visitors.add(visitorId);
        memoryStore.visitors.set(profileId, visitors);

        return true;
    }

    // Extend session
    sessionMap.set(visitorId, now);
    return false;
};

/**
 * Check if visitor is unique (not seen in session window)
 * @param {string} profileId - Profile ObjectId
 * @param {string} visitorId - Visitor session ID
 * @returns {Promise<boolean>} True if unique
 */
const isUniqueVisitor = async (profileId, visitorId) => {
    const sessionKey = keys.activeSession(profileId, visitorId);

    if (isRedisConnected && redisClient) {
        try {
            const exists = await redisClient.exists(sessionKey);
            return !exists;
        } catch (err) {
            console.warn('Redis isUnique failed:', err.message);
        }
    }

    // Fallback
    const sessionMap = memoryStore.sessions.get(profileId) || new Map();
    const lastVisit = sessionMap.get(visitorId) || 0;
    return Date.now() - lastVisit > 1800000; // 30 min default
};

/**
 * Get real-time counts for a profile
 * @param {string} profileId - Profile ObjectId
 * @returns {Promise<object>} { views, clicks, uniqueVisitors }
 */
const getRealtimeCounts = async (profileId) => {
    const viewsKey = keys.profileViews(profileId);
    const clicksKey = keys.linkClicks(profileId);
    const visitorsKey = keys.uniqueVisitors(profileId);

    if (isRedisConnected && redisClient) {
        try {
            const [views, clicks, uniqueCount] = await Promise.all([
                redisClient.get(viewsKey),
                redisClient.get(clicksKey),
                redisClient.scard(visitorsKey)
            ]);

            return {
                views: parseInt(views) || 0,
                clicks: parseInt(clicks) || 0,
                uniqueVisitors: uniqueCount || 0
            };
        } catch (err) {
            console.warn('Redis getCounts failed:', err.message);
        }
    }

    // Fallback
    const views = memoryStore.counters.get(viewsKey) || 0;
    const clicks = memoryStore.counters.get(clicksKey) || 0;
    const visitors = memoryStore.visitors.get(profileId);
    const uniqueVisitors = visitors ? visitors.size : 0;

    return { views, clicks, uniqueVisitors };
};

/**
 * Get active sessions count (live users in last 5 minutes)
 * @param {string} profileId - Profile ObjectId
 * @returns {Promise<number>} Active session count
 */
const getActiveSessions = async (profileId) => {
    // This would require a more complex Redis structure
    // For now, we use the MongoDB-based active visitors from analyticsController
    return 0;
};

/**
 * Check Redis connection status
 * @returns {boolean} Connection status
 */
const isConnected = () => isRedisConnected;

module.exports = {
    incrProfileViews,
    incrLinkClicks,
    addUniqueVisitor,
    isUniqueVisitor,
    getRealtimeCounts,
    getActiveSessions,
    isConnected
};
