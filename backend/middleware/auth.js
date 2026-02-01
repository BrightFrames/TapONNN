const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    console.log('Auth middleware - Headers:', req.headers);
    console.log('Auth header:', authHeader);

    if (!authHeader) {
        console.log('No authorization header');
        return res.status(401).json({ error: "No authorization header", message: "Please login to access this resource" });
    }

    const token = authHeader.split(' ')[1];
    const jwtSecret = process.env.JWT_SECRET;

    console.log('Token:', token ? `${token.substring(0, 20)}...` : 'null');
    console.log('JWT_SECRET exists:', !!jwtSecret);

    if (!jwtSecret) {
        console.error("Missing JWT_SECRET in .env");
        return res.status(500).json({ error: "Server Configuration Error" });
    }

    try {
        const decoded = jwt.verify(token, jwtSecret);
        console.log('Token decoded successfully:', decoded);
        req.user = decoded; // { id, email }
        next();
    } catch (err) {
        console.error("JWT Verification Fail:", err.message);
        console.error("Error details:", err);
        return res.status(401).json({ error: "Unauthorized", message: "Invalid or expired token", details: err.message });
    }
};

module.exports = authMiddleware;
