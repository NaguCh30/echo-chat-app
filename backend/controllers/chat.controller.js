const Chat = require("../models/Chat");
const Message = require("../models/Message");
const Contact = require("../models/Contact");
const { getIO } = require("../socket");

// get existing chats and creating chats
exports.createOrGetChat = async (req, res) => {
  try {
    const { userId } = req.body;
    const currentUserId = req.userId;

    let chat = await Chat.findOne({
      participants: { $all: [currentUserId, userId] },
    }).populate("participants", "name email");

    if (chat) return res.json(chat);

    chat = await Chat.create({
      participants: [currentUserId, userId],
    });

    const populatedChat = await chat.populate("participants", "name email");
    res.status(201).json(populatedChat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// home screen chats
exports.getMyChats = async (req, res) => {
  try {
    const userId = req.userId;

    const chats = await Chat.find({
      participants: userId,
    })
      .populate("participants", "name email")
      .populate("lastMessage")
      .sort({ updatedAt: -1 });

    const result = [];

    for (const chat of chats) {
      const otherUser = chat.participants.find(
        (u) => u._id.toString() !== userId
      );

      const contact = await Contact.findOne({
        owner: userId,
        contactUser: otherUser._id,
        isDeleted: false,
      });

      // no contact don't show chat
      if (!contact) continue;

      result.push({
        ...chat.toObject(),
        displayName: contact.nickname || otherUser.name,
      });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// send message
exports.sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { text } = req.body;
    const senderId = req.userId;

    if (!text) {
      return res.status(400).json({ message: "Message text is required" });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    const receiverId = chat.participants.find(
      (id) => id.toString() !== senderId
    );

    //sender blocked receiver
    const senderContact = await Contact.findOne({
      owner: senderId,
      contactUser: receiverId,
      isBlocked: true,
      isDeleted: false,
    });

    if (senderContact) {
      return res.status(403).json({ message: "You blocked this contact" });
    }

    // receiver blocked sender
    const receiverContact = await Contact.findOne({
      owner: receiverId,
      contactUser: senderId,
      isBlocked: true,
      isDeleted: false,
    });

    if (receiverContact) {
      return res.status(403).json({ message: "You are blocked" });
    }

    const message = await Message.create({
      chatId,
      senderId,
      text,
      status: "sent",
    });

    chat.lastMessage = message._id;
    chat.updatedAt = new Date();
    await chat.save();

    const populatedMessage = await message.populate(
      "senderId",
      "name email"
    );

    const io = getIO();
    io.to(chatId).emit("newMessage", populatedMessage);

    chat.participants.forEach((uid) => {
      io.to(`user:${uid}`).emit("newMessage", {
        ...populatedMessage.toObject(),
        chatId,
      });
    });

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// get messages, clear chat supported
exports.getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.userId;

    const chat = await Chat.findById(chatId);
    const otherUser = chat.participants.find(
      (id) => id.toString() !== userId
    );

    const contact = await Contact.findOne({
      owner: userId,
      contactUser: otherUser,
      isDeleted: false,
    });

    const messages = await Message.find({
      chatId,
      deletedFor: { $ne: userId },
      createdAt: { $gt: contact?.clearedAt || new Date(0) },
    })
      .populate("senderId", "name email")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// mark msg as delivered
exports.markAsDelivered = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.userId;

    await Message.updateMany(
      {
        chatId,
        senderId: { $ne: userId },
        status: "sent",
      },
      { status: "delivered" }
    );

    const io = getIO();
    io.to(chatId).emit("messageDelivered");

    res.json({ message: "Messages marked as delivered" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// mark msg unseen
exports.markAsSeen = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.userId;

    await Message.updateMany(
      {
        chatId,
        senderId: { $ne: userId },
        status: { $in: ["sent", "delivered"] },
      },
      { status: "seen" }
    );

    const io = getIO();
    io.to(chatId).emit("messageSeen");

    res.json({ message: "Messages marked as seen" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// chat header details
exports.getChatDetails = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.userId;

    const chat = await Chat.findById(chatId).populate(
      "participants",
      "name email"
    );

    if (!chat) return res.status(404).json({ message: "Chat not found" });

    const otherUser = chat.participants.find(
      (p) => p._id.toString() !== userId
    );

    const contact = await Contact.findOne({
      owner: userId,
      contactUser: otherUser._id,
      isDeleted: false,
    });

    if (!contact)
      return res.status(404).json({ message: "Contact not found" });

    res.json({
      chatId,
      contactId: contact._id,
      nickname: contact.nickname,
      isBlocked: contact.isBlocked,
      contactUser: otherUser,
      clearedAt: contact.clearedAt,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
