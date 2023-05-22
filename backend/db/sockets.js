const db = require("./connection.js");

const add = async (game_id, user_id, socket_id) => {
  
  await db.none(
    "INSERT INTO user_sockets (game_id, user_id, socket_id) VALUES ($1, $2, $3)",
    [game_id, user_id, socket_id]
  );
}

const remove = (socket_id) => 
  db.none("DELETE FROM user_sockets WHERE socket_id=$1", [socket_id]);

const get = async (game_id) => {
  return await db.any("SELECT * from user_sockets where game_id=$1",[game_id]);
}

module.exports = {
    add, 
    remove,
    get,
};