const NewComment = require('../NewComment');

describe('a Comment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      content: 'Ini konten comment',
    };

    // Action and Assert
    expect(() => new NewComment(payload)).toThrow(
      'NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY',
    );
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      content: 123,
      owner: 123,
      threadId: 123,
    };

    // Action and Assert
    expect(() => new NewComment(payload)).toThrow(
      'NEW_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION',
    );
  });

  it('should create comment object correctly', () => {
    // Arrange
    const payload = {
      content: 'Ini konten comment',
      owner: 'user-123',
      threadId: 'thread-123',
    };

    // Action
    const newComment = new NewComment(payload);

    // Assert
    expect(newComment).toBeInstanceOf(NewComment);
    expect(newComment.content).toEqual(payload.content);
    expect(newComment.owner).toEqual(payload.owner);
    expect(newComment.threadId).toEqual(payload.threadId);
  });
});
