/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const LikesTableTestHelper = {
  async addLike({
    commentId = 'comment-123',
    userId = 'user-123',
    date = '2023-01-19T07:00:00.000Z',
  }) {
    const query = {
      text: 'INSERT INTO likes VALUES($1, $2)',
      values: [commentId, userId],
    };

    await pool.query(query);
  },

  async findLikeByCommentIdAndUserId({ commentId, userId }) {
    const query = {
      text: 'SELECT * FROM likes WHERE comment_id = $1 AND owner = $2',
      values: [commentId, userId],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM likes WHERE 1=1');
  },
};

module.exports = LikesTableTestHelper;
