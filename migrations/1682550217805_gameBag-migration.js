/* eslint-disable camelcase */

/**
 * @param {import("node-pg-migrate/dist/types").MigrationBuilder} pgm
 */
exports.up = pgm => {
  pgm.createTable("gamebag", {
    value: {
      type: "varchar(256)",
      notNull: true,
    },
    color: {
      type:"varchar(256)",
      notNull:true,
    },
    gameid: {
      type: "int",
      notNull: true,
    },
    userid: {
      type: "int",
      notNull: true,
    },
    specialcard: {
      type: "boolean",
      notNull: true,
    }
  }  );

  
};
/**
 * @param {import("node-pg-migrate/dist/types").MigrationBuilder} pgm
 */
exports.down = pgm => {
  pgm.dropTable("gamebag");
};
