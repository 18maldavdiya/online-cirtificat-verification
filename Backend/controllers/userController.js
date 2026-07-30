const User = require("../models/User");
const {
    isValidId,
    getPagination,
    paginate,
    buildSearchQuery,
    validateEnum,
    handleWriteError,
} = require("../utils/apiHelpers");

const ALLOWED_ROLES = ["admin", "organization", "user"];
const ALLOWED_STATUSES = ["Active", "Inactive", "Pending"];

const formatUser = (user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
});

// @desc    Create a new user
// @route   POST /api/users
// @access  Admin only
exports.createUser = async (req, res) => {
    try {
        const { name, email, password, role, status } = req.body;

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

        const roleError = validateEnum(role, ALLOWED_ROLES, "Role");
        if (roleError) {
            return res.status(400).json({ success: false, message: roleError });
        }

        const statusError = validateEnum(status, ALLOWED_STATUSES, "Status");
        if (statusError) {
            return res.status(400).json({ success: false, message: statusError });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "User already exists with this email",
            });
        }

        const user = await User.create({ name, email, password, role, status });

        return res.status(201).json({
            success: true,
            user: formatUser(user),
        });
    } catch (error) {
        return handleWriteError(res, error, {
            duplicateMessage: "User already exists with this email",
            serverMessage: "Server error creating user",
        });
    }
};

// @desc    Get all users (pagination, search, filter by role/status)
// @route   GET /api/users
// @access  Admin only
exports.getUsers = async (req, res) => {
    try {
        const pagination = getPagination(req.query);

        const query = {};

        const searchQuery = buildSearchQuery(req.query.search, ["name", "email"]);
        if (searchQuery) {
            Object.assign(query, searchQuery);
        }

        if (req.query.role) {
            const roleError = validateEnum(req.query.role, ALLOWED_ROLES, "Role filter");
            if (roleError) {
                return res.status(400).json({ success: false, message: roleError });
            }
            query.role = req.query.role;
        }

        if (req.query.status) {
            const statusError = validateEnum(req.query.status, ALLOWED_STATUSES, "Status filter");
            if (statusError) {
                return res.status(400).json({ success: false, message: statusError });
            }
            query.status = req.query.status;
        }

        const { items, total, pages } = await paginate(User, query, pagination);

        return res.status(200).json({
            success: true,
            count: items.length,
            total,
            page: pagination.page,
            pages,
            users: items.map(formatUser),
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error fetching users",
            error: error.message,
        });
    }
};

// @desc    Get a single user
// @route   GET /api/users/:id
// @access  Admin (any user) or the user themselves
exports.getUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID",
            });
        }

        if (req.user.role !== "admin" && req.user.id !== id) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to view this user",
            });
        }

        const user = await User.findById(id);

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
            message: "Server error fetching user",
            error: error.message,
        });
    }
};

// @desc    Update a user
// @route   PUT /api/users/:id
// @access  Admin (any field) or the user themselves (name/email/password only)
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID",
            });
        }

        if (req.user.role !== "admin" && req.user.id !== id) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to update this user",
            });
        }

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const { name, email, password, role, status } = req.body;

        if (name !== undefined) user.name = name;
        if (email !== undefined) user.email = email.toLowerCase();

        if (password !== undefined) {
            if (password.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: "Password must be at least 6 characters",
                });
            }
            user.password = password;
        }

        // Only an admin may change role or status
        if (role !== undefined || status !== undefined) {
            if (req.user.role !== "admin") {
                return res.status(403).json({
                    success: false,
                    message: "Only an admin can change role or status",
                });
            }

            const roleError = validateEnum(role, ALLOWED_ROLES, "Role");
            if (roleError) {
                return res.status(400).json({ success: false, message: roleError });
            }
            if (role !== undefined) user.role = role;

            const statusError = validateEnum(status, ALLOWED_STATUSES, "Status");
            if (statusError) {
                return res.status(400).json({ success: false, message: statusError });
            }
            if (status !== undefined) user.status = status;
        }

        await user.save();

        return res.status(200).json({
            success: true,
            user: formatUser(user),
        });
    } catch (error) {
        return handleWriteError(res, error, {
            duplicateMessage: "Email already in use",
            serverMessage: "Server error updating user",
        });
    }
};

// @desc    Delete a user
// @route   DELETE /api/users/:id
// @access  Admin only
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID",
            });
        }

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        await user.deleteOne();

        return res.status(200).json({
            success: true,
            message: "User deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error deleting user",
            error: error.message,
        });
    }
};
