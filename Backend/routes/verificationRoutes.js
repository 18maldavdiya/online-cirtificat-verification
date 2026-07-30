const express = require("express");
const router = express.Router();

const { verifyCertificate, getVerificationLogs } = require("../controllers/verificationController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Public — no authentication. Accepts either the human-readable certificateId
// or the non-guessable verificationToken encoded in the certificate's QR code.
router.get("/verify/:certificateId", verifyCertificate);

// Internal — JWT required, Admin (all) / Organization (their own certificates' logs).
router.get("/verification-logs", protect, authorize("admin", "organization"), getVerificationLogs);

module.exports = router;
