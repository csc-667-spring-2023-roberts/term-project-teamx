const db = require("./connection.js");

const GAMES_LIST_SQL = `
  SELECT g.id, g.created_at FROM game g, game_users gu 
  WHERE g.id=gu.game_id AND gu.user_id != $1 AND 
  (SELECT COUNT(*) FROM game_users WHERE game_users.game_id=g.id) = 1
`;
const list = (user_id) => db.any(GAMES_LIST_SQL, [user_id]);

const gamebag = "INSERT INTO gamebag (value, color, game_id, player_id, specialcard ) VALUES ($1, $2, $3, $4, $5)";

const CREATE_SQL = "INSERT INTO game DEFAULT VALUES RETURNING id";

const ADD_USER_SQL = "INSERT INTO game_users (user_id, game_id, table_order) VALUES ($1, $2, $3)";

const COUNT_PLAYERS="select count(*) from game where id=$1";

const JOIN_GAME = "INSERT INTO game_users (game_id, user_id, table_order) VALUES ($1, $2, $3)";




const create = async (user_id) => {
  console.log("hi");
  const { id } = await db.one(CREATE_SQL);

  const colors=["blue","green","yellow","red"];
  colors.forEach(async element => {
    for(let i=0;i<10;i++){
      await db.none(gamebag,[i.toString(),element,id,0,'FALSE']);
    }
    await db.none(gamebag,["2",element,id,0,'TRUE']);
    await db.none(gamebag,["0",element,id,0,'TRUE']);
    await db.none(gamebag,["-1",element,id,0,'TRUE']);
    await db.none(gamebag,["4","nocolor",id,0,'TRUE']);
    await db.none(gamebag,["0","nocolor",id,0,'TRUE']);
  });

  //console.log(await db.multi("select * from gamebag"));

  //console.log(await db.multi("select player_id from gamebag where game_id=$1",[id]));

  console.log({ game_id_created: id });

  await db.none(ADD_USER_SQL, [user_id, id, 0]);

  console.log("before start")
  await start(id);

  console.log("hello")
  return { id };
};

const CREATING_USER_SQL = "SELECT username FROM users, game_users WHERE game_users.game_id=$1 AND table_order=0 AND game_users.user_id=users.id";

const creatingUser = async (game_id) => db.one(CREATING_USER_SQL, [game_id]);



const join = async (user_id, game_id) => {
  const { max } = await db.one(
    "SELECT MAX(table_order) FROM game_users WHERE game_id=$1",
    [game_id]
  );

  await db.none(JOIN_GAME, [game_id, user_id, max + 1]);


  console.log(await db.multi("select player_id from gamebag where game_id=$1",[game_id]));
  console.log("hellow");
};

const getUsers = (game_id) =>
  db.any(
    "SELECT id, username FROM users, game_users WHERE game_users.game_id=$1 AND game_users.user_id=users.id",
    [game_id]
  );

const start = async (game_id) => {

  let player_count;
  await db.one(COUNT_PLAYERS,[game_id]).then(data => {
    console.log(data["count"]);
    player_count = data["count"];
  })

  let shuffle_cards;
  


  console.log(player_count)


  await db.multi("select * from gamebag where game_id=$1 order by random() LIMIT $2",[game_id,player_count*7]).then(
    data=>{
      shuffle_cards = data[0];
      console.log(shuffle_cards)
    }
  );

  let users;
  //await db.multi("select userid from game where id=$1",[game_id]).then(data => {
    //users=data[0];
 // });

  let i=-1;

  //shuffle_cards.forEach( async card => {
    //await db.none("update gamebag set player_id=$1 where game_id=$2 and value=$3 and color=$4 and specialcard=$5",[users[(i+1)%player_count],card["game_id"],card["value"],card["color"],card["specialcard"]]);
    //i=i+1;
  //})

  

  console.log(shuffle_cards);
  console.log(player_count);
  console.log("start");
  
  
}
  



module.exports = {
  create,
  creatingUser,
  getUsers,
  join,
  list,
  start,
};
