import express from"express";
const router = express.Router();
import db from "../../db/connection.js";

router.get("/", (_request, response) => {
  db.any(`INSERT INTO testtable ("test_string") VALUES ($1)`, [
    `Hello on ${new Date().toLocaleDateString("en-us", {
      hour: "numeric",
      minute: "numeric",
      month: "short",
      day: "numeric",
      weekday: "long",
      year: "numeric",
    })}`,
  ])
    .then((_) => db.any(`SELECT * FROM testtable`))
    .then((results) => response.json(results))
    .catch((error) => {
      console.log(error);
      response.json({ error });
    });
});

export default router;