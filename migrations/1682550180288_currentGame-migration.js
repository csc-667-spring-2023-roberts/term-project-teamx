/* eslint-disable camelcase */

/**
 * @param {import("node-pg-migrate/dist/types").MigrationBuilder} pgm
 */
exports.up = pgm => {
  pgm.createTable("current_game", {
    game_id: {
      type: "int",
      notNull: true,
    },
    buffer_count: {
      type:"int",
      notNull:true,
    },
    lastupdated : {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    current_number: {
      type: "int",
      notNull: true,
    },
    current_color:{
      type:"varchar(256)",      
      notNull:true,
    },
    specialcard : {
      type:"boolean",
    },
    current_direction:{
      type:"boolean",
      notNull:true,
    },
    user_id: {
      type: "int",
      notNull: true,
    },
    current_buffer: {
      type: "int",
      notNull: true,
      default: 0
    }
  });

};

/**
 * @param {import("node-pg-migrate/dist/types").MigrationBuilder} pgm
 */
exports.down = pgm => {
  pgm.dropTable("current_game");
};
