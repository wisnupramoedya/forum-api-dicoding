/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
  pgm.createTable('likes', {
    comment_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    owner: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
  });

  pgm.addConstraint('likes', 'likes_pkey', {
    primaryKey: ['comment_id', 'owner'],
  });
  pgm.addConstraint('likes', 'fk_likes.comment_id_comments.id', {
    foreignKeys: {
      columns: 'comment_id',
      references: 'comments(id)',
      onDelete: 'CASCADE',
    },
  });
  pgm.addConstraint('likes', 'fk_likes.owner_users.id', {
    foreignKeys: {
      columns: 'owner',
      references: 'users(id)',
      onDelete: 'CASCADE',
    },
  });
  pgm.createIndex('likes', 'comment_id');
  pgm.createIndex('likes', ['comment_id', 'owner'], {
    unique: true,
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropIndex('likes', ['comment_id', 'owner'], {
    unique: true,
  });
  pgm.dropIndex('likes', 'comment_id');
  pgm.dropConstraint('likes', 'fk_likes.owner_users.id');
  pgm.dropConstraint('likes', 'fk_likes.comment_id_comments.id');
  pgm.dropConstraint('likes', 'likes_pkey');
  pgm.dropTable('likes');
};
