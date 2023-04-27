/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.createTable("testtable", {
    // From the docs, "id" is equivalent to: { type: 'serial', primaryKey: true }
    id: "id",
    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    test_string: {
      type: "varchar(1000)",
      notNull: true,
    },
  });
};

exports.down = pgm => {};

