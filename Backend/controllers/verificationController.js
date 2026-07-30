const Certificate = require("../models/Certificate");
const Organization = require("../models/Organization");
const VerificationLog = require("../models/VerificationLog");
const { isValidId, getPagination, paginate, validateEnum } = require("../utils/apiHelpers");

// Verification attempts from the same IP against the same certificate (or the
// same bogus code) within this window are not re-logged, per instruction to
// prevent duplicate verification log entries for the same request.
const DUPLICATE_LOG_WINDOW_MS = 60 * 1000;

const getClientIp = (req) => {
    const forwarded = req.headers["x-forwarded-for"];
    if (forwarded) {
        return forwarded.split(",")[0].trim();
    }
    return req.ip || req.socket?.remoteAddress || null;
};

const isCertificateCurrentlyValid = (cert) => {
    if (cert.status !== "Verified") {
        return false;
    }
    if (cert.expiryDate && new Date(cert.expiryDate).getTime() < Date.now()) {
        return false;
    }
    return true;
};

// Public-facing certificate view: no _id, no student/issuedBy ObjectIds, no
// verification token. Only what a third party legitimately needs to see.
const formatPublicCertificate = (cert) => ({
    certificateId: cert.certificateId,
    recipientName: cert.recipientName,
    course: cert.course,
    organization: cert.organization && cert.organization.name ? cert.organization.name : null,
    certificateType: cert.certificateType,
    issueDate: cert.issueDate,
    expiryDate: cert.expiryDate,
    status: cert.status,
});

const wasRecentlyLogged = async ({ certificateId, attemptedCode, ip }) => {
    const since = new Date(Date.now() - DUPLICATE_LOG_WINDOW_MS);
    const filter = { ipAddress: ip || null, createdAt: { $gte: since } };

    if (certificateId) {
        filter.certificate = certificateId;
    } else {
        filter.certificate = null;
        filter.attemptedCode = attemptedCode;
    }

    const existing = await VerificationLog.findOne(filter);
    return !!existing;
};

// @desc    Publicly verify a certificate by its certificateId or its
//          non-guessable verificationToken (the value a QR code encodes)
// @route   GET /api/verify/:certificateId
// @access  Public
exports.verifyCertificate = async (req, res) => {
    try {
        const code = (req.params.certificateId || "").trim();

        if (!code) {
            return res.status(400).json({
                success: false,
                message: "A certificate ID or verification code is required",
            });
        }

        const ip = getClientIp(req);
        const userAgent = req.headers["user-agent"] || null;

        const cert = await Certificate.findOne({
            $or: [{ verificationToken: code }, { certificateId: code.toUpperCase() }],
        }).populate("organization", "name type");

        if (!cert) {
            const skip = await wasRecentlyLogged({ certificateId: null, attemptedCode: code, ip });

            if (!skip) {
                await VerificationLog.create({
                    certificate: null,
                    attemptedCode: code,
                    result: "Failed",
                    ipAddress: ip,
                    userAgent,
                });
            }

            return res.status(200).json({
                success: true,
                valid: false,
                message: "Certificate not found or invalid",
            });
        }

        const valid = isCertificateCurrentlyValid(cert);
        const skip = await wasRecentlyLogged({ certificateId: cert._id, attemptedCode: null, ip });

        if (!skip) {
            await VerificationLog.create({
                certificate: cert._id,
                result: valid ? "Success" : "Failed",
                ipAddress: ip,
                userAgent,
            });
        }

        let message = "Certificate is valid";
        if (!valid) {
            const expired = cert.expiryDate && new Date(cert.expiryDate).getTime() < Date.now();
            message = expired
                ? "Certificate has expired"
                : `Certificate found but is ${cert.status.toLowerCase()}`;
        }

        return res.status(200).json({
            success: true,
            valid,
            message,
            certificate: formatPublicCertificate(cert),
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error verifying certificate",
            error: error.message,
        });
    }
};

// @desc    Get verification logs (pagination, filter by result/certificate)
// @route   GET /api/verification-logs
// @access  Admin (all logs) / Organization (logs for their own certificates only)
exports.getVerificationLogs = async (req, res) => {
    try {
        const pagination = getPagination(req.query);
        const query = {};

        if (req.query.result) {
            const resultError = validateEnum(req.query.result, ["Success", "Failed"], "Result filter");
            if (resultError) {
                return res.status(400).json({ success: false, message: resultError });
            }
            query.result = req.query.result;
        }

        if (req.user.role === "organization") {
            const ownOrg = await Organization.findOne({ user: req.user.id });
            const orgCertIds = ownOrg
                ? await Certificate.find({ organization: ownOrg._id }).distinct("_id")
                : [];

            if (req.query.certificate) {
                if (!isValidId(req.query.certificate)) {
                    return res.status(400).json({ success: false, message: "Invalid certificate ID" });
                }
                const withinScope = orgCertIds.some((certId) => certId.toString() === req.query.certificate);
                if (!withinScope) {
                    return res.status(403).json({
                        success: false,
                        message: "You are not authorized to view logs for this certificate",
                    });
                }
                query.certificate = req.query.certificate;
            } else {
                query.certificate = { $in: orgCertIds };
            }
        } else if (req.query.certificate) {
            if (!isValidId(req.query.certificate)) {
                return res.status(400).json({ success: false, message: "Invalid certificate ID" });
            }
            query.certificate = req.query.certificate;
        }

        const { items, total, pages } = await paginate(VerificationLog, query, pagination);
        const populatedItems = await VerificationLog.populate(items, {
            path: "certificate",
            select: "certificateId recipientName course status",
        });

        return res.status(200).json({
            success: true,
            count: populatedItems.length,
            total,
            page: pagination.page,
            pages,
            logs: populatedItems.map((log) => ({
                id: log._id,
                certificate: log.certificate,
                attemptedCode: log.attemptedCode,
                verifierName: log.verifierName,
                result: log.result,
                ipAddress: log.ipAddress,
                userAgent: log.userAgent,
                createdAt: log.createdAt,
            })),
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error fetching verification logs",
            error: error.message,
        });
    }
};
