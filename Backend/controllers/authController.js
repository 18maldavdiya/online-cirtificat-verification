const jwt = require("jsonwebtoken");
const User = require("../models/User");

const ALLOWED_ROLES = ["admin", "organization", "user"];

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || "7d",
    });
};

const formatUser = (user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
});

// @desc    Register a new user (admin/organization/user)
// @route   POST /api/auth/register
exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide name, email and password",
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters",
            });
        }

        if (role && !ALLOWED_ROLES.includes(role)) {
            return res.status(400).json({
                success: false,
                message: `Role must be one of: ${ALLOWED_ROLES.join(", ")}`,
            });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "User already exists with this email",
            });
        }

        const user = await User.create({ name, email, password, role });

        const token = generateToken(user._id);

        return res.status(201).json({
            success: true,
            token,
            user: formatUser(user),
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error during registration",
            error: error.message,
        });
    }
};

// @desc    Login an existing user
// @route   POST /api/auth/login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide email and password",
            });
        }

        const user = await User.findOne({ email: email.toLowerCase() }).select(
            "+password"
        );

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        if (user.status !== "Active") {
            return res.status(401).json({
                success: false,
                message: "Your account is not active. Please contact an administrator.",
            });
        }

        const token = generateToken(user._id);

        return res.status(200).json({
            success: true,
            token,
            user: formatUser(user),
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error during login",
            error: error.message,
        });
    }
};

// @desc    Get the currently logged-in user
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            user: formatUser(user),
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        });
    }
};
