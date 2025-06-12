const AddedComment = require('../AddedComment');

describe('a AddedComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      owner: 'user-123',
    };

    // Action and Assert
    expect(() => new AddedComment(payload)).toThrow(
      'ADDED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY',
    );
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123,
      content: 'Ini konten comment',
      owner: 123,
    };

    // Action and Assert
    expect(() => new AddedComment(payload)).toThrow(
      'ADDED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION',
    );
  });

  it('should create added comment object correctly', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      content: 'Ini konten comment',
      owner: 'user-123',
    };

    // Action
    const addedComment = new AddedComment(payload);

    // Assert
    expect(addedComment).toBeInstanceOf(AddedComment);
    expect(addedComment.id).toEqual(payload.id);
    expect(addedComment.content).toEqual(payload.content);
    expect(addedComment.owner).toEqual(payload.owner);
  });
});
