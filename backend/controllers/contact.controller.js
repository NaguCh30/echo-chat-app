const Contact = require("../models/Contact");
const Message = require("../models/Message");

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

// delete contact
exports.deleteContact = async (req, res) => {
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
};
