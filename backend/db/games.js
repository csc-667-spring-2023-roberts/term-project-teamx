const db = require("./connection.js");

const GAMES_LIST_SQL = `
  SELECT g.id, g.created_at FROM game g, game_users gu 
  WHERE g.id=gu.game_id AND gu.user_id != $1 AND 
  (SELECT COUNT(*) FROM game_users WHERE game_users.game_id=g.id) = 1
`;
const list = (user_id) => db.any(GAMES_LIST_SQL, [user_id]);

const CREATE_SQL = "INSERT INTO game DEFAULT VALUES RETURNING id";
const ADD_USER_SQL =
  "INSERT INTO game_users (user_id, game_id, table_order) VALUES ($1, $2, $3)";
const create = async (user_id) => {
  const { id } = await db.one(CREATE_SQL);
  console.log({ game_id_created: id });

  await db.none(ADD_USER_SQL, [user_id, id, 0]);

  return { id };
};

const CREATING_USER_SQL =
  "SELECT username FROM users, game_users WHERE game_users.game_id=$1 AND table_order=0 AND game_users.user_id=users.id";
const creatingUser = async (game_id) => db.one(CREATING_USER_SQL, [game_id]);

const JOIN_GAME =
  "INSERT INTO game_users (game_id, user_id, table_order) VALUES ($1, $2, $3)";
const join = async (user_id, game_id) => {
  const { max } = await db.one(
    "SELECT MAX(table_order) FROM game_users WHERE game_id=$1",
    [game_id]
  );

  await db.none(JOIN_GAME, [game_id, user_id, max + 1]);
};

module.exports = {
  create,
  creatingUser,
  join,
  list,
};
