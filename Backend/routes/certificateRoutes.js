const express = require("express");
const router = express.Router();

const {
    createCertificate,
    getCertificates,
    getCertificate,
    updateCertificate,
    deleteCertificate,
    downloadCertificatePdf,
} = require("../controllers/certificateController");

const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);

router
    .route("/")
    .post(authorize("admin", "organization"), createCertificate)
    .get(authorize("admin", "organization", "user"), getCertificates);

router
    .route("/:id")
    .get(authorize("admin", "organization", "user"), getCertificate)
    .put(authorize("admin", "organization"), updateCertificate)
    .delete(authorize("admin", "organization"), deleteCertificate);

router
    .route("/:id/pdf")
    .get(authorize("admin", "organization", "user"), downloadCertificatePdf);

module.exports = router;
