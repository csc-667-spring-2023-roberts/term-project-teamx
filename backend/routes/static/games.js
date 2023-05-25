const express = require("express");
const Games = require("../../db/games.js");
const GAMES = require("../../../constants/events.js");
const Deck = require("../../db/deck.js");
const { default: db } = require("node-pg-migrate/dist/db.js");

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
    const ingame = await Games.findUser(game_id,user_id)
    //await Games.nextUser(game_id,user_id);
    //console.log(ingame)
    if(ingame == false){
      response.redirect("/lobby");
    } 
    else{
    const game_state = await Deck.getCurrentStateUser(game_id,user_id);

    response.render("games", { creating_user:user_id , game_id: game_id,  game_state : game_state});
    }
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
  //console.log(game_started.is_started)
    //starting the game if the game isn't started yet
    if(!game_started){
    await Games.start(parseInt(game_id),user_id);

    //Debug to see the state of the game
    const users = await Games.getUsers(game_id);
    users.forEach( async user => {
      const user_gamedata = await Deck.getCurrentStateUser(game_id,user.id);
      console.log(user_gamedata);
      io.emit(GAMES.GAME_UPDATED(game_id,user.id),user_gamedata);
    })
    }
    response.send()
})

router.post("/play/:id", async (request, response) => {
  const { id: user_id, username } = request.session.user;
  const io = request.app.get("io");
  const { id: game_id } = request.params;
  const card = request.body;

    //console.log(user_id + " checking userid in games post router " + card.userid )

    const users = await Games.getUsers(game_id);
    const val = await Games.playCard(parseInt(game_id),user_id,card);
    //console.log(val + "value of playCard funciton games.js static");
    
    if(val){
      console.log(users + " users play id")
      users.forEach( async user => {
      const user_gamedata = await Deck.getCurrentStateUser(game_id,user.id);
      //console.log(user.id);
      io.emit(GAMES.GAME_UPDATED(game_id,user.id),user_gamedata);
    })
    }
    response.send()
});

router.post("/:id/draw", async (request,response) => {
  const { id: user_id, username } = request.session.user;
  const io = request.app.get("io");
  const { id: game_id } = request.params;
  
  const current_game = await Games.getCurrentGame(game_id);
  //console.log(JSON.stringify(current_game) + "draw flaksdjlksajfl")
  if(current_game.user_id == user_id){

  const card = await Deck.getOneCardFromDeck(user_id, game_id, 1);
  const nextUserId = await Games.nextUser(game_id,user_id);
  await Games.updateuser(game_id,nextUserId);

  const users = await Games.getUsers(game_id);
  users.forEach( async user => {
    const user_gamedata = await Deck.getCurrentStateUser(game_id,user.id);
    //console.log(user.id);
    io.emit(GAMES.GAME_UPDATED(game_id,user.id),user_gamedata);
  })

}
response.send()
})

router.post("/exit/:id", async (request,response)=>{
  const { id: user_id } = request.session.user;
  const { id: game_id } = request.params;
  const io = request.app.get("io");


  Games.exitFromGameLobby(user_id,game_id);

  response.redirect("/lobby");
});

router.get("/init/:id", async (request,response)=>{
  const { id: user_id } = request.session.user;
  const { id: game_id } = request.params;
  const io = request.app.get("io");


  const game = await Games.is_started(parseInt(game_id));
  if(game){
    const user_gamedata = await Deck.getCurrentStateUser(game_id,user_id);
    //console.log(user_gamedata);
    io.emit(GAMES.GAME_UPDATED(game_id,user_id),user_gamedata);
  }
  response.send()
});

module.exports = router;
