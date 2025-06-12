/* istanbul ignore file */
class ReplyDataBuilder {
  constructor() {
    this.reply = {};
  }

  withReply({
    id = 'reply-123',
    content = 'sebuah balasan',
    comment_id = 'comment-123',
    owner = 'user-123',
    date = new Date('2023-01-19T00:00:00.000Z'),
    is_delete = false,
    username = 'dicoding',
  }) {
    this.reply = {
      id,
      content,
      comment_id,
      owner,
      date,
      is_delete,
      username,
    };
    return this;
  }

  build() {
    return {
      ...this.reply,
    };
  }
}

module.exports = ReplyDataBuilder;
