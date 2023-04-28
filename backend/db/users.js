const db = require("./connection.js");

const create = (username, email, hash) =>
  db.one(
    "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id",
    [username, email, hash]
  );

const findByEmail = (email) =>
  db.one("SELECT * FROM users WHERE email=$1", [email]);

module.exports = {
  create,
  findByEmail,
};
