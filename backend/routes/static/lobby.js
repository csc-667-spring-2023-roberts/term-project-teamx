const express = require("express");
const Games = require("../../db/games.js");

const router = express.Router();

router.get("/", async (request, response) => {
  const { id: user_id } = request.session.user;

  const availableGames = await Games.getAvailableGames(user_id);

  const everythinggames = await Games.getEverythingGames();
  const everything = await Games.getEverythingGameUsers();

  console.log("Get Everything Games");
  console.log(everythinggames);
  console.log("Get All Game_Users");
  console.log(everything);

  response.render("lobby", {
    title: "Team X term project",
    availableGames: availableGames,
  });
});

module.exports = router;
