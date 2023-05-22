const http = require("http");
const { Server } = require("socket.io");
const Sockets = require("../db/sockets");
const GAMES = require("../../constants/events")
const Deck = require("../../backend/db/deck.js")

const initSockets = (app, sessionMiddleware) => {
  const server = http.createServer(app);
  const io = new Server(server);

  io.engine.use(sessionMiddleware);

  io.on("connection", (socket) => {

    //getting the user id and game id from the session and url of the request respectively
    let game_id = socket.handshake.query.path?.substring(1);
    const user_id = socket.request.session?.user?.id;

    //console.log(user_id + " "+ game_id)
    if (user_id == undefined || game_id == undefined) {
       return;
     }

     // if the last string in the url is lobby we return them to lobby
     if (game_id === "lobby") {
       game_id = 0;
     } else {
      //else we take the id from the last 
       game_id = parseInt(game_id?.substring(game_id.lastIndexOf("/") + 1));
     }

     //we are adding the user_id with their socket.id and game_id to store the information
     Sockets.add(game_id, user_id, socket.id);
     Sockets.get(game_id).then((data)=>{
      //console.log(data)
     });


     //if there is a game page
    //  if (game_id != 0) {
    //   //fetching the current state of the cards in the deck
    //   Deck.getCurrentStateUser(game_id,user_id).then((data)=>{
    //     socket.emit(GAMES.GAME_UPDATED,data);
    //   })
    // }
  });

  app.set("io", io);

  return server;
};

module.exports = initSockets;
