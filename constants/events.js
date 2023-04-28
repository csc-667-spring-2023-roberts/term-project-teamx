const PLAYER_JOINED = (game_id) => `game:${game_id}:player-joined`;
const GAME_STATE_UPDATED = (game_id, user_id) =>
  `game:${game_id}:${user_id}:updated`;

module.exports = {
  GAMES: { PLAYER_JOINED, GAME_STATE_UPDATED },
};
