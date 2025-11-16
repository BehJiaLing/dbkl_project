const express = require("express");
const router = express.Router();
const multer = require("multer");
const verifyToken = require("../middleware/authMiddleware");
const UserController = require("../controllers/userController");

// verification / check-in
router.get("/user-data", UserController.getUserData);
router.put("/update-status", UserController.updateUserStatus);
router.put("/increment-submit-attend", UserController.incrementSubmitAttend);

// user list page
router.patch("/soft-delete/:id", verifyToken, UserController.softDeleteUser);

const upload = multer(); // in-memory
router.post(
    "/create",
    verifyToken,
    upload.single("image"),
    UserController.createUser
);

module.exports = router;
