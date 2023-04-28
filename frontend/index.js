import io from "socket.io-client";
import events from "../backend/sockets/constants";

const socket = io();
const messageContainer = document.querySelector("#messages");

const chatMessageTemplate = document.querySelector("#chat-message-template");

socket.on(events.CHAT_MESSAGE_RECEIVED, ({ username, message, timestamp }) => {
  const entry = chatMessageTemplate.content.cloneNode(true);

  entry.querySelector(".username").innerText = username;
  entry.querySelector(".message").innerText = message;
  entry.querySelector(".timestamp").innerText = timestamp;

  messageContainer.appendChild(entry);
});

document
  .querySelector("input#chatMessage")
  .addEventListener("keydown", (event) => {
    if (event.keyCode !== 13) {
      return;
    }

    const message = event.target.value;
    event.target.value = "";

    fetch("/chat/0", {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
  });
