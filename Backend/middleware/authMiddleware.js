const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Not authorized, no token provided",
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Not authorized, user no longer exists",
            });
        }

        if (user.status !== "Active") {
            return res.status(401).json({
                success: false,
                message: "Your account is not active. Please contact an administrator.",
            });
        }

        req.user = {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
        };

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Not authorized, token invalid or expired",
        });
    }
};

exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "You do not have permission to access this resource",
            });
        }

        next();
    };
};
