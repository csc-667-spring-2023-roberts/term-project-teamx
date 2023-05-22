const PLAYER_JOINED = (game_id) => `game:${game_id}:player-joined`;
const GAME_STATE_UPDATED = (game_id, user_id) =>
  `game:${game_id}:${user_id}:updated`;

const MAX_PLAYERS = 2;

const CHAT_MESSAGE_RECEIVED = "chat:message";

const GAME_CREATED = "game:created";
const GAME_STARTING = "game:starting";
const GAME_UPDATED = (game_id,user_id) => `game${game_id}:${user_id}updated`;

module.exports = {
  GAMES: { PLAYER_JOINED, GAME_STATE_UPDATED },
  GAME_CREATED,
  MAX_PLAYERS,
  GAME_STARTING,
  GAME_UPDATED,
  CHAT_MESSAGE_RECEIVED,
};
