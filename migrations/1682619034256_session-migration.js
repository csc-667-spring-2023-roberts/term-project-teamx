/* eslint-disable camelcase */

/**
 * @param {import("node-pg-migrate/dist/types").MigrationBuilder} pgm
 */

exports.up = pgm => {
  pgm.createTable('session',{
    sid:{
      type: 'VARCHAR(255)',
      notNull: true
    },
    sess:{
      type: 'string'
    },
    expire:{
      type: 'TIMESTAMP',
      default: pgm.func('CURRENT_TIMESTAMP')
    }
  });
};

exports.down = pgm => {
  pgm.dropTable("session")
};
