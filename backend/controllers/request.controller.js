const User = require("../models/User");
const ContactRequest = require("../models/ContactRequest");
const Chat = require("../models/Chat");
const Contact = require("../models/Contact");

// send request
exports.sendRequest = async (req, res) => {
  const senderId = req.userId;
  const { email, name } = req.body;

  if (!email || !name) {
    return res.status(400).json({ message: "Email and name required" });
  }

  const receiver = await User.findOne({ email });
  if (!receiver) {
    return res.status(404).json({ message: "User not found" });
  }

  if (receiver._id.toString() === senderId) {
    return res.status(400).json({ message: "Cannot add yourself" });
  }

  // already exist check
  const existingContact = await Contact.findOne({
    owner: senderId,
    contactUser: receiver._id,
    isDeleted: false,
  });

  if (existingContact) {
    const chat = await Chat.findOne({
      participants: { $all: [senderId, receiver._id] },
    });

    return res.status(200).json({
      alreadyContact: true,
      message: "Already in your contact list",
      chatId: chat?._id,
    });
  }

  // check request already sent
  const exists = await ContactRequest.findOne({
    sender: senderId,
    receiver: receiver._id,
    status: "pending",
  });

  if (exists) {
    return res.status(400).json({
      message: "Request already sent",
    });
  }

  // create request
  const request = await ContactRequest.create({
    sender: senderId,
    receiver: receiver._id,
    senderSetName: name,
  });

  res.status(201).json({
    alreadyContact: false,
    request,
  });
};


// get sent requests
exports.getSentRequests = async (req, res) => {
  const requests = await ContactRequest.find({
    sender: req.userId,
  }).populate("receiver", "name email");

  res.json(requests);
};

// get received requests
exports.getReceivedRequests = async (req, res) => {
  const requests = await ContactRequest.find({
    receiver: req.userId,
    status: "pending",
  }).populate("sender", "name email");

  res.json(requests);
};


//accept request new
exports.acceptRequest = async (req, res) => {
  const request = await ContactRequest.findById(req.params.id);

  if (!request || request.receiver.toString() !== req.userId) {
    return res.status(404).json({ message: "Request not found" });
  }

  const senderId = request.sender;
  const receiverId = request.receiver;

  // Find or create chat (IMPORTANT)
  let chat = await Chat.findOne({
    participants: { $all: [senderId, receiverId] },
  });

  if (!chat) {
    chat = await Chat.create({
      participants: [senderId, receiverId],
    });
  }

  // UPSERT contact: sender → receiver
  await Contact.findOneAndUpdate(
    {
      owner: senderId,
      contactUser: receiverId,
    },
    {
      owner: senderId,
      contactUser: receiverId,
      nickname: request.senderSetName,
      isDeleted: false,
      isBlocked: false,
      clearedAt: null,
    },
    { upsert: true, new: true }
  );

  // UPSERT contact: receiver → sender
  await Contact.findOneAndUpdate(
    {
      owner: receiverId,
      contactUser: senderId,
    },
    {
      owner: receiverId,
      contactUser: senderId,
      nickname: null,
      isDeleted: false,
      isBlocked: false,
      clearedAt: null,
    },
    { upsert: true, new: true }
  );

  //  Mark request accepted
  request.status = "accepted";
  await request.save();

  //  Socket notify
  const io = require("../socket").getIO();
  io.to(`user:${senderId}`).emit("chatCreated", chat);
  io.to(`user:${receiverId}`).emit("chatCreated", chat);

  res.json({ message: "Request accepted", chat });
};


// accept request old, creating multiple contacts -> wrong
/*exports.acceptRequest = async (req, res) => {
  const request = await ContactRequest.findById(req.params.id);

  if (!request || request.receiver.toString() !== req.userId) {
    return res.status(404).json({ message: "Request not found" });
  }

  // 1Create chat
  const chat = await Chat.create({
    participants: [request.sender, request.receiver],
  });

  // Create contacts
  await Contact.create({
    owner: request.sender,
    contactUser: request.receiver,
    nickname: request.senderSetName,
  });

  await Contact.create({
    owner: request.receiver,
    contactUser: request.sender,
    nickname: null,
  });

  request.status = "accepted";
  await request.save();

  const io = require("../socket").getIO();

  io.to(`user:${request.sender}`).emit("chatCreated", chat);
  io.to(`user:${request.receiver}`).emit("chatCreated", chat);

  res.json({ message: "Request accepted", chat });
};
*/


// Reject request
exports.rejectRequest = async (req, res) => {
  const request = await ContactRequest.findById(req.params.id);

  if (!request || request.receiver.toString() !== req.userId) {
    return res.status(404).json({ message: "Request not found" });
  }

  await request.deleteOne();
  res.json({ message: "Request rejected" });
};
