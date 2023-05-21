import io from "socket.io-client";
import { getGameId } from "../util/game-id";
import GAMES from "../../constants/events";

const socket = io({query: { path: window.location.pathname }});

const userTemplate = document.querySelector("#user-template");
const users = document.querySelector("#users");

const game_id = getGameId(document.location.pathname);

socket.on(GAMES.GAMES.PLAYER_JOINED(game_id), ({ username }) => {
  const user = userTemplate.content.cloneNode(true);

  user.querySelector("span.username").innerText = username;

  users.appendChild(user);
});

//The socket call which updates the cards on the frontend webpage
socket.on(GAMES.GAME_UPDATED, game_updated => {
  console.log(game_updated + "This is a gameupdate socket.on");

  const cardsTemplate = document.querySelector('#card-template')
  const cards = document.querySelector('#game-card-rows');
  console.log(JSON.stringify(game_updated))


  //iterating through the cards to display on the webpage
  game_updated.forEach(card =>{
    //const obj1 = JSON.parse(card)
    const entry = cardsTemplate.content.cloneNode(true);
    
    console.log("in games index.js")
    entry.querySelector(".color").innerText = card.color;
    entry.querySelector(".number").innerText = card.value;
    entry.querySelector(".userId").innerText = card.userid;

    cards.appendChild(entry);
  })
  
})

//still in implementation, will comment later
socket.on(GAMES.GAME_STARTING, (data) =>
  console.log(GAMES.GAME_STARTING, { data })
);


fetch("/authentication/teamx", {
  method: "post",
})
  .then((r) => r.json())
  .then(({ id: user_id }) => {
    console.log({ user_id });
    socket.on(
      GAMES.GAMES.GAME_STATE_UPDATED(game_id, user_id),
      async (game_state) => {
        console.log({ game_state });
      }
    );
  });