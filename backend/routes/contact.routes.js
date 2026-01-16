const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");

const {
  updateNickname,
  toggleBlock,
  clearChat,
  deleteContact,
} = require("../controllers/contact.controller");

router.patch("/:contactId/nickname", authMiddleware, updateNickname);

router.patch("/:contactId/block", authMiddleware, toggleBlock);

router.patch("/:contactId/clear", authMiddleware, clearChat);

router.delete("/:contactId", authMiddleware, deleteContact);

module.exports = router;
