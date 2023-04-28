const express = require("express");
const Games = require("../../db/games.js");

const router = express.Router();

router.get("/", async (request, response) => {
  const { id: user_id } = request.session.user;

  response.render("lobby", {
    title: "Team X term project",
    games: await Games.list(user_id),
  });
});

module.exports = router;
