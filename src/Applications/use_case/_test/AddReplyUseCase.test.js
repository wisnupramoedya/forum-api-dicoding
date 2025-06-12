const AddReplyUseCase = require('../AddReplyUseCase');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const NewReply = require('../../../Domains/replies/entities/NewReply');

describe('AddReplyUseCase', () => {
  it('should throw error when thread is not available', async () => {
    // Arrange
    const useCasePayload = {
      content: 'This is a reply',
      owner: 'user-123',
      commentId: 'comment-123',
      threadId: 'thread-123',
    };

    const mockReplyRepository = new ReplyRepository();
    mockReplyRepository.addReply = jest.fn(() => Promise.reject(new NotFoundError('THREAD.NOT_FOUND')));

    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.verifyAvailableThread = jest.fn(() => Promise.reject(new NotFoundError('THREAD.NOT_FOUND')));

    const addReplyUseCase = new AddReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: {},
      threadRepository: mockThreadRepository,
    });

    // Action & Assert
    await expect(addReplyUseCase.execute(useCasePayload)).rejects.toThrow(
      'THREAD.NOT_FOUND',
    );
  });

  it('should throw error when comment is not available', async () => {
    // Arrange
    const useCasePayload = {
      content: 'This is a reply',
      owner: 'user-123',
      commentId: 'comment-123',
      threadId: 'thread-123',
    };

    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.verifyAvailableThread = jest.fn(() => Promise.resolve());

    const mockCommentRepository = new CommentRepository();
    mockCommentRepository.verifyAvailableComment = jest.fn(() => Promise.reject(new NotFoundError('COMMENT.NOT_FOUND')));

    const addReplyUseCase = new AddReplyUseCase({
      replyRepository: {},
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action & Assert
    await expect(addReplyUseCase.execute(useCasePayload)).rejects.toThrow(
      'COMMENT.NOT_FOUND',
    );
  });

  it('should orchestrating the add reply action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'This is a reply',
      owner: 'user-123',
      commentId: 'comment-123',
      threadId: 'thread-123',
    };

    const expectedAddedReply = new AddedReply({
      id: 'reply-123',
      content: useCasePayload.content,
      owner: useCasePayload.owner,
      commentId: useCasePayload.commentId,
      date: '2025-05-30T12:00:00.000Z',
    });

    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.verifyAvailableThread = jest.fn(() => Promise.resolve());

    const mockCommentRepository = new CommentRepository();
    mockCommentRepository.verifyAvailableComment = jest.fn(() => Promise.resolve());

    const mockReplyRepository = new ReplyRepository();
    mockReplyRepository.addReply = jest.fn(() => Promise.resolve(
      new AddedReply({
        id: 'reply-123',
        content: useCasePayload.content,
        owner: useCasePayload.owner,
      }),
    ));

    const addReplyUseCase = new AddReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const addedReply = await addReplyUseCase.execute(useCasePayload);

    // Assert
    expect(addedReply).toStrictEqual(expectedAddedReply);
    expect(mockThreadRepository.verifyAvailableThread).toHaveBeenCalledWith(
      useCasePayload.threadId,
    );
    expect(mockCommentRepository.verifyAvailableComment).toHaveBeenCalledWith(
      useCasePayload.commentId,
    );
    expect(mockReplyRepository.addReply).toHaveBeenCalledWith(
      new NewReply({
        content: useCasePayload.content,
        owner: useCasePayload.owner,
        commentId: useCasePayload.commentId,
      }),
    );
  });
});
