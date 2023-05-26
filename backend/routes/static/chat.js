const express = require("express");
const router = express.Router();
const GAMES = require("../../../constants/events.js");
const Chat = require("../../db/chat.js");

router.post("/:id", async (request, response) => {
  const io = request.app.get("io");
  const {id :game_id} = request.params;
  const { message } = request.body;
  const { username, id : user_id } = request.session.user;

  const data = {
    game_id : parseInt(game_id),
    id : user_id,
    message : message ,
    username : username,
    timestamp: Date.now(),
  }

  io.emit(GAMES.CHAT_MESSAGE_RECEIVED(game_id), data);

  response.status(200);
});

module.exports = router;
