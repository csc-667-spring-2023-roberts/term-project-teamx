/* eslint-disable camelcase */


exports.up = pgm => {
  pgm.createTable("game", {
    id: "id",
    gameid: {
      type: "varchar(256)",
      notNull: true,
      unique: true,
    },
    is_started: {
      type: "boolean",
      notNull: true,
      default: false,
    },
    userid: {
      type: "varchar(256)",
      notNull: true,
      unique: true,
    },
    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });
};

exports.down = pgm => {
  pgm.dropTable("game");
};
