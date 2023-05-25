const db = require("./connection.js");

//Gamebag queries
const UPDATE_GAMEBAG_USERID = "UPDATE gamebag SET userid = $1 WHERE gameid=$2 AND value=$3 AND color=$4 AND specialcard=$5";
const SELECT_RANDOMCARDS = "SELECT * FROM gamebag WHERE gameid=$1 AND userid=$2 ORDER BY RANDOM() LIMIT $3";
const SELECT_GAMECARDS = "SELECT * from gamebag WHERE gameid=$1 AND NOT userid = 0";
const SELECT_USERCARDS = "SELECT * from gamebag WHERE gameid=$1 AND userid=$2";
const COUNT_USERCARDS = "SELECT userid, COUNT(userid) as user_count FROM gamebag WHERE gameid = $1 GROUP BY userid ORDER BY userid";
const TOPCARD = "SELECT * from gamebag WHERE gameid=$1 AND userid = -1";
const GET_USER_TABLE_ORDER = "SELECT user_id, table_order FROM game_users"


//Game-Users Queries
const GET_GAME_USERS_COUNT = "SELECT COUNT(*) FROM game_users WHERE game_id=$1";

const GET_USERS = "SELECT id, username FROM users, game_users WHERE game_users.game_id=$1 AND game_users.user_id=users.id";

const GET_CURRENT_GAME = "SELECT * FROM current_game WHERE game_id = $1";

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
    usercountMap.set(element.userid, element.user_count);
  })

  let current_game = {
    current_number : -1,
    current_color : "red",
    specialcard : "true"
  }
  
  const game = await db.one("SELECT * from game where id=$1",[parseInt(game_id)]);
  if(game.is_started){
    current_game = await db.one(GET_CURRENT_GAME, [parseInt(game_id)]);
  }

  let result = []
  users.forEach( async user => {
      const mapval = usercountMap.get(user.id)
      let userstate = {
        users : user.id,
        userinfo : {
          username : user.username,
          count : mapval,
        },
        gamecards : [],
        current_game : current_game,
      }
      if(user_id == user.id){
        userstate.gamecards = userCards;
      }
      result.push(userstate);
      console.log(userstate.userinfo)
  })
  return result;
}

const getTableOrder = async (game_id) => {
  return await db.any(GET_USER_TABLE_ORDER,[game_id]);
}



//This is for single flow direction. not bidirectional, will update in future.


module.exports = {
  putOneCardintoDeck,
  getOneCardFromDeck,
  getTableOrder,
  getCurrentState,
  getCurrentStateUser,
};