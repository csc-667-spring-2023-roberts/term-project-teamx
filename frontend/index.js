// Import the socket.io-client library
import io from "socket.io-client";

// Create a socket connection
const socket = io({
  query: { path: window.location.pathname }
});

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
    const gameId = window.location.pathname.split("/").pop();

    // Make a POST request to the /chat endpoint
    fetch(`/chat/${gameId}`, {
      method: "post",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message })
    });
  });
