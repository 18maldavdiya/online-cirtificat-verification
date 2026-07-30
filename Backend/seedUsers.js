// One-time script to create demo login accounts.
// Run with: node seedUsers.js

require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("./config/db");
const User = require("./models/User");

const DEMO_ACCOUNTS = [
    {
        label: "Admin",
        name: "Admin",
        email: "admin@gmail.com",
        password: "Admin@123",
        role: "admin",
    },
    {
        label: "Organization",
        name: "Demo Organization",
        email: "org@gmail.com",
        password: "Org@123",
        role: "organization",
    },
    {
        label: "User",
        name: "Demo User",
        email: "student@gmail.com",
        password: "Student@123",
        role: "user",
    },
];

async function seed() {
    await connectDB();

    for (const account of DEMO_ACCOUNTS) {
        const existing = await User.findOne({ email: account.email.toLowerCase() });

        if (existing) {
            console.log("✓ Already Exists");
            continue;
        }

        // Plain-text password here is intentional - User's pre("save") hook
        // hashes it automatically, same as every other path that creates a User.
        await User.create({
            name: account.name,
            email: account.email,
            password: account.password,
            role: account.role,
        });

        console.log(`✓ ${account.label} Created`);
    }

    await mongoose.connection.close();
    process.exit(0);
}

seed().catch((error) => {
    console.error("Seeding failed:", error.message);
    process.exit(1);
});
