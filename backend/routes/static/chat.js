const express = require("express");
const router = express.Router();
const events = require("../../sockets/constants.js");
const Chat = require("../../db/chat.js");

router.post("/:id", async (request, response) => {
  const io = request.app.get("io");
  const { message } = request.body;
  const { username, id } = request.session.user;

  io.emit(events.CHAT_MESSAGE_RECEIVED, {
    message,
    username,
    timestamp: Date.now(),
  });

  response.status(200);
});

module.exports = router;
