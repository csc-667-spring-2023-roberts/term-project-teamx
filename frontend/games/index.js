import io from "socket.io-client";
import { getGameId } from "../util/game-id";
import GAMES from "../../constants/events";

// Establish socket connection
const socket = io({ query: { path: window.location.pathname } });

// Get references to HTML elements
const userTemplate = document.querySelector("#user-template");
const usersContainer = document.querySelector("#users");
const gameID = getGameId(document.location.pathname);

// Socket event listener: Player joined the game
socket.on(GAMES.GAMES.PLAYER_JOINED(gameID), ({ username }) => {
  // Create a new user element based on the template
  const userElement = userTemplate.content.cloneNode(true);
  // Update the username in the user element
  userElement.querySelector("span.username").innerText = username;
  // Append the user element to the users container
  usersContainer.appendChild(userElement);
});

// Socket event listener: Game starting
socket.on(GAMES.GAME_STARTING, (data) => {
  console.log(GAMES.GAME_STARTING, { data });
});

// Fetch user ID and perform further socket event listeners and actions
fetch("/authentication/teamx", {
  method: "post",
})
  .then((response) => response.json())
  .then(({ id: userID }) => {

    // Socket event listener: Game state updated
    socket.on(GAMES.GAMES.GAME_STATE_UPDATED(gameID, userID), async (gameState) => {
      console.log({ gameState });
    });

    // Socket event listener: Chat message received
    socket.on(GAMES.CHAT_MESSAGE_RECEIVED(gameID), (data) => {
      // Get the message container
      const messageContainer = document.querySelector("#messages");
      // Get the chat message template
      const chatMessageTemplate = document.querySelector("#chat-message-template");
      // Clone the template content
      const chatMessageElement = chatMessageTemplate.content.cloneNode(true);
      // Update the username, message, and timestamp in the chat message element
      chatMessageElement.querySelector(".username").innerText = data.username;
      chatMessageElement.querySelector(".message").innerText = data.message;
      chatMessageElement.querySelector(".timestamp").innerText = data.timestamp;
      // Append the chat message element to the message container
      messageContainer.appendChild(chatMessageElement);
    });

    // Socket event listener: Game updated
    socket.on(GAMES.GAME_UPDATED(gameID, userID), (gameUpdated) => {
      // Get the card template and cards container
      const cardTemplate = document.querySelector("#card-template");
      const cardsContainer = document.querySelector("#game-card-rows");
      // Clear the existing cards
      cardsContainer.innerHTML = "";

      // Get the player template and players container
      const playerTemplate = document.querySelector("#players-template");
      const playersContainer = document.querySelector("#players");
      // Clear the existing players
      playersContainer.innerHTML = "";

      // Iterate over the game updates
      gameUpdated.forEach((gameElement) => {
        // Create a player entry based on the template
        const playerEntry = playerTemplate.content.cloneNode(true);
        // Update the username and count in the player entry
        playerEntry.querySelector(".username").innerText = gameElement.userinfo.username;
        playerEntry.querySelector(".count").innerText = gameElement.userinfo.count;
        // Append the player entry to the players container
        playersContainer.appendChild(playerEntry);

        document.getElementById("current-player-turn").textContent = "Current Player: " + gameElement.current_game.user_id;

        // Display the Image of the TopCard
        // Create a Top Card entry based on the template
        const topCardImgTemplate = document.querySelector('#topcard-template-img');
        const topCardImgContainer = document.querySelector("#topcardimg");
        // Clear the existing top card
        topCardImgContainer.innerHTML = "";
        // Copy to create a new Template
        const topCardImg = topCardImgTemplate.content.cloneNode(true);
        // Get the color, value, and specialtype
        topcardColor = gameElement.current_game.current_color;
        topcardNumber = gameElement.current_game.current_number;
        topcardSpecial = gameElement.current_game.specialcard;
        // Get the Correct Img for the TopCard
        const topCardImageURL = `/img/${topcardColor}_${topcardNumber}_${topcardSpecial}.png`;
        // Set the URL to the correct Image(Card)
        topCardImg.querySelector(".topcard-img").src = topCardImageURL;
        //Append the entry to the Container
        topCardImgContainer.appendChild(topCardImg);

        // Update the user ID header
        document.getElementById("userid-head").innerText = "UserID: " + userID;

        // Check if there are game cards
        if (gameElement.gamecards.length > 0) {
          gameElement.gamecards.forEach((card) => {
            // Clone the card template
            const cardEntry = cardTemplate.content.cloneNode(true);
            // Generate the image URL for the card
            const imageURL = `/img/${card.color}_${card.value}_${card.specialcard}.png`;
            const image = cardEntry.querySelector(".cardimage");
            // Set the image source to the generated URL
            image.src = imageURL;

            image.addEventListener("click", function () {
              const url = "/games/play/" + card.gameid;
              fetch(url, {
                method: "post",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(card),
              });
            });

            // Append the card entry to the cards container
            cardsContainer.appendChild(cardEntry);
          });
        }
      });
    });
  });
