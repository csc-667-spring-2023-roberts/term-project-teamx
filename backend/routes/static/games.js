const express = require("express");
const Games = require("../../db/games.js");
const { GAMES } = require("../../../constants/events.js");

const router = express.Router();

router.post("/create", async (request, response) => {
  const { id: user_id } = request.session.user;

  try {
    const { id: game_id } = await Games.create(user_id);

    response.redirect(`/games/${game_id}`);
  } catch (error) {
    console.log({ error });

    response.redirect("/lobby");
  }
});

router.get("/:id", async (request, response) => {
  const { id: game_id } = request.params;

  try {
    const { username: creating_user } = await Games.creatingUser(game_id);

    response.render("games", { creating_user });
  } catch (error) {
    console.log({ error });

    response.render("games", { creating_user: "Unknown" });
  }
});

router.get("/:id/join", async (request, response) => {
  const { id: user_id, username } = request.session.user;
  const { id: game_id } = request.params;
  const io = request.app.get("io");

  try {
    io.emit(GAMES.PLAYER_JOINED(game_id), { username });
    await Games.join(user_id, game_id);

    response.redirect(`/games/${game_id}`);
  } catch (error) {
    console.log({ error });

    response.render("games", { creating_user: "Unknown" });
  }
});

module.exports = router;
