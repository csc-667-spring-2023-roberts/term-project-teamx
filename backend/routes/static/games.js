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
  const { id : user_id } = request.session.user;
  const io = request.app.get("io");


  try {
    //await Games.nextUser(game_id,user_id);
    const game_state = await Deck.getCurrentStateUser(game_id,user_id);

    response.render("games", { creating_user:user_id , game_id: game_id,  game_state : game_state});
  } catch (error) {
    console.log({ error });

    response.render("games", { 
      creating_user: user_id,
      game_id: game_id,
  });
  }
});



router.get("/:id/join", async (request, response) => {
  const { id: user_id, username } = request.session.user;
  const { id: game_id } = request.params;
  const io = request.app.get("io");

  try {
    await Games.join(user_id, game_id);


    response.redirect(`/games/${game_id}`);

  } catch (error) {
    console.log({ error });

    response.render("games", { creating_user: user_id ,
    game_id: game_id, game_state: data});
  }
});

router.get("/:id/start", async (request, response) =>{

  const {id : game_id} = request.params;
  const { id : user_id} = request.session.user;
  const io = request.app.get("io");

  //game_started is to check if the game is started or not
  const game_started = await Games.is_started(parseInt(game_id))

  
  try {
    
    //starting the game if the game isn't started yet
    if(!game_started.is_started){
    const gameStartState = await Games.start(parseInt(game_id),user_id);

    //Debug to see the state of the game
    const users = await Games.getUsers(game_id);
    users.forEach( async user => {
      const user_gamedata = await Deck.getCurrentStateUser(game_id,user.id);
      console.log(user.id);
      io.emit(GAMES.GAME_UPDATED(game_id,user.id),user_gamedata);
    })
    }
    response.redirect(`/games/${game_id}`)

  } catch (error) {
    
    console.log({ error });

    response.status(500);
    response.redirect(`/games/${game_id}`)
  }

})
router.post("/play/:id", async (request, response) => {
  const { id: user_id, username } = request.session.user;
  const io = request.app.get("io");
  const { id: game_id } = request.params;
  const card = request.body;
  if(user_id == card["userid"]){
    const val = await Games.playCard(parseInt(game_id),user_id,card);
    console.log(val + "value of playCard funciton games.js static");
    if(val){
      const users = await Games.getUsers(game_id);
      //io.emit()
      users.forEach( async user => {
      const user_gamedata = await Deck.getCurrentStateUser(game_id,user.id);
      console.log(user.id);
      io.emit(GAMES.GAME_UPDATED(game_id,user.id),user_gamedata);
    })
    }
  }
});

router.post("/:id/draw", async (request,response) => {
  const { id: user_id, username } = request.session.user;
  const io = request.app.get("io");
  const { id: game_id } = request.params;
  const card = await Deck.getOneCardFromDeck(user_id, game_id, 1);
  const users = await Games.getUsers(game_id);
  users.forEach( async user => {
    const user_gamedata = await Deck.getCurrentStateUser(game_id,user.id);
    console.log(user.id);
    io.emit(GAMES.GAME_UPDATED(game_id,user.id),user_gamedata);
  })
  response.redirect(`/games/${game_id}`);
})

router.post("/exit/:id", async (request,response)=>{
  const { id: user_id } = request.session.user;
  const { id: game_id } = request.params;

  Games.exitFromGameLobby(user_id,game_id);

  response.redirect("/lobby");
});

module.exports = router;
