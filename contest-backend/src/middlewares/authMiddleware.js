const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    try {
        const token = req.header("Authorization"); // Extract token from headers
        //console.log(token)
        if (!token) {
            return res.status(401).json({ success: false, message: "Access denied. No token provided." });
        }

        const decoded = jwt.verify(token, "TEST"); // Verify token
        req.user = decoded; // Attach user data (userId) to req object

        next(); // Move to next middleware or route handler
    } catch (error) {
        res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
};

module.exports = authMiddleware;

