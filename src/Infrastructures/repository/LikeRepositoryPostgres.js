const LikeRepository = require('../../Domains/likes/LikeRepository');

class LikeRepositoryPostgres extends LikeRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async verifyCommentLike(userId, commentId) {
    const query = {
      text: 'SELECT * FROM likes WHERE comment_id = $1 AND owner = $2',
      values: [commentId, userId],
    };

    const result = await this._pool.query(query);
    return result.rowCount > 0;
  }

  async likeComment(userId, commentId) {
    const query = {
      text: 'INSERT INTO likes VALUES($1, $2)',
      values: [commentId, userId],
    };

    await this._pool.query(query);
  }

  async unlikeComment(userId, commentId) {
    const query = {
      text: 'DELETE FROM likes WHERE comment_id = $1 AND owner = $2',
      values: [commentId, userId],
    };

    await this._pool.query(query);
  }

  async getCommentLikeCountByThreadId(threadId) {
    const query = {
      text: `
        SELECT c.id AS comment_id, COUNT(l.owner)::integer AS like_count
        FROM comments c
        LEFT JOIN likes l ON c.id = l.comment_id
        WHERE c.thread_id = $1
        GROUP BY c.id
      `,
      values: [threadId],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }
}
module.exports = LikeRepositoryPostgres;
