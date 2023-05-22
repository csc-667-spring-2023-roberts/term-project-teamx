const db = require("./connection.js");

//Gamebag queries
const UPDATE_GAMEBAG_USERID = "UPDATE gamebag SET userid = $1 WHERE gameid=$2 AND value=$3 AND color=$4 AND specialcard=$5";
const SELECT_RANDOMCARDS = "SELECT * FROM gamebag WHERE gameid=$1 AND userid=$2 ORDER BY RANDOM() LIMIT $3";
const SELECT_GAMECARDS = "SELECT * from gamebag WHERE gameid=$1 AND NOT userid = 0";
const SELECT_USERCARDS = "SELECT * from gamebag WHERE gameid=$1 AND userid=$2";
const COUNT_USERCARDS = "SELECT user_id, COUNT(user_id) as user_count, table_order FROM game_users WHERE game_id = $1 GROUP BY user_id, table_order ORDER BY table_order";
const TOPCARD = "SELECT * from gamebag WHERE gameid=$1 AND userid = -1";
const GET_USER_TABLE_ORDER = "SELECT user_id, table_order FROM game_users"


//Game-Users Queries
const GET_GAME_USERS_COUNT = "SELECT COUNT(*) FROM game_users WHERE game_id=$1";

const GET_USERS = "SELECT id, username FROM users, game_users WHERE game_users.game_id=$1 AND game_users.user_id=users.id";


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

const getCurrentStateUser = async (game_id, user_id) => {
  const userCards = await db.any(SELECT_USERCARDS,[game_id,user_id]); 
  const users = await await db.any(GET_USERS, [game_id]);
  const usercardcount = await db.any(COUNT_USERCARDS,[game_id]);
  const usercountMap = new Map();

  usercardcount.forEach( element => {
    usercountMap.set(element.user_id, element.user_count);
  })

  let result = []
  users.forEach( user => {
      
      const mapval = usercountMap.get(user.id)
      let userstate = {
        users : user.id,
        userinfo : {
          username : user.username,
          count : mapval,
        },
        gamecards : [],
      }
      if(user_id == user.id){
        userstate.gamecards = userCards;
      }

      result.push(userstate);
  })
  return result;
}

const getTableOrder = async (game_id) => {
  return await db.any(GET_USER_TABLE_ORDER,[game_id]);
}


//This is for single flow direction. not bidirectional, will update in future.
const nextPlayer = async (user_id) => {
  let map = new Map;
  const user_table_order = await getTableOrder(game_id);
  const sortedUsers = user_table_order.sort((a,b) => a["table_order"] - b["table_order"]);
  const currentUserIndex = sortedUsers.findIndex(user_table_order => user_table_order["user_id"] == user_id);
  const currentUser = sortedUsers[currentUserIndex];
  const nextUserIndex = currentUserIndex === sortedUsers.length - 1 ? 0 : currentUserIndex + 1;
  return sortedUsers[nextUserIndex]["id"];
}

module.exports = {
  putOneCardintoDeck,
  getOneCardFromDeck,
  getTableOrder,
  getCurrentState,
  getCurrentStateUser,
  nextPlayer,
};