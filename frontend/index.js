import io from "socket.io-client";

const socket = io({ query: { path:window.location.pathname } });




document
  .querySelector("input#chatMessage")
  .addEventListener("keydown", (event) => {
    if (event.keyCode !== 13) {
      return;
    }
    const message = event.target.value;
    event.target.value = "";

    const gameId = window.location.pathname.split("/").pop();

    fetch(`/chat/${gameId}`, {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
  });
