const express = require("express");

const router = express.Router();

router.get("/:id", (request, response) => {
  const { id } = request.params;

  response.render("game", { id, title: "teamX term project" });
});

module.exports = router;