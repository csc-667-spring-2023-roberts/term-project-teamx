const http = require("http");
const { Server } = require("socket.io");
const Sockets = require("../db/sockets");

const initSockets = (app, sessionMiddleware) => {
  const server = http.createServer(app);
  const io = new Server(server);

  io.engine.use(sessionMiddleware);

  io.on("connection", (socket) => {
    let game_id;

    if (
      socket.handshake.query &&
      socket.handshake.query.path &&
      typeof socket.handshake.query.path === "string"
    ) {
      game_id = socket.handshake.query.path.substring(1);
      if(game_id == "lobby"){
        game_id = 0;
      } else {
        game_id = parseInt(game_id.substring(game_id.lastIndexOf("/") + 1));
      }
      console.log({ game_id, socket_id: socket_id, user: socket.request.session.user });
      Sockets.add(game_id, socket.request.session.user.id, socket.id);
    } else {
      console.log("Invalid path in handshake query");
      console.log("socket.handshake.query.path = " + socket.handshake.query.path);
      return
    }
  });

  app.set("io", io);

  return server;
};

module.exports = initSockets;
