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
  console.log(game_id);
  const user_id = request.params.id;

  //const is_started = Games.is_started(game_id);

  try {
    const { username: creating_user } = await Games.creatingUser(game_id);

    response.render("games", { creating_user, game_id });
  } catch (error) {
    console.log({ error });

    response.render("games", { 
      creating_user: "Unknown",
      game_id: game_id,
  });
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

    response.render("games", { creating_user: "Unknown" ,
    game_id: game_id,});
  }
});

router.get("/:id/start", async (request, response) =>{

  const {id : game_id} = request.params;
  const io = request.app.get("io");
  
  try {
    const users = await Games.getUsers(game_id);

    const gamecards = await Games.start(game_id);

    console.log({ users });

    console.log(gamecards);
    gamecards.forEach((card)=> {
      console.log(card);
    })

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
    
    response.status(200)
    response.redirect(`/games/${game_id}`);
  } catch (error) {
    console.log({ error });

    response.status(500);
    response.redirect(`/games/${game_id}`)
  }

})

router.post("/play/")

router.post("/exit/:id", async (request,response)=>{
  const { id: user_id } = request.session.user;
  const { id: game_id } = request.params;

  console.log("Exit Button Called");
  Games.exitFromGameLobby(user_id,game_id);
  console.log("Player must be removed from the player-game list");

  response.redirect("/lobby");
});

module.exports = router;
