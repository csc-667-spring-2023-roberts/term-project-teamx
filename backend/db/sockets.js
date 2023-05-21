const db = require("./connection.js");

const add = async (game_id, user_id, socket_id) => {
  
  await db.none(
    "INSERT INTO user_sockets (game_id, user_id, socket_id) VALUES ($1, $2, $3)",
    [game_id, user_id, socket_id]
  );
}

const remove = (socket_id) => 
  db.none("DELETE FROM user_sockets WHERE socket_id=$1", [socket_id]);

module.exports = {
    add, 
    remove,
};