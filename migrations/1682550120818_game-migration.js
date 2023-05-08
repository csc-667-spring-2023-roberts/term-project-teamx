/* eslint-disable camelcase */


exports.up = pgm => {
  pgm.createTable("game", {
    id: "id",
    is_started: {
      type: "boolean",
      notNull: true,
      default: false,
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
