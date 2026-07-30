const Certificate = require("../models/Certificate");
const Organization = require("../models/Organization");
const {
    isValidId,
    getPagination,
    paginate,
    buildSearchQuery,
    validateEnum,
    handleWriteError,
} = require("../utils/apiHelpers");

const ALLOWED_CERT_TYPES = ["Completion", "Achievement", "Participation"];
const ALLOWED_STATUSES = ["Draft", "Pending", "Verified", "Revoked", "Expired"];
const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

const formatCertificate = (cert) => ({
    id: cert._id,
    certificateId: cert.certificateId,
    recipientName: cert.recipientName,
    recipientEmail: cert.recipientEmail,
    student: cert.student,
    course: cert.course,
    organization: cert.organization,
    issuedBy: cert.issuedBy,
    certificateType: cert.certificateType,
    issueDate: cert.issueDate,
    expiryDate: cert.expiryDate,
    status: cert.status,
    qrCode: cert.qrCode,
    fileUrl: cert.fileUrl,
    createdAt: cert.createdAt,
    updatedAt: cert.updatedAt,
});

// The Organization document owned by the logged-in organization-role user.
const getOwnedOrganization = (req) => Organization.findOne({ user: req.user.id });

const isCertOwnedByOrgUser = async (cert, req) => {
    const org = await getOwnedOrganization(req);
    return !!(org && cert.organization && cert.organization.toString() === org._id.toString());
};

const isCertOwnedByStudent = (cert, req) =>
    (cert.student && cert.student.toString() === req.user.id) ||
    (cert.recipientEmail && cert.recipientEmail === req.user.email);

// @desc    Issue a new certificate
// @route   POST /api/certificates
// @access  Admin (any organization) / Organization (their own organization only)
exports.createCertificate = async (req, res) => {
    try {
        const {
            certificateId,
            recipientName,
            recipientEmail,
            student,
            course,
            organization,
            certificateType,
            issueDate,
            expiryDate,
            status,
        } = req.body;

        if (!certificateId || !recipientName || !recipientEmail || !course) {
            return res.status(400).json({
                success: false,
                message: "Please provide certificateId, recipientName, recipientEmail and course",
            });
        }

        if (!EMAIL_REGEX.test(recipientEmail)) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid recipient email",
            });
        }

        if (student !== undefined && student !== null && !isValidId(student)) {
            return res.status(400).json({
                success: false,
                message: "Invalid student ID",
            });
        }

        const typeError = validateEnum(certificateType, ALLOWED_CERT_TYPES, "Certificate type");
        if (typeError) {
            return res.status(400).json({ success: false, message: typeError });
        }

        const statusError = validateEnum(status, ALLOWED_STATUSES, "Status");
        if (statusError) {
            return res.status(400).json({ success: false, message: statusError });
        }

        let organizationId = organization;

        if (req.user.role === "organization") {
            // Organization-role users may only issue certificates on behalf of
            // the Organization document linked to their own account.
            const ownOrg = await getOwnedOrganization(req);
            if (!ownOrg) {
                return res.status(403).json({
                    success: false,
                    message: "No organization profile is linked to your account",
                });
            }
            organizationId = ownOrg._id;
        } else {
            if (!organization) {
                return res.status(400).json({
                    success: false,
                    message: "Please provide the issuing organization ID",
                });
            }
            if (!isValidId(organization)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid organization ID",
                });
            }
            const orgExists = await Organization.findById(organization);
            if (!orgExists) {
                return res.status(404).json({
                    success: false,
                    message: "Organization not found",
                });
            }
        }

        const existingCert = await Certificate.findOne({
            certificateId: certificateId.trim().toUpperCase(),
        });

        if (existingCert) {
            return res.status(409).json({
                success: false,
                message: "A certificate with this ID already exists",
            });
        }

        const cert = await Certificate.create({
            certificateId,
            recipientName,
            recipientEmail,
            student,
            course,
            organization: organizationId,
            issuedBy: req.user.id,
            certificateType,
            issueDate,
            expiryDate,
            status,
        });

        return res.status(201).json({
            success: true,
            certificate: formatCertificate(cert),
        });
    } catch (error) {
        return handleWriteError(res, error, {
            duplicateMessage: "A certificate with this ID already exists",
            serverMessage: "Server error issuing certificate",
        });
    }
};

// @desc    Get all certificates (pagination, search, filter)
// @route   GET /api/certificates
// @access  Admin (all) / Organization (own only) / User (own only)
exports.getCertificates = async (req, res) => {
    try {
        const pagination = getPagination(req.query);
        const query = {};

        if (req.user.role === "organization") {
            const ownOrg = await getOwnedOrganization(req);
            // No linked organization -> guaranteed empty result set, not an error.
            query.organization = ownOrg ? ownOrg._id : null;
        } else if (req.user.role === "user") {
            query.$or = [{ student: req.user.id }, { recipientEmail: req.user.email }];
        }

        const searchQuery = buildSearchQuery(req.query.search, [
            "certificateId",
            "recipientName",
            "recipientEmail",
            "course",
        ]);

        if (searchQuery) {
            if (query.$or) {
                query.$and = [{ $or: query.$or }, searchQuery];
                delete query.$or;
            } else {
                Object.assign(query, searchQuery);
            }
        }

        if (req.query.status) {
            const statusError = validateEnum(req.query.status, ALLOWED_STATUSES, "Status filter");
            if (statusError) {
                return res.status(400).json({ success: false, message: statusError });
            }
            query.status = req.query.status;
        }

        if (req.query.certificateType) {
            const typeError = validateEnum(
                req.query.certificateType,
                ALLOWED_CERT_TYPES,
                "Certificate type filter"
            );
            if (typeError) {
                return res.status(400).json({ success: false, message: typeError });
            }
            query.certificateType = req.query.certificateType;
        }

        if (req.query.organization && req.user.role === "admin") {
            if (!isValidId(req.query.organization)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid organization filter ID",
                });
            }
            query.organization = req.query.organization;
        }

        const { items, total, pages } = await paginate(Certificate, query, pagination);

        return res.status(200).json({
            success: true,
            count: items.length,
            total,
            page: pagination.page,
            pages,
            certificates: items.map(formatCertificate),
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error fetching certificates",
            error: error.message,
        });
    }
};

// @desc    Get a single certificate
// @route   GET /api/certificates/:id
// @access  Admin (any) / Organization (own certs) / User (own certs)
exports.getCertificate = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid certificate ID",
            });
        }

        const cert = await Certificate.findById(id);

        if (!cert) {
            return res.status(404).json({
                success: false,
                message: "Certificate not found",
            });
        }

        if (req.user.role === "organization") {
            const owned = await isCertOwnedByOrgUser(cert, req);
            if (!owned) {
                return res.status(403).json({
                    success: false,
                    message: "You are not authorized to view this certificate",
                });
            }
        } else if (req.user.role === "user" && !isCertOwnedByStudent(cert, req)) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to view this certificate",
            });
        }

        return res.status(200).json({
            success: true,
            certificate: formatCertificate(cert),
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error fetching certificate",
            error: error.message,
        });
    }
};

// @desc    Update a certificate
// @route   PUT /api/certificates/:id
// @access  Admin (any field) / Organization (own certs; not organization reassignment)
exports.updateCertificate = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid certificate ID",
            });
        }

        const cert = await Certificate.findById(id);

        if (!cert) {
            return res.status(404).json({
                success: false,
                message: "Certificate not found",
            });
        }

        if (req.user.role === "organization") {
            const owned = await isCertOwnedByOrgUser(cert, req);
            if (!owned) {
                return res.status(403).json({
                    success: false,
                    message: "You are not authorized to update this certificate",
                });
            }
        }

        const {
            recipientName,
            recipientEmail,
            student,
            course,
            certificateType,
            issueDate,
            expiryDate,
            status,
            organization,
        } = req.body;

        if (recipientName !== undefined) cert.recipientName = recipientName;
        if (course !== undefined) cert.course = course;
        if (issueDate !== undefined) cert.issueDate = issueDate;
        if (expiryDate !== undefined) cert.expiryDate = expiryDate;

        if (recipientEmail !== undefined) {
            if (!EMAIL_REGEX.test(recipientEmail)) {
                return res.status(400).json({
                    success: false,
                    message: "Please provide a valid recipient email",
                });
            }
            cert.recipientEmail = recipientEmail;
        }

        if (student !== undefined) {
            if (student !== null && !isValidId(student)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid student ID",
                });
            }
            cert.student = student;
        }

        if (certificateType !== undefined) {
            const typeError = validateEnum(certificateType, ALLOWED_CERT_TYPES, "Certificate type");
            if (typeError) {
                return res.status(400).json({ success: false, message: typeError });
            }
            cert.certificateType = certificateType;
        }

        if (status !== undefined) {
            const statusError = validateEnum(status, ALLOWED_STATUSES, "Status");
            if (statusError) {
                return res.status(400).json({ success: false, message: statusError });
            }
            cert.status = status;
        }

        // Only an admin may reassign a certificate to a different organization
        if (organization !== undefined) {
            if (req.user.role !== "admin") {
                return res.status(403).json({
                    success: false,
                    message: "Only an admin can reassign a certificate's organization",
                });
            }
            if (!isValidId(organization)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid organization ID",
                });
            }
            const orgExists = await Organization.findById(organization);
            if (!orgExists) {
                return res.status(404).json({
                    success: false,
                    message: "Organization not found",
                });
            }
            cert.organization = organization;
        }

        await cert.save();

        return res.status(200).json({
            success: true,
            certificate: formatCertificate(cert),
        });
    } catch (error) {
        return handleWriteError(res, error, {
            duplicateMessage: "A certificate with this ID already exists",
            serverMessage: "Server error updating certificate",
        });
    }
};

// @desc    Delete a certificate
// @route   DELETE /api/certificates/:id
// @access  Admin (any) / Organization (own certs only)
exports.deleteCertificate = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid certificate ID",
            });
        }

        const cert = await Certificate.findById(id);

        if (!cert) {
            return res.status(404).json({
                success: false,
                message: "Certificate not found",
            });
        }

        if (req.user.role === "organization") {
            const owned = await isCertOwnedByOrgUser(cert, req);
            if (!owned) {
                return res.status(403).json({
                    success: false,
                    message: "You are not authorized to delete this certificate",
                });
            }
        }

        await cert.deleteOne();

        return res.status(200).json({
            success: true,
            message: "Certificate deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error deleting certificate",
            error: error.message,
        });
    }
};
