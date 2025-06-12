/* istanbul ignore file */
class CommentDataBuilder {
  constructor() {
    this.comment = {};
  }

  withComment({
    id = 'comment-123',
    content = 'sebuah komentar',
    thread_id = 'thread-123',
    owner = 'user-123',
    date = new Date('2023-01-19T00:00:00.000Z'),
    is_delete = false,
    username = 'dicoding',
  }) {
    this.comment = {
      id,
      content,
      date,
      is_delete,
      thread_id,
      owner,
      username,
    };
    return this;
  }

  build() {
    return {
      ...this.comment,
    };
  }
}

module.exports = CommentDataBuilder;
