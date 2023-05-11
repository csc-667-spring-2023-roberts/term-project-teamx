const db = require("./connection.js");

const CREATE_USER = "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id";
const FIND_USER_BY_EMAIL = "SELECT * FROM users WHERE email=$1";

const create = (username, email, hash) =>
  db.one(CREATE_USER, [username, email, hash]);

const findByEmail = (email) =>
  db.one(FIND_USER_BY_EMAIL, [email]);

module.exports = {
  create,
  findByEmail,
};
