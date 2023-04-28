const express = require("express");

const router = express.Router();

router.get("/", (_request, response) => {
  response.render("home", { title: "Team X term project" });
});

module.exports = router;
