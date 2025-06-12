/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');
const { cleanTable } = require('./CommentsTableTestHelper');

const RepliesTableTestHelper = {
  async addReply({
    id = 'reply-123',
    content = 'ini balasan',
    commentId = 'comment-123',
    date = new Date('2023-01-19T00:00:00.000Z'),
    owner = 'user-123',
  }) {
    await pool.query('INSERT INTO replies VALUES ($1, $2, $3, $4, $5)', [
      id,
      content,
      commentId,
      owner,
      date,
    ]);
  },
  async findRepliesById(id) {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },
  async cleanTable() {
    await pool.query('DELETE FROM replies WHERE 1=1');
  },
};

module.exports = RepliesTableTestHelper;
