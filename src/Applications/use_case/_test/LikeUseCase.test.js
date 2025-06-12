const LikeUseCase = require('../LikeUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const LikeRepository = require('../../../Domains/likes/LikeRepository');

describe('LikeUseCase', () => {
  it('should throw error when thread is not available', async () => {
    // Arrange
    const useCasePayload = {
      userId: 'user-123',
      commentId: 'comment-123',
      threadId: 'thread-123',
    };

    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.verifyAvailableThread = jest.fn(() =>
      Promise.reject(new Error('THREAD.NOT_FOUND'))
    );

    const likeUseCase = new LikeUseCase({
      likeRepository: {},
      commentRepository: {},
      threadRepository: mockThreadRepository,
    });

    // Action & Assert
    await expect(likeUseCase.execute(useCasePayload)).rejects.toThrow(
      'THREAD.NOT_FOUND'
    );
  });

  it('should throw error when comment is not available', async () => {
    // Arrange
    const useCasePayload = {
      userId: 'user-123',
      commentId: 'comment-123',
      threadId: 'thread-123',
    };

    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.verifyAvailableThread = jest.fn(() =>
      Promise.resolve()
    );

    const mockCommentRepository = new CommentRepository();
    mockCommentRepository.verifyAvailableComment = jest.fn(() =>
      Promise.reject(new Error('COMMENT.NOT_FOUND'))
    );

    const likeUseCase = new LikeUseCase({
      likeRepository: {},
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action & Assert
    await expect(likeUseCase.execute(useCasePayload)).rejects.toThrow(
      'COMMENT.NOT_FOUND'
    );
  });

  it('should orchestrate the like action correctly', async () => {
    // Arrange
    const useCasePayload = {
      userId: 'user-123',
      commentId: 'comment-123',
      threadId: 'thread-123',
    };
    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.verifyAvailableThread = jest.fn(() =>
      Promise.resolve()
    );
    const mockCommentRepository = new CommentRepository();
    mockCommentRepository.verifyAvailableComment = jest.fn(() =>
      Promise.resolve()
    );
    const mockLikeRepository = new LikeRepository();
    mockLikeRepository.verifyCommentLike = jest.fn(() =>
      Promise.resolve(false)
    );
    mockLikeRepository.likeComment = jest.fn(() => Promise.resolve());

    const likeUseCase = new LikeUseCase({
      likeRepository: mockLikeRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    await likeUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.verifyAvailableThread).toHaveBeenCalledWith(
      useCasePayload.threadId
    );
    expect(mockCommentRepository.verifyAvailableComment).toHaveBeenCalledWith(
      useCasePayload.commentId
    );
    expect(mockLikeRepository.verifyCommentLike).toHaveBeenCalledWith(
      useCasePayload.userId,
      useCasePayload.commentId
    );
    expect(mockLikeRepository.likeComment).toHaveBeenCalledWith(
      useCasePayload.userId,
      useCasePayload.commentId
    );
  });

  it('should orchestrate the unlike action correctly', async () => {
    // Arrange
    const useCasePayload = {
      userId: 'user-123',
      commentId: 'comment-123',
      threadId: 'thread-123',
    };
    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.verifyAvailableThread = jest.fn(() =>
      Promise.resolve()
    );
    const mockCommentRepository = new CommentRepository();
    mockCommentRepository.verifyAvailableComment = jest.fn(() =>
      Promise.resolve()
    );
    const mockLikeRepository = new LikeRepository();
    mockLikeRepository.verifyCommentLike = jest.fn(() => Promise.resolve(true));
    mockLikeRepository.unlikeComment = jest.fn(() => Promise.resolve());

    const likeUseCase = new LikeUseCase({
      likeRepository: mockLikeRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    await likeUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.verifyAvailableThread).toHaveBeenCalledWith(
      useCasePayload.threadId
    );
    expect(mockCommentRepository.verifyAvailableComment).toHaveBeenCalledWith(
      useCasePayload.commentId
    );
    expect(mockLikeRepository.verifyCommentLike).toHaveBeenCalledWith(
      useCasePayload.userId,
      useCasePayload.commentId
    );
    expect(mockLikeRepository.unlikeComment).toHaveBeenCalledWith(
      useCasePayload.userId,
      useCasePayload.commentId
    );
  });
});
