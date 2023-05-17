/* eslint-disable camelcase */

/**
 * @param {import("node-pg-migrate/dist/types").MigrationBuilder} pgm
 */
exports.up = pgm => {
    pgm.createTable("user_sockets", {
        id: "id",
        game_id: {
            type: "integer", 
            notNull: true
        },
        user_id: {
            type: "integer",
            notNull: true
        },
        socket_id: {
            type: "varchar(20)",
            notNull: true,
        },
    });
};

/**
 * @param {import("node-pg-migrate/dist/types").MigrationBuilder} pgm
 */
exports.down = pgm => {
    pgm.dropTable("user_sockets");
};
