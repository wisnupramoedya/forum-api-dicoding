const DeleteReplyUseCase = require('../DeleteReplyUseCase');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('DeleteReplyUseCase', () => {
  it('should throw NotFoundError when reply is not found', async () => {
    // Arrange
    const useCasePayload = {
      replyId: 'reply-123',
      owner: 'user-123',
    };

    const mockReplyRepository = new ReplyRepository();
    mockReplyRepository.verifyAvailableReply = jest.fn(() => Promise.reject(new NotFoundError('REPLY.NOT_FOUND')));
    const deleteReplyUseCase = new DeleteReplyUseCase({
      replyRepository: mockReplyRepository,
    });

    // Action & Assert
    await expect(deleteReplyUseCase.execute(useCasePayload)).rejects.toThrow(
      NotFoundError,
    );
  });

  it('should throw AuthorizationError when user is not the owner of the reply', async () => {
    // Arrange
    const useCasePayload = {
      replyId: 'reply-123',
      owner: 'user-456',
    };

    const mockReplyRepository = new ReplyRepository();
    mockReplyRepository.verifyAvailableReply = jest.fn(() => Promise.resolve());
    mockReplyRepository.verifyReplyOwner = jest.fn(() => Promise.reject(new AuthorizationError('REPLY.NOT_AUTHORIZED')));
    mockReplyRepository.deleteReply = jest.fn(() => Promise.resolve());
    const deleteReplyUseCase = new DeleteReplyUseCase({
      replyRepository: mockReplyRepository,
    });

    // Action & Assert
    await expect(deleteReplyUseCase.execute(useCasePayload)).rejects.toThrow(
      AuthorizationError,
    );
  });

  it('should orchestrating the delete reply action correctly', async () => {
    // Arrange
    const useCasePayload = {
      replyId: 'reply-123',
      owner: 'user-123',
    };

    const mockReplyRepository = new ReplyRepository();
    mockReplyRepository.verifyAvailableReply = jest.fn(() => Promise.resolve());
    mockReplyRepository.verifyReplyOwner = jest.fn(() => Promise.resolve());
    mockReplyRepository.deleteReply = jest.fn(() => Promise.resolve());
    const deleteReplyUseCase = new DeleteReplyUseCase({
      replyRepository: mockReplyRepository,
    });

    // Action
    await deleteReplyUseCase.execute(useCasePayload);

    // Assert
    expect(mockReplyRepository.verifyAvailableReply).toHaveBeenCalledWith(
      useCasePayload.replyId,
    );
    expect(mockReplyRepository.verifyReplyOwner).toHaveBeenCalledWith(
      useCasePayload.replyId,
      useCasePayload.owner,
    );
    expect(mockReplyRepository.deleteReply).toHaveBeenCalledWith(
      useCasePayload.replyId,
    );
  });
});
