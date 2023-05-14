const db = require("./connection.js");
const Deck = require("./deck.js");

//Game SQL Queries
const CREATE_SQL = "INSERT INTO game DEFAULT VALUES RETURNING id";
const USER_GAMES = "SELECT id FROM game WHERE is_started = false AND is_alive = true AND id IN (SELECT game_id FROM game_users WHERE user_id=$1)";
const RUNNING_GAMES = "SELECT id FROM game WHERE is_started = true AND is_alive = true AND id IN (SELECT game_id FROM game_users WHERE user_id=$1)";
const AVAILABLE_GAMES = "SELECT id FROM game WHERE is_started = false AND is_alive = true AND id NOT IN (SELECT game_id FROM game_users WHERE user_id=$1)";
const AVAILABLE_GAMES_LIST = "SELECT game_id as id FROM game_users WHERE game_id NOT IN (SELECT game_id FROM game_users WHERE user_id=$1) AND game_id IN (SELECT id AS game_id FROM game WHERE is_started=false AND is_alive=true)";
const UPDATE_IS_ALIVE = "UPDATE game SET is_alive=false where $id = $1";

//Game-Users SQL Queries
const GET_EVERYTHING_GAME_USERS = "SELECT * FROM game_users";
const JOIN_GAME = "INSERT INTO game_users (user_id, game_id, current, table_order) VALUES ($1, $2, $3, $4)";
const COUNT_PLAYERS = "SELECT COUNT(table_order) FROM game_users WHERE game_id=$1";
const MAX_TABLE_ORDER = "SELECT MAX(table_order) FROM game_users WHERE game_id=$1";
const GET_GAME_USERS_COUNT = "SELECT COUNT(*) FROM game_users WHERE game_id=$1";


//Users and Game-Users SQL Queries
const GET_USERS = "SELECT id, username FROM users, game_users WHERE game_users.game_id=$1 AND game_users.user_id=users.id";
const DELETE_USER_GAME = "DELETE FROM game_users where user_id=$1 AND game_id=$2";

//Game and Game-Users SQL Queries
const CREATING_USER_SQL = "SELECT username FROM users, game_users WHERE game_users.game_id=$1 AND table_order=0 AND game_users.user_id=users.id";

//GameBag SQL Queries
const GAMEBAG = "INSERT INTO gamebag (value, color, gameid, userid, specialcard ) VALUES ($1, $2, $3, $4, $5)";
const UPDATE_GAMEBAG_USERID = "UPDATE gamebag SET userid = $1 WHERE gameid=$2 AND value=$3 AND color=$4 AND specialcard=$5";
const SELECT_RANDOMCARDS = "SELECT * FROM gamebag WHERE gameid=$1 AND userid=$2 ORDER BY RANDOM() LIMIT $3";
const SELECT_GAMECARDS = "SELECT * from gamebag WHERE gameid=$1 AND NOT userid = 0";
const GET_USER_TABLE_ORDER = "SELECT user_id, table_order FROM game_users where game_id=$1";


//Create a Game
//Insert the creating User into the game_users table
const create = async (user_id) => {
  //Create a Game
  const { id } = await db.one(CREATE_SQL);

  //Add the Player to the Game
  await db.none(JOIN_GAME, [user_id, id, false, 0]);
  
  //Return the Game_Id
  return { id };
};

//Gets the Creating User of a game
const creatingUser = async (game_id) => db.one(CREATING_USER_SQL, [game_id]);

//Adds a User to a Game_Users game with +1 table_order
const join = async (user_id, game_id) => {
  const { max } = await db.one( MAX_TABLE_ORDER, [game_id]);

  await db.none(JOIN_GAME, [user_id, game_id, false, max + 1]);
};

//Gets Users from Users/Game-Users in a Game
const getUsers = (game_id) => db.any(GET_USERS, [game_id]);

//Gets Games that a User is not currently in that is Not Currently Ongoing
const getAvailableGames = (user_id) => db.any(AVAILABLE_GAMES,[user_id]);

//Gets Games that a User is not currently in that is Currently Ongoing
const getRunningGames = (user_id) => db.any(RUNNING_GAMES,[user_id]);

//Get games that User is currently in (game_users)
const getGames = (user_id) => db.any(USER_GAMES,[user_id]);

//Get all games
const getAllGames = async () => { return await db.any("SELECT id FROM game"); };

const getEverythingGames = async () => { return await db.any("SELECT * FROM game"); };

const getEverythingGameUsers = async () => {return await db.any(GET_EVERYTHING_GAME_USERS); };

const player_count = async (game_id) => {return await db.one(COUNT_PLAYERS,[game_id]);};


const getTableOrder = async (game_id) => {
  return await db.any(GET_USER_TABLE_ORDER,[game_id]);
}


//This needs to be explained or named
// we are using that map to sstore the users from the users table and giving the shuffling cards, I put it outside the start block because we can use that in future when playing the game to use it a queue.
let map = new Map;

//Needs work
const start = async (game_id) => {

  const colors=["blue","green","yellow","red"];

  colors.forEach(async element => {
    for(let i=0;i<10;i++){
      await db.none(GAMEBAG,[i.toString(),element,game_id,0,'FALSE']);
    }
    await db.none(GAMEBAG,["2",element,game_id,0,'TRUE']);
    await db.none(GAMEBAG,["0",element,game_id,0,'TRUE']);
    await db.none(GAMEBAG,["-1",element,game_id,0,'TRUE']);
    await db.none(GAMEBAG,["4","nocolor",game_id,0,'TRUE']);
    await db.none(GAMEBAG,["0","nocolor",game_id,0,'TRUE']);
  });

  const player_count = await this.player_count(game_id);

  let current_game_users = await getUsers(game_id);

  var i=0;
  current_game_users.forEach(element => {
    map.set(i,element["id"]);
    i++;
  })

  await db.none("update game set is_started=true where id=$1",[game_id]);

  let shuffle_cards;
  var count=1;


  await db.multi(SELECT_RANDOMCARDS,[game_id,0,player_count*7]).then(
    data=>{
      shuffle_cards = data[0];
    }
  );

  await shuffle_cards.forEach(card => {
    console.log(map.get(count%player_count),count);
    db.none(UPDATE_GAMEBAG_USERID,[map.get(count%player_count),card["gameid"],card["value"],card["color"],card["specialcard"]]);
    console.log(count," after update suffle")
    count=count+1;
  })

  //taking one card from the deck to put on the table as the top card
  await Deck.getOneCardFromDeck(0,game_id,1);
  //Setting the current turn of the player.


  //After Shuffling the deck and distrbuting the cards, we return the cards which are in players hand and top card
  return Deck.getCurrentState(game_id);

}


const exitFromGameLobby = async (user_id,game_id) => {
  //getting the player count from the game
  const player_count = await db.one(GET_GAME_USERS_COUNT,[game_id])
  //deleting the user from the game
  await db.none(DELETE_USER_GAME,[user_id,game_id])
  //checking the player count, if it is 1 then the game should end and the game will be going to be in a dead state
  if(player_count == 1){
    //sets the game to dead mode by updating the is_alive to false
    await db.none(UPDATE_IS_ALIVE,[game_id])
  }
}


module.exports = {
  create,
  creatingUser,
  getUsers,
  join,
  start,
  getAvailableGames,
  getRunningGames,
  getGames,
  getAllGames,
  getEverythingGames,
  getEverythingGameUsers,
  exitFromGameLobby,
  player_count,
  getTableOrder,
};
