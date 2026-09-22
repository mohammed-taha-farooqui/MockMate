const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Candidate = require("../models/Candidate");

const JWT_SECRET = process.env.JWT_SECRET || "mockmate_super_secret_jwt_key_2026_xaviers";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

/**
 * Generate signed JWT token
 */
const generateToken = (candidate) => {
    return jwt.sign(
        {
            id: candidate._id.toString(),
            email: candidate.email
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
};

/**
 * POST /api/auth/register
 * Registers a new candidate account.
 */
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body || {};

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Full name is required."
            });
        }

        if (!email || !email.trim()) {
            return res.status(400).json({
                success: false,
                message: "Email address is required."
            });
        }

        // Basic email regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address."
            });
        }

        if (!password || password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters long."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Check if candidate already exists
        const existingCandidate = await Candidate.findOne({ email: normalizedEmail });
        if (existingCandidate) {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists."
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new Candidate
        const candidate = await Candidate.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword
        });

        const token = generateToken(candidate);

        return res.status(201).json({
            success: true,
            token,
            user: {
                id: candidate._id.toString(),
                name: candidate.name,
                email: candidate.email
            }
        });
    } catch (err) {
        console.error("[AuthController] Registration error:", err);
        return res.status(500).json({
            success: false,
            message: "An error occurred during registration. Please try again."
        });
    }
};

/**
 * POST /api/auth/login
 * Authenticates a candidate with email and password.
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body || {};

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Query candidate with password included
        const candidate = await Candidate.findOne({ email: normalizedEmail }).select("+password");
        if (!candidate || !candidate.password) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password. Please try again."
            });
        }

        const isMatch = await bcrypt.compare(password, candidate.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password. Please try again."
            });
        }

        const token = generateToken(candidate);

        return res.status(200).json({
            success: true,
            token,
            user: {
                id: candidate._id.toString(),
                name: candidate.name,
                email: candidate.email
            }
        });
    } catch (err) {
        console.error("[AuthController] Login error:", err);
        return res.status(500).json({
            success: false,
            message: "An error occurred during login. Please try again."
        });
    }
};

/**
 * POST /api/auth/logout
 * Server acknowledgement for logout.
 */
const logout = async (req, res) => {
    return res.status(200).json({
        success: true,
        message: "Logged out successfully."
    });
};

/**
 * GET /api/auth/me
 * Retrieves current candidate's profile.
 */
const getMe = async (req, res) => {
    try {
        const user = {
            id: req.user._id.toString(),
            name: req.user.name,
            email: req.user.email,
            phone: req.user.phone || ""
        };

        return res.status(200).json({
            success: true,
            user,
            name: req.user.name,
            email: req.user.email
        });
    } catch (err) {
        console.error("[AuthController] getMe error:", err);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch user profile."
        });
    }
};

module.exports = {
    register,
    login,
    logout,
    getMe
};
