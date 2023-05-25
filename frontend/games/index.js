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


socket.on(GAMES.GAME_STARTING, (data) =>
  console.log(GAMES.GAME_STARTING, { data })
);



fetch("/authentication/teamx", {
  method: "post",
})
  .then((r) => r.json())
  .then(({ id: user_id }) => {
    
    
    socket.on(
      GAMES.GAMES.GAME_STATE_UPDATED(game_id, user_id),
      async (game_state) => {
        console.log({ game_state });
      }
    );
    
    socket.on(GAMES.CHAT_MESSAGE_RECEIVED(game_id), data => {
      
      const messageContainer = document.querySelector("#messages");

      const chatMessageTemplate = document.querySelector("#chat-message-template");
      const entry = chatMessageTemplate.content.cloneNode(true);
      entry.querySelector(".username").innerText = data.username;
      entry.querySelector(".message").innerText = data.message;
      entry.querySelector(".timestamp").innerText = data.timestamp;

      messageContainer.appendChild(entry);
    })

    
    socket.on(GAMES.GAME_UPDATED(game_id, user_id ), game_updated => {
    
      const cardsTemplate = document.querySelector('#card-template')
      const cards = document.querySelector('#game-card-rows');
    
      //removing all the nodes before add the cards from the socket data
      while(cards.firstChild){
        cards.removeChild(cards.firstChild);
      }
     
      const playertemplate = document.querySelector("#players-template");
      const players = document.querySelector("#players");
      while(players.firstChild){
        players.removeChild(players.firstChild)
      }
      
      game_updated.forEach( element => {

        const userentry = playertemplate.content.cloneNode(true)
        userentry.querySelector(".username").innerText = element.userinfo.username;
        userentry.querySelector(".count").innerText = element.userinfo.count;
        players.appendChild(userentry);


        //Displaying the Table card to match that card to play
        const topcardtemplate = document.querySelector("#topcard-template");
        const topcard = document.querySelector("#topcard")
        while(topcard.firstChild){
          topcard.removeChild(topcard.firstChild);
        }
        const topcardentry = topcardtemplate.content.cloneNode(true);
        topcardentry.querySelector(".color").innerText = element.current_game.current_color;
        topcardentry.querySelector(".value").innerText = element.current_game.current_number;
        topcardentry.querySelector(".userid").innerText = element.current_game.user_id;
        topcard.appendChild(topcardentry);


        document.getElementById("userid-head").innerText = user_id
        // document.getElementById("current_color").textContent = element.current_game.current_color;
        // document.getElementById("current_number").textContent = element.current_game.current_number;
        

        if(element.gamecards.length > 0){
          
          element.gamecards.forEach(card => {
            const entry = cardsTemplate.content.cloneNode(true);
            const imageval = `/img/`+card.color+"_"+card.value+"_"+card.specialcard+`.png`;
            const image = entry.querySelector(".cardimage");
            if(image){
              image.src = imageval
              image.addEventListener("click", function(){
                const url = "/games/play/"+card.gameid;
                fetch(url,{
                  method: "post",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(card),
                })
              })
            }
            else{
              console.log("no card found")
            }
    
            cards.appendChild(entry);
          })
        }
      })
      
    })  
});