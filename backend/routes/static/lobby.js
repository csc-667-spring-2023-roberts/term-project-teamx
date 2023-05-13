const express = require("express");
const Games = require("../../db/games.js");

const router = express.Router();

router.get("/", async (request, response) => {
  const { id: user_id } = request.session.user;

  const games = await Games.getAvailableGames(user_id);
  const joinedgames = await Games.getGames(user_id);

  console.log(games);

  response.render("lobby", {
    title: "Team X term project",
    games: games,
    joinedgames : joinedgames,
  });
});

module.exports = router;
