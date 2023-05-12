/* eslint-disable camelcase */

exports.shorthands = undefined;

/**
 * @param {import("node-pg-migrate/dist/types").MigrationBuilder} pgm
 */
exports.up = (pgm) => {
    pgm.addColumn("game", {
        is_started: {
            type: "boolean",
            notNull: true,
            default: false,
        }
    });
};

exports.down = (pgm) => {
    pgm.dropColumn("game", "is_started");
};
