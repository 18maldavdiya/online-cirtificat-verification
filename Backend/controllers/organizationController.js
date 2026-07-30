const Organization = require("../models/Organization");
const User = require("../models/User");
const {
    isValidId,
    getPagination,
    paginate,
    buildSearchQuery,
    validateEnum,
    handleWriteError,
} = require("../utils/apiHelpers");

const ALLOWED_TYPES = ["University", "College", "Institute", "Training Center"];
const ALLOWED_STATUSES = ["Verified", "Pending", "Inactive"];
const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

const formatOrganization = (org) => ({
    id: org._id,
    name: org.name,
    email: org.email,
    phone: org.phone,
    address: org.address,
    type: org.type,
    status: org.status,
    user: org.user,
    createdAt: org.createdAt,
    updatedAt: org.updatedAt,
});

// An organization-role user may only ever act on the Organization document
// linked to their own account.
const isOwner = (org, req) =>
    org.user && org.user.toString() === req.user.id;

// Validates a candidate `user` id for linking to an Organization: must be a
// real, existing account with role "organization", and not already linked to
// a different Organization document (the schema's unique index would catch
// this too, but checking here first gives a specific, actionable message
// instead of a generic duplicate-key error).
const validateLinkedUser = async (userId, currentOrgId) => {
    if (!isValidId(userId)) {
        return { status: 400, error: "Invalid linked user ID" };
    }

    const linkedUser = await User.findById(userId);
    if (!linkedUser || linkedUser.role !== "organization") {
        return { status: 400, error: "Linked user must be an existing account with the organization role" };
    }

    const conflict = await Organization.findOne({
        user: userId,
        ...(currentOrgId ? { _id: { $ne: currentOrgId } } : {}),
    });
    if (conflict) {
        return { status: 409, error: "This user account is already linked to another organization" };
    }

    return { status: null, error: null };
};

// @desc    Create a new organization
// @route   POST /api/organizations
// @access  Admin only
exports.createOrganization = async (req, res) => {
    try {
        const { name, email, phone, address, type, status, user } = req.body;

        if (!name || !email || !phone) {
            return res.status(400).json({
                success: false,
                message: "Please provide name, email and phone",
            });
        }

        if (!EMAIL_REGEX.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid email",
            });
        }

        const typeError = validateEnum(type, ALLOWED_TYPES, "Type");
        if (typeError) {
            return res.status(400).json({ success: false, message: typeError });
        }

        const statusError = validateEnum(status, ALLOWED_STATUSES, "Status");
        if (statusError) {
            return res.status(400).json({ success: false, message: statusError });
        }

        if (user) {
            const { status: linkedUserStatus, error: linkedUserError } = await validateLinkedUser(user, null);
            if (linkedUserError) {
                return res.status(linkedUserStatus).json({ success: false, message: linkedUserError });
            }
        }

        const existingOrg = await Organization.findOne({
            email: email.toLowerCase(),
        });

        if (existingOrg) {
            return res.status(409).json({
                success: false,
                message: "Organization already exists with this email",
            });
        }

        const org = await Organization.create({
            name,
            email,
            phone,
            address,
            type,
            status,
            user,
        });

        return res.status(201).json({
            success: true,
            organization: formatOrganization(org),
        });
    } catch (error) {
        return handleWriteError(res, error, {
            duplicateMessage: "Duplicate organization record",
            serverMessage: "Server error creating organization",
        });
    }
};

// @desc    Get all organizations (pagination, search, filter by type/status)
// @route   GET /api/organizations
// @access  Admin (all) / Organization (own only)
exports.getOrganizations = async (req, res) => {
    try {
        const pagination = getPagination(req.query);

        const query = {};

        if (req.user.role === "organization") {
            query.user = req.user.id;
        }

        const searchQuery = buildSearchQuery(req.query.search, ["name", "email"]);
        if (searchQuery) {
            Object.assign(query, searchQuery);
        }

        if (req.query.type) {
            const typeError = validateEnum(req.query.type, ALLOWED_TYPES, "Type filter");
            if (typeError) {
                return res.status(400).json({ success: false, message: typeError });
            }
            query.type = req.query.type;
        }

        if (req.query.status) {
            const statusError = validateEnum(req.query.status, ALLOWED_STATUSES, "Status filter");
            if (statusError) {
                return res.status(400).json({ success: false, message: statusError });
            }
            query.status = req.query.status;
        }

        const { items, total, pages } = await paginate(Organization, query, pagination);

        return res.status(200).json({
            success: true,
            count: items.length,
            total,
            page: pagination.page,
            pages,
            organizations: items.map(formatOrganization),
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error fetching organizations",
            error: error.message,
        });
    }
};

// @desc    Get a single organization
// @route   GET /api/organizations/:id
// @access  Admin (any) / Organization (own only)
exports.getOrganization = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid organization ID",
            });
        }

        const org = await Organization.findById(id);

        if (!org) {
            return res.status(404).json({
                success: false,
                message: "Organization not found",
            });
        }

        if (req.user.role === "organization" && !isOwner(org, req)) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to view this organization",
            });
        }

        return res.status(200).json({
            success: true,
            organization: formatOrganization(org),
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error fetching organization",
            error: error.message,
        });
    }
};

// @desc    Update an organization
// @route   PUT /api/organizations/:id
// @access  Admin (any field) / Organization (own profile, status is admin-only)
exports.updateOrganization = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid organization ID",
            });
        }

        const org = await Organization.findById(id);

        if (!org) {
            return res.status(404).json({
                success: false,
                message: "Organization not found",
            });
        }

        if (req.user.role === "organization" && !isOwner(org, req)) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to update this organization",
            });
        }

        const { name, email, phone, address, type, status, user } = req.body;

        if (name !== undefined) org.name = name;
        if (phone !== undefined) org.phone = phone;
        if (address !== undefined) org.address = address;

        if (email !== undefined) {
            if (!EMAIL_REGEX.test(email)) {
                return res.status(400).json({
                    success: false,
                    message: "Please provide a valid email",
                });
            }
            org.email = email.toLowerCase();
        }

        if (type !== undefined) {
            const typeError = validateEnum(type, ALLOWED_TYPES, "Type");
            if (typeError) {
                return res.status(400).json({ success: false, message: typeError });
            }
            org.type = type;
        }

        if (status !== undefined) {
            if (req.user.role !== "admin") {
                return res.status(403).json({
                    success: false,
                    message: "Only an admin can change organization status",
                });
            }
            const statusError = validateEnum(status, ALLOWED_STATUSES, "Status");
            if (statusError) {
                return res.status(400).json({ success: false, message: statusError });
            }
            org.status = status;
        }

        if (user !== undefined) {
            if (req.user.role !== "admin") {
                return res.status(403).json({
                    success: false,
                    message: "Only an admin can change the linked user account",
                });
            }

            if (user === null || user === "") {
                org.user = undefined;
            } else {
                const { status: linkedUserStatus, error: linkedUserError } = await validateLinkedUser(user, org._id);
                if (linkedUserError) {
                    return res.status(linkedUserStatus).json({ success: false, message: linkedUserError });
                }
                org.user = user;
            }
        }

        await org.save();

        return res.status(200).json({
            success: true,
            organization: formatOrganization(org),
        });
    } catch (error) {
        return handleWriteError(res, error, {
            duplicateMessage: "Email already in use",
            serverMessage: "Server error updating organization",
        });
    }
};

// @desc    Delete an organization
// @route   DELETE /api/organizations/:id
// @access  Admin only
exports.deleteOrganization = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid organization ID",
            });
        }

        const org = await Organization.findById(id);

        if (!org) {
            return res.status(404).json({
                success: false,
                message: "Organization not found",
            });
        }

        await org.deleteOne();

        return res.status(200).json({
            success: true,
            message: "Organization deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error deleting organization",
            error: error.message,
        });
    }
};
