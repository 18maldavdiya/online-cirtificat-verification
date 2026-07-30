const mongoose = require("mongoose");
const crypto = require("crypto");

const certificateSchema = new mongoose.Schema(
    {
        certificateId: {
            type: String,
            required: [true, "Certificate ID is required"],
            unique: true,
            trim: true,
            uppercase: true,
        },
        // Non-guessable public identifier used for QR-code verification links.
        // Generated automatically so every code path that creates a Certificate
        // (now or in the future) gets one, without controllers needing to remember to.
        verificationToken: {
            type: String,
            unique: true,
            index: true,
            default: () => crypto.randomBytes(24).toString("hex"),
        },
        recipientName: {
            type: String,
            required: [true, "Recipient name is required"],
            trim: true,
        },
        recipientEmail: {
            type: String,
            required: [true, "Recipient email is required"],
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
        },
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        course: {
            type: String,
            required: [true, "Course / program name is required"],
            trim: true,
        },
        organization: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Organization",
            required: [true, "Issuing organization is required"],
        },
        issuedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        certificateType: {
            type: String,
            enum: ["Completion", "Achievement", "Participation"],
            default: "Completion",
        },
        issueDate: {
            type: Date,
            required: [true, "Issue date is required"],
            default: Date.now,
        },
        expiryDate: {
            type: Date,
        },
        status: {
            type: String,
            enum: ["Draft", "Pending", "Verified", "Revoked", "Expired"],
            default: "Pending",
        },
        qrCode: {
            type: String,
        },
        fileUrl: {
            type: String,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Certificate", certificateSchema);
