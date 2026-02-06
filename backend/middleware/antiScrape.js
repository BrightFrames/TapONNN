const rateLimit = require('express-rate-limit');

// Bot patterns (User-Agent or common browser fingerprints for scrapers)
const BANNED_BOT_PATTERNS = [
    /bot/i, /crawler/i, /spider/i, /headless/i, /selenium/i, /puppeteer/i, /playwright/i,
    /scraper/i, /grabber/i, /curl/i, /wget/i, /python/i, /scrapy/i, /beautifulsoup/i,
    /node-fetch/i, /axios/i, /got/i, /superagent/i, /http.rb/i, /faraday/i
];

// Exempt legitimate bots for SEO
const EXEMPT_BOTS = [
    /googlebot/i, /bingbot/i, /applebot/i, /duckduckbot/i, /yandexbot/i, /baiduspider/i,
    /twitterbot/i, /facebookexternalhit/i, /linkedinbot/i
];

const antiScrapeMiddleware = (req, res, next) => {
    const userAgent = req.headers['user-agent'] || '';

    // 1. Block common bot User-Agents unless they are exempt
    const isBot = BANNED_BOT_PATTERNS.some(pattern => pattern.test(userAgent));
    const isExempt = EXEMPT_BOTS.some(pattern => pattern.test(userAgent));

    if (isBot && !isExempt) {
        console.warn(`[AntiScrape] Blocked request from suspected bot: ${userAgent}`);
        return res.status(403).json({ error: "Access denied. Automated access is not allowed." });
    }

    // 2. Headless checking (Basic) - Modern browsers usually send certain headers
    // If it's a browser request but missing common headers like 'accept-language' or 'sec-ch-ua'
    const isLikelyHeadless = req.method === 'GET' && 
                            !req.headers['accept-language'] && 
                            !req.headers['sec-ch-ua'] &&
                            !isExempt;

    if (isLikelyHeadless) {
        console.warn(`[AntiScrape] Blocked suspicious headless request`);
        return res.status(403).json({ error: "Access denied." });
    }

    next();
};

// Global Rate Limiting - Prevents high frequency scraping
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per 15 mins
    message: { error: "Too many requests, please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
});

// Profile Scraping Protection (stricter limit for public profiles)
const profileLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 60, // Limit profile views to 60 per minute per IP
    message: { error: "Suspicious activity detected. Slow down." },
    standardHeaders: true,
});

module.exports = {
    antiScrapeMiddleware,
    globalLimiter,
    profileLimiter
};
