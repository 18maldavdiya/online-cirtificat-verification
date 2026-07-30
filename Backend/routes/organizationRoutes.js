const express = require("express");
const router = express.Router();

const {
    createOrganization,
    getOrganizations,
    getOrganization,
    updateOrganization,
    deleteOrganization,
} = require("../controllers/organizationController");

const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);

router
    .route("/")
    .post(authorize("admin"), createOrganization)
    .get(authorize("admin", "organization"), getOrganizations);

router
    .route("/:id")
    .get(authorize("admin", "organization"), getOrganization)
    .put(authorize("admin", "organization"), updateOrganization)
    .delete(authorize("admin"), deleteOrganization);

module.exports = router;
