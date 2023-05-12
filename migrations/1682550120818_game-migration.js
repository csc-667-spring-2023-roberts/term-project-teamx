/* eslint-disable camelcase */


exports.up = pgm => {
  pgm.createTable("game", {
    id: "id",
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
