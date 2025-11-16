const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    // Read from HttpOnly cookie
    const token = req.cookies?.authToken;

    if (!token) {
        return res.status(401).json({ message: "Not authenticated. No token." });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.error("JWT verify error:", err);
            return res.status(401).json({ message: "Invalid or expired token." });
        }

        req.user = decoded; // { id, email, role, iat, exp }
        next();
    });
};

module.exports = verifyToken;