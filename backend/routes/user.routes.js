const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth");
const {
  getMe,
  getUserStatus,
  updateName,
  changePassword,
} = require("../controllers/user.controller");

router.get("/me", authMiddleware, getMe);
router.put("/name", authMiddleware, updateName);
router.get("/:userId/status", authMiddleware, getUserStatus);
router.put("/change-password", authMiddleware, changePassword);

module.exports = router;
