const express = require("express");
const router = express.Router();

const {
    createUser,
    getUsers,
    getUser,
    updateUser,
    deleteUser,
} = require("../controllers/userController");

const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);

router.route("/").post(authorize("admin"), createUser).get(authorize("admin"), getUsers);

router.route("/:id").get(getUser).put(updateUser).delete(authorize("admin"), deleteUser);

module.exports = router;
