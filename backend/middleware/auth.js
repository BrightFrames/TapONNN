const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: "No authorization header" });
    }

    const token = authHeader.split(' ')[1];
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
        console.error("Missing JWT_SECRET in .env");
        return res.status(500).json({ error: "Server Configuration Error" });
    }

    try {
        const decoded = jwt.verify(token, jwtSecret);
        req.user = decoded; // { id, email }
        next();
    } catch (err) {
        console.error("JWT Verification Fail:", err.message);
        return res.status(401).json({ error: "Unauthorized" });
    }
};

module.exports = authMiddleware;
