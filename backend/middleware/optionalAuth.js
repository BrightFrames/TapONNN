const jwt = require('jsonwebtoken');

/**
 * Optional Auth Middleware
 * 
 * Unlike the regular auth middleware, this does NOT reject unauthenticated requests.
 * It simply attaches user info to req.user IF a valid token is present.
 * 
 * Use case: Intent creation needs to work for both visitors and logged-in users.
 */
const optionalAuthMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            // No token - continue as visitor
            req.user = null;
            return next();
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            req.user = null;
            return next();
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = { id: decoded.userId || decoded.id };
        } catch (err) {
            // Invalid token - continue as visitor
            req.user = null;
        }

        next();
    } catch (err) {
        // Any error - continue as visitor
        req.user = null;
        next();
    }
};

module.exports = optionalAuthMiddleware;
