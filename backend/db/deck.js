const db = require("./connection.js");
const Games = require("./games.js");

//Gamebag queries
const UPDATE_GAMEBAG_USERID = "UPDATE gamebag SET userid = $1 WHERE gameid=$2 AND value=$3 AND color=$4 AND specialcard=$5";
const SELECT_RANDOMCARDS = "SELECT * FROM gamebag WHERE gameid=$1 AND userid=$2 ORDER BY RANDOM() LIMIT $3";
const SELECT_GAMECARDS = "SELECT * from gamebag WHERE gameid=$1 AND NOT userid = 0";

//Game-Users Queries
const GET_GAME_USERS_COUNT = "SELECT COUNT(*) FROM game_users WHERE game_id=$1";


const putOneCardintoDeck = async (card) => {
  await db.none(UPDATE_GAMEBAG_USERID,[0,card["gameid"],card["value"],card["color"],card["specialcard"]]);
}

const getOneCardFromDeck = async (user_id,game_id,count) => {
  const card = await db.one(SELECT_RANDOMCARDS,[game_id,0,count]);
  await db.none(UPDATE_GAMEBAG_USERID,[user_id,card["gameid"],card["value"],card["color"],card["specialcard"]]);
  return { card }
}

const getCurrentState = async (game_id) => {
  const deckcards = await db.any(SELECT_GAMECARDS,[game_id]);
  return deckcards
}

//This is for single flow direction. not bidirectional, will update in future.
const nextPlayer = async (user_id) => {
  let map = new Map;
  const user_table_order = await Games.getTableOrder(game_id);
  const sortedUsers = user_table_order.sort((a,b) => a["table_order"] - b["table_order"]);
  const currentUserIndex = sortedUsers.findIndex(user_table_order => user_table_order["user_id"] == user_id);
  const currentUser = sortedUsers[currentUserIndex];
  const nextUserIndex = currentUserIndex === sortedUsers.length - 1 ? 0 : currentUserIndex + 1;
  return sortedUsers[nextUserIndex]["id"];
}

module.exports = {
  putOneCardintoDeck,
  getOneCardFromDeck,
  getCurrentState,
  nextPlayer,
};