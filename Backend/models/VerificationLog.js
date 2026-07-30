const mongoose = require("mongoose");

const verificationLogSchema = new mongoose.Schema(
    {
        certificate: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Certificate",
            required: [true, "Certificate reference is required"],
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
    },
    { timestamps: true }
);

module.exports = mongoose.model("VerificationLog", verificationLogSchema);
