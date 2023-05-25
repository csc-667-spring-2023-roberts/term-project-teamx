const express = require("express");
const Games = require("../../db/games.js");
const GAMES = require("../../../constants/events.js");
const Deck = require("../../db/deck.js");

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
  const { id: user_id } = request.session.user;
  const io = request.app.get("io");

  try {
    const isInGame = await Games.findUser(game_id, user_id);

    if (!isInGame) {
      response.redirect("/lobby");
    } else {
      
      response.render("games", {
        creating_user: user_id,
        game_id: game_id,
      });
    }
  } catch (error) {
    console.log({ error });

    response.render("games", {
      creating_user: user_id,
      game_id: game_id
    });
  }
});

router.get("/:id/join", async (request, response) => {
  const { id: user_id } = request.session.user;
  const { id: game_id } = request.params;
  const io = request.app.get("io");

  try {
    await Games.join(user_id, game_id);

    response.redirect(`/games/${game_id}`);
  } catch (error) {
    console.log({ error });

    response.render("games", {
      creating_user: user_id,
      game_id: game_id
    });
  }
});

router.get("/:id/start", async (request, response) => {
  const { id: game_id } = request.params;
  const { id: user_id } = request.session.user;
  const io = request.app.get("io");

  const game_started = await Games.is_started(parseInt(game_id));

  if (!game_started) {
    await Games.start(parseInt(game_id), user_id);

    const users = await Games.getUsers(game_id);
    for (const user of users) {
      const user_gamedata = await Deck.getCurrentStateUser(game_id, user.id);
      io.emit(GAMES.GAME_UPDATED(game_id, user.id), user_gamedata);
    }
  }

  response.send();
});

router.post("/play/:id", async (request, response) => {
  const { id: user_id } = request.session.user;
  const io = request.app.get("io");
  const { id: game_id } = request.params;
  const card = request.body;

  const users = await Games.getUsers(game_id);
  const val = await Games.playCard(parseInt(game_id), user_id, card);

  if (val) {
    for (const user of users) {
      const user_gamedata = await Deck.getCurrentStateUser(game_id, user.id);
      io.emit(GAMES.GAME_UPDATED(game_id, user.id), user_gamedata);
    }
  }

  response.send();
});

router.post("/:id/draw", async (request, response) => {
  const { id: user_id } = request.session.user;
  const io = request.app.get("io");
  const { id: game_id } = request.params;

  const current_game = await Games.getCurrentGame(game_id);

  if (current_game.user_id == user_id) {
    const card = await Deck.getOneCardFromDeck(user_id, game_id, 1);
    const nextUserId = await Games.nextUser(game_id, user_id);
    await Games.updateUser(game_id, nextUserId);

    const users = await Games.getUsers(game_id);
    for (const user of users) {
      const user_gamedata = await Deck.getCurrentStateUser(game_id, user.id);
      io.emit(GAMES.GAME_UPDATED(game_id, user.id), user_gamedata);
    }
  }

  response.send();
});

router.post("/exit/:id", async (request, response) => {
  const { id: user_id } = request.session.user;
  const { id: game_id } = request.params;
  const io = request.app.get("io");

  Games.exitFromGameLobby(user_id, game_id);

  response.redirect("/lobby");
});

router.get("/init/:id", async (request, response) => {
  const { id: user_id } = request.session.user;
  const { id: game_id } = request.params;
  const io = request.app.get("io");

  const game = await Games.is_started(parseInt(game_id));

  if (game) {
    const user_gamedata = await Deck.getCurrentStateUser(game_id, user_id);
    io.emit(GAMES.GAME_UPDATED(game_id, user_id), user_gamedata);
  }

  response.send();
});

module.exports = router;
