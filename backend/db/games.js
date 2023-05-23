const db = require("./connection.js");
const Deck = require("./deck.js");

//Game SQL Queries
const CREATE_SQL = "INSERT INTO   game DEFAULT VALUES RETURNING id";
const USER_GAMES = "SELECT id FROM game WHERE is_started = false AND is_alive = true AND id IN (SELECT game_id FROM game_users WHERE user_id=$1)";
const RUNNING_GAMES = "SELECT id FROM game WHERE is_started = true AND is_alive = true AND id IN (SELECT game_id FROM game_users WHERE user_id=$1)";
const AVAILABLE_GAMES = "SELECT id FROM game WHERE is_started = false AND is_alive = true AND id NOT IN (SELECT game_id FROM game_users WHERE user_id=$1)";
const AVAILABLE_GAMES_LIST = "SELECT game_id as id FROM game_users WHERE game_id NOT IN (SELECT game_id FROM game_users WHERE user_id=$1) AND game_id IN (SELECT id AS game_id FROM game WHERE is_started=false AND is_alive=true)";
const UPDATE_IS_ALIVE = "UPDATE game SET is_alive=false where $id = $1";
const IS_STARTED = "select is_started from game WHERE id = $1";

//Game-Users SQL Queries
const GET_EVERYTHING_GAME_USERS = "SELECT * FROM game_users";
const JOIN_GAME = "INSERT INTO game_users (user_id, game_id, current, table_order) VALUES ($1, $2, $3, $4)";
const COUNT_PLAYERS = "SELECT COUNT(table_order) FROM game_users WHERE game_id=$1";
const MAX_TABLE_ORDER = "SELECT MAX(table_order) FROM game_users WHERE game_id=$1";
const GET_GAME_USERS_COUNT = "SELECT COUNT(*) FROM game_users WHERE game_id=$1";
const GET_GAME_USERS = "SELECT * FROM game_users WHERE game_id = $1";


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

const SELECT_GAME_USER = "SELECT * FROM game_users WHERE game_id = $1 AND user_id=$2";

//current_game Queries
const GET_CURRENT_GAME = "SELECT * FROM current_game WHERE game_id = $1"
const UPDATE_CURRENT_GAME = "UPDATE current_game SET current_number=$1, current_color=$2, current_direction=$3, user_id=$4, specialcard = $5, current_buffer=$6, buffer_count=$7 WHERE game_id=$8"
const UPDATE_CURRENT_USER_DIRECTION = "UPDATE current_game SET current_user=$1 AND current_direciton=$2 WHERE game_id=$3";
const INSERT_CURRENT_GAME = "INSERT INTO current_game (current_number, current_color, current_direction, user_id, specialcard, current_buffer, buffer_count, game_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)"

const is_started = async (game_id) => {
  return await db.one(IS_STARTED,[game_id]);
}

//Create a Game
//Insert the creating User into the game_users table
const create = async (user_id) => {
  //Create a Game
  const { id } = await db.one(CREATE_SQL);

  //Add the Player to the Game
  await db.none(JOIN_GAME, [user_id, id, false, 1]);
  
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
const getUsers = async (game_id) => { return await db.any(GET_USERS, [game_id]) };

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

const display_top_car = async (game_id) => {return await db.one(GET_CURRENT_GAME)}

// Map to store the users from the users table and giving the shuffling cards 
// Outside the start block because we can use that in future when playing the game to use it a queue.
let map = new Map;

//Needs work
const start = async (game_id,user_id) => {

  const colors=["blue","green","yellow","red"];

  //Fill a Gamebag for a specified Game with Cards
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

  //Player Count for the Game when Start is pressed
  let playerCount = (await player_count(game_id))["count"];
  //console.log("PlayerCount (DB.games.js) = " + playerCount);  //Debug

  //Get the Users of the Current Game
  let current_game_users = await getUsers(game_id);
  
  //Debug
  if (current_game_users && Array.isArray(current_game_users)){
    current_game_users.forEach((item) => {
      //console.log("CurrentGameUsers (DB.games.js) = [ id:" + item.id + " username:" + item.username + " ]");
    });
  }
  //else console.log("Error Reading CurrentGameUsers");

  //Fill the Map with the IDs of the users in the game
  var i=0;
  current_game_users.forEach(element => {
    map.set(i,element["id"]);
    i++;
  })

  //Update the state of the Game (Is_Started = true)
  await db.none("UPDATE game SET is_started=true WHERE id=$1",[game_id]);

  let shuffle_cards;
  var count=1;

  //
  await db.multi(SELECT_RANDOMCARDS,[game_id,0,playerCount*7]).then(
    (data) =>{
      shuffle_cards = data[0];
    }
  );
  
  //Assigning shuffled cards to the palyers
  await shuffle_cards.forEach(card => {
    db.none(UPDATE_GAMEBAG_USERID,[map.get(count%playerCount),card["gameid"],card["value"],card["color"],card["specialcard"]]);
    count=count+1;
  })

  await db.none(INSERT_CURRENT_GAME,[-1,"nocolor",true,user_id,false,0,0,parseInt(game_id)])
  //await db.none(UPDATE_CURRENT_GAME,[-1,"nocolor",true,-1,false,0,0,parseInt(game_id)]);

  console.log("hello")
  console.log(await db.one(GET_CURRENT_GAME,[parseInt(game_id)]));
  // currentState.forEach(card => {
  //   console.log("Card: [ gameid:" + card.gameid + " userid:" + card.userid + " value:" + card.value + " color:" + card.color + " specialcard:" + card.specialcard + " ]"); //Debug
  // });
  const currentState = await Deck.getCurrentStateUser(game_id,user_id);

  return currentState;
}

const nextUser = async (game_id, user_id) => {
  const user = await db.one(SELECT_GAME_USER,[game_id,user_id]);
  const game_users = await db.any(GET_GAME_USERS,[game_id]);
  game_users.sort((a,b) => a.table_order - b.table_order);
  var index = -1
  var count = 0
  console.log(game_users);
  game_users.forEach( game_user => {
    if(game_user.user_id == user_id){
      index = count;
    }
    count = count+1
  })
  
  const currentgames = await db.any(GET_CURRENT_GAME,[game_id]);
  console.log(currentgames)
  currentgames.forEach(currentgame => {
    if(currentgame.current_direction = 1){
      index=(index+1)%game_users.length;
    } else {
      if(index == 0){
        index=game_users.length-1;
      } else {
        index=index-1;
      }
    }
  })
  console.log(game_users[index])
  
  console.log(game_users[index]);
  console.log(game_users[index].user_id)
  return game_users[index].user_id;
 
}

const checkCard = async (game_id,user_id,card) => {
  const current_game = await db.one(GET_CURRENT_GAME,[game_id]);
  console.log(JSON.stringify(card) + "card in checkcard")
  console.log(JSON.stringify(current_game) + "currentgames in checkcard")
  if(current_game.user_id == -1 || current_game.user_id == card.userid){
    console.log(current_game.current_color + " color "+card.color);
    if((current_game.current_number == -1 && current_game.current_color == "nocolor") || card.value == current_game.current_number || card.color == current_game.current_color){
      const nextUserId = await nextUser(game_id,user_id);
      await db.none(UPDATE_CURRENT_GAME,[parseInt(card.value),card.color,true,nextUserId,card.specialcard, 0, 0, card.gameid])
      return true
    }
  }
  return false
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

const updateCurrentGame = async (card,nextUserId) => {
  await db.none(UPDATE_CURRENT_GAME,[])
}

const playCard = async(game_id,user_id,card)=>{
  const val=await checkCard(game_id,user_id,card);
  if(val){
    
    //await updateCurrentGame(card,nextUserId);
    Deck.putOneCardintoDeck(card);
    return true;  
  } else {
   console.log("Try a valid card else try to draw one"); 
   return false;
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
  playCard,
  checkCard,
  player_count,
  is_started,
  nextUser,
};
