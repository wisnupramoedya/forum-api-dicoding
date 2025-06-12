/* istanbul ignore file */
class ThreadDataBuilder {
  withThread({
    id = 'thread-123',
    title = 'sebuah judul',
    body = 'sebuah body',
    date = new Date('2023-01-19T00:00:00.000Z'),
    username = 'dicoding',
  }) {
    this.thread = {
      id,
      title,
      body,
      date,
      username,
    };
    return this;
  }

  withComments(comments = []) {
    this.thread = {
      ...this.thread,
      comments,
    };
    return this;
  }

  build() {
    return {
      ...this.thread,
    };
  }
}

module.exports = ThreadDataBuilder;
