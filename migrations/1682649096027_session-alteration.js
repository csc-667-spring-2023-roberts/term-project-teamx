/* eslint-disable camelcase */

/**
 * @param {import("node-pg-migrate/dist/types").MigrationBuilder} pgm
 */
exports.up = (pgm) => {
  // ALTER TABLE "session" ADD CONSTRAINT "session_pkey"
  // PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;
  pgm.addConstraint("session", "session_pkey", {
    primaryKey: "sid",
    deferrable: false,
  });

  // CREATE INDEX "IDX_session_expire" ON "session" ("expire");
  pgm.createIndex("session", "expire", { name: "IDX_session_expire" });
};

/**
 * @param {import("node-pg-migrate/dist/types").MigrationBuilder} pgm
 */
exports.down = (pgm) => {
  pgm.dropIndex("session", "expire", { name: "IDX_session_expire" });

  pgm.dropConstraint("session", "session_pkey", {
    primaryKey: "sid",
    deferrable: false,
  });
};
