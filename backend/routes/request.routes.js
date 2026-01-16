const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const {
  sendRequest,
  getSentRequests,
  getReceivedRequests,
  acceptRequest,
  rejectRequest,
} = require("../controllers/request.controller");

router.post("/send", auth, sendRequest);
router.get("/sent", auth, getSentRequests);
router.get("/received", auth, getReceivedRequests);
router.post("/:id/accept", auth, acceptRequest);
router.delete("/:id/reject", auth, rejectRequest);

module.exports = router;
