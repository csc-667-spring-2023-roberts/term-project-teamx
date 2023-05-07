const express = require("express");
const Games = require("../../db/games.js");
const { GAMES } = require("../../../constants/events.js");

const router = express.Router();

router.post("/create", async (request, response) => {
  const { id: user_id } = request.session.user;

  try {
    const { id: game_id } = await Games.create(user_id);
    console.log("calling games start")

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

    response.render("games", { creating_user,game_id });
  } catch (error) {
    console.log({ error });

    response.render("games", { 
      creating_user: "Unknown",
      game_id: game_id,
  });
  }
});

router.get("/:id/ingame/", async (request,response)=>{
  const { id: game_id } = request.params;
  const { id: user_id } = request.session.user;

  response.render("");
  try {
    
  } catch (error) {
    console.log({error});
  }
});



router.get("/:id/join", async (request, response) => {
  const { id: user_id, username } = request.session.user;
  const { id: game_id } = request.params;
  const io = request.app.get("io");

  try {
    io.emit(GAMES.PLAYER_JOINED(game_id), { username });
    await Games.join(user_id, game_id);

    console.log(Games.start());

    response.redirect(`/games/${game_id}`);
  } catch (error) {
    console.log({ error });

    response.render("games", { creating_user: "Unknown" ,
    game_id: game_id,});
  }
});

router.post("/:id/start", async (request, response) =>{

  const {id : game_id} = request.params;
  await Games.start(game_id);

  const io = request.app.get("io");

  try {
    // Make sure user is in the game

    // Make sure its the users turn

    // Make sure they haven't drawn

    // Draw a card from the game_cards table

    // Assemble game state for each user in game

    const users = await Games.getUsers(game_id);

    console.log({ users });

    users.forEach((user) => {
      console.log({ user });
      console.log("Emitting for" + GAMES.GAME_STATE_UPDATED(game_id, user));
      io.emit(GAMES.GAME_STATE_UPDATED(game_id, user.id), {
        users,
        current_user: user.id,
        current_player: user.id,
        top_discard: "B6",
        hand: ["A1", "B2", "C3"],
      });
    });

    response.status(200).send();
  } catch (error) {
    console.log({ error });

    response.status(500).send();
  }

})


router.post("/:id/draw", async (request, response) => {
  const { id: user_id } = request.session.user;
  const { id: game_id } = request.params;
  const io = request.app.get("io");

  try {
    // Make sure user is in the game

    // Make sure its the users turn

    // Make sure they haven't drawn

    // Draw a card from the game_cards table

    // Assemble game state for each user in game

    const users = await Games.getUsers(game_id);

    console.log({ users });

    users.forEach((user) => {
      console.log({ user });
      console.log("Emitting for" + GAMES.GAME_STATE_UPDATED(game_id, user));
      io.emit(GAMES.GAME_STATE_UPDATED(game_id, user.id), {
        users,
        current_user: user.id,
        current_player: user.id,
        top_discard: "B6",
        hand: ["A1", "B2", "C3"],
      });
    });

    response.status(200).send();
  } catch (error) {
    console.log({ error });

    response.status(500).send();
  }
});

module.exports = router;
