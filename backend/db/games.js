const db = require("./connection.js");

const CREATE_SQL = "INSERT INTO game DEFAULT VALUES RETURNING id";
const ADD_USER_SQL =
  "INSERT INTO game_users (user_id, game_id, table_order) VALUES ($1, $2, $3)";
const create = async (user_id) => {
  const { id } = await db.one(CREATE_SQL);

  await db.none(ADD_USER_SQL, [user_id, id, 0]);

  return { id };
};

module.exports = {
  create,
};
