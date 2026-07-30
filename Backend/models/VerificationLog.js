const mongoose = require("mongoose");

const verificationLogSchema = new mongoose.Schema(
    {
        certificate: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Certificate",
            // Intentionally optional: a verification attempt against a
            // nonexistent/bogus code still needs to be logged for audit purposes,
            // and there is no certificate document to reference in that case.
        },
        // What the caller actually submitted, recorded only when it didn't
        // resolve to a real certificate (kept null otherwise to avoid duplication).
        attemptedCode: {
            type: String,
            trim: true,
        },
        verifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        verifierName: {
            type: String,
            trim: true,
            default: "Public User",
        },
        result: {
            type: String,
            enum: ["Success", "Failed"],
            required: [true, "Verification result is required"],
        },
        ipAddress: {
            type: String,
            trim: true,
        },
        userAgent: {
            type: String,
            trim: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("VerificationLog", verificationLogSchema);
