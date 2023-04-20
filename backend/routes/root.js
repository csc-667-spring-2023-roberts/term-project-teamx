const express = require("express");
const router = express.Router();

router.get("/", (request, response) => {
  const name = "Uno - Team X";

  response.render("home", {
    title: "Hi World!",
    message: "Our first template.",
  });

});

module.exports = router;
