const jwt = require("jsonwebtoken");
const Candidate = require("../models/Candidate");

const JWT_SECRET = process.env.JWT_SECRET || "mockmate_super_secret_jwt_key_2026_xaviers";

/**
 * Middleware to authenticate requests via JWT Bearer token.
 */
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers["authorization"] || req.headers["Authorization"];
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authentication required. Please provide a valid Bearer token."
            });
        }

        const token = authHeader.split(" ")[1];
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication token missing."
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const candidate = await Candidate.findById(decoded.id);
        if (!candidate) {
            return res.status(401).json({
                success: false,
                message: "User account no longer exists."
            });
        }

        req.user = candidate;
        next();
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Session expired. Please log in again."
            });
        }
        return res.status(401).json({
            success: false,
            message: "Invalid authentication token."
        });
    }
};

module.exports = { authenticateToken };
