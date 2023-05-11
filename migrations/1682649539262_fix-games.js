/* eslint-disable camelcase */

exports.shorthands = undefined;

/**
 * @param {import("node-pg-migrate/dist/types").MigrationBuilder} pgm
 */
exports.up = (pgm) => {

  pgm.createTable("game_users", {
    user_id: {
      type: "int",
      notNull: true,
    },
    game_id: {
      type: "int",
      notNull: true,
    },
    current: {
      type: "boolean",
      default: false,
      notNull: true,
    },
    table_order: {
      type: "int",
      notNull: true,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable("game_users");
};
