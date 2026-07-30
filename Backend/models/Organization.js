const mongoose = require("mongoose");

const organizationSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Organization name is required"],
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Organization email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
        },
        phone: {
            type: String,
            required: [true, "Phone number is required"],
            trim: true,
        },
        address: {
            type: String,
            trim: true,
        },
        type: {
            type: String,
            enum: ["University", "College", "Institute", "Training Center"],
            default: "Institute",
        },
        status: {
            type: String,
            enum: ["Verified", "Pending", "Inactive"],
            default: "Pending",
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            unique: true,
            sparse: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Organization", organizationSchema);
