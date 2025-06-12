const LikeRepository = require('../LikeRepository');

describe('a LikeRepository interface', () => {
  it('should throw error when invoke abstract behavior', async () => {
    // Arrange
    const likeRepository = new LikeRepository();

    // Action and Assert
    await expect(likeRepository.likeComment('', '')).rejects.toThrow(
      'LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED'
    );
    await expect(likeRepository.unlikeComment('', '')).rejects.toThrow(
      'LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED'
    );
    await expect(likeRepository.verifyCommentLike('', '')).rejects.toThrow(
      'LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED'
    );
    await expect(
      likeRepository.getCommentLikeCountByThreadId('')
    ).rejects.toThrow('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});
