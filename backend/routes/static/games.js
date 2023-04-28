const express = require("express");
const Games = require("../../db/games.js");

const router = express.Router();

router.post("/create", (request, response) => {
  const { id: user_id } = request.session.user;

  try {
    const { id: game_id } = Games.create(user_id);

    response.redirect(`/games/${game_id}`);
  } catch (error) {
    console.log({ error });

    response.redirect("/lobby");
  }
});

router.get("/:id", (request, response) => {
  const { id } = request.params;

  response.render("games", { id, title: "Team X term project" });
});

module.exports = router;
