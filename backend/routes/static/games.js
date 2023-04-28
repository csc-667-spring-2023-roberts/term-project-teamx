const express = require("express");

const router = express.Router();

router.get("/:id", (request, response) => {
  const { id } = request.params;

  response.render("games", { id, title: "Team X term project" });
});

module.exports = router;
