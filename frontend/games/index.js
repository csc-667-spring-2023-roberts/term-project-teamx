import io from "socket.io-client";
import { getGameId } from "../util/game-id";
import { GAMES } from "../../constants/events";

const socket = io();

const userTemplate = document.querySelector("#user-template");
const users = document.querySelector("#users");

socket.on(
  GAMES.PLAYER_JOINED(getGameId(document.location.pathname)),
  ({ username }) => {
    console.log({ userTemplate });
    const user = userTemplate.content.cloneNode(true);

    user.querySelector("span.username").innerText = username;

    users.appendChild(user);
  }
);
