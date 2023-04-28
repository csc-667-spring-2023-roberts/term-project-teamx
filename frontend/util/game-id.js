/**
 *
 * @param {String} location
 */
export function getGameId(location) {
  const gameId = location.substring(location.lastIndexOf("/") + 1);

  if (gameId === "lobby") {
    return 0;
  } else {
    return parseInt(gameId);
  }
}
