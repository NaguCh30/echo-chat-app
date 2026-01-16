const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth");
const {
  createOrGetChat,
  getMyChats,
  sendMessage,
  getMessages,
  markAsDelivered,
  markAsSeen,
  getChatDetails,
} = require("../controllers/chat.controller");

router.get("/", authMiddleware, getMyChats);
router.post("/", authMiddleware, createOrGetChat);

router.get("/:chatId/details", authMiddleware, getChatDetails);
router.get("/:chatId/messages", authMiddleware, getMessages);
router.post("/:chatId/message", authMiddleware, sendMessage);

router.put("/:chatId/delivered", authMiddleware, markAsDelivered);
router.put("/:chatId/seen", authMiddleware, markAsSeen);

module.exports = router;
