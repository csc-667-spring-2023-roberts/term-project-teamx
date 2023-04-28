/* eslint-disable camelcase */


exports.up = pgm => {
  pgm.createTable("users", {
    id: "id",
    username: {
      type: "varchar(256)",
      notNull: true,
      unique: true,
    },
    email: {
      type: "varchar(256)",
      notNull: true,
      unique: true,
    },
    password: {
      type: "char(60)",
      notNull: true,
    },
    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });
};

exports.down = pgm => {
  pgm.dropTable("users");
};

