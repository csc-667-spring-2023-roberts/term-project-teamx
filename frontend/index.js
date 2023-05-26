// Import the socket.io-client library
import io from "socket.io-client";
import { getGameId } from "./util/game-id";

import GAMES from "../constants/events";

// Create a socket connection
const socket = io({
  query: { path: window.location.pathname }
});

const gameID = getGameId(document.location.pathname)

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

  })
// Add an event listener to the chat message input field
document
  .querySelector("input#chatMessage")
  .addEventListener("keydown", (event) => {
    // Check if the keycode is Enter
    if (event.keyCode !== 13) {
      // Return if it is not
      return;
    }

    // Get the message from the input field
    const message = event.target.value;

    // Clear the value of the input field
    event.target.value = "";

    // Get the game ID from the URL
    const gameId = getGameId(document.location.pathname);

    // Make a POST request to the /chat endpoint
    fetch(`/chat/${gameId}`, {
      method: "post",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message })
    });
  });
