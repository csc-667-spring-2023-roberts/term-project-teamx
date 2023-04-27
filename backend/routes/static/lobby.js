
const express = require("express");

const router = express.Router();

router.get("/", (_request, response) => {
  response.render("lobby", { title: "TeamX term project" });
});

module.exports = router;  