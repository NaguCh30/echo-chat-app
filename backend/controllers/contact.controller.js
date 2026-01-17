const Contact = require("../models/Contact");
const Chat = require("../models/Chat");
const Message = require("../models/Message");
const { getIO } = require("../socket");

// edit nickname
exports.updateNickname = async (req, res) => {
  const { contactId } = req.params;
  const { nickname } = req.body;

  const contact = await Contact.findOne({
    _id: contactId,
    owner: req.userId,
    isDeleted: false,
  });

  if (!contact) {
    return res.status(404).json({ message: "Contact not found" });
  }

  contact.nickname = nickname || null;
  await contact.save();

  res.json({ message: "Nickname updated", nickname: contact.nickname });
};

// block, unblock
exports.toggleBlock = async (req, res) => {
  try {
    const { contactId } = req.params;

    const contact = await Contact.findOne({
      _id: contactId,
      owner: req.userId,
      isDeleted: false,
    });

    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    contact.isBlocked = !contact.isBlocked;
    await contact.save();

    res.json({
      isBlocked: contact.isBlocked,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// clear chat
exports.clearChat = async (req, res) => {
  const { contactId } = req.params;

  const contact = await Contact.findOne({
    _id: contactId,
    owner: req.userId,
    isDeleted: false,
  });

  if (!contact) {
    return res.status(404).json({ message: "Contact not found" });
  }

  contact.clearedAt = new Date();
  await contact.save();

  res.json({ message: "Chat cleared" });
};

// delete contact new, two side delete

exports.deleteContact = async (req, res) => {
  try {
    const { contactId } = req.params;
    const userId = req.userId;

    //  Find contact (A → B)
    const contact = await Contact.findOne({
      _id: contactId,
      owner: userId,
      isDeleted: false,
    });

    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    const otherUserId = contact.contactUser;

    //  Delete BOTH contacts
    await Contact.updateMany(
      {
        $or: [
          { owner: userId, contactUser: otherUserId },
          { owner: otherUserId, contactUser: userId },
        ],
      },
      {
        isDeleted: true,
        clearedAt: new Date(),
      }
    );

    //  Find shared chat
    const chat = await Chat.findOne({
      participants: { $all: [userId, otherUserId] },
    });

    if (chat) {
      //  Delete all messages
      await Message.deleteMany({ chatId: chat._id });

      //  Delete chat
      await Chat.findByIdAndDelete(chat._id);

      //  Realtime notify both users
      const io = getIO();
      io.to(`user:${userId}`).emit("chatDeleted", {
        chatId: chat._id,
      });

      io.to(`user:${otherUserId}`).emit("chatDeleted", {
        chatId: chat._id,
      });
    }

    res.json({ message: "Contact and chat deleted for both users" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



//delete contact old, one side delete
/*exports.deleteContact = async (req, res) => {
  try {
    const { contactId } = req.params;

    const contact = await Contact.findOne({
      _id: contactId,
      owner: req.userId,
      isDeleted: false,
    });

    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    contact.isDeleted = true;
    contact.clearedAt = new Date();
    await contact.save();

    res.json({ message: "Contact deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};*/
