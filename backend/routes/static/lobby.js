const express = require("express");
const Games = require("../../db/games.js");

const router = express.Router();

router.get("/", async (request, response) => {
  const { id: user_id } = request.session.user;

  console.log("hello from routes/lobby");
  console.log(await Games.getGames(user_id));
  const games=await Games.getGames(user_id);
  console.log(await Games.getAllGames());

  response.render("lobby", {
    title: "Team X term project",
    games: games,
  });
});

module.exports = router;
