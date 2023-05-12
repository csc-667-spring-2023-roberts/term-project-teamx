/* eslint-disable camelcase */


exports.up = pgm => {
  pgm.createTable("game", {
    id: "id",
    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    is_started: {
      type: "boolean",
      notNull: true,
      default: false,
    },
    is_alive : {
      type: "boolean",
      notNull: true,
      default: true
    }
  });
};

exports.down = pgm => {
  pgm.dropTable("game");
};
