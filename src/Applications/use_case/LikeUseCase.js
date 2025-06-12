class LikeUseCase {
  constructor({ threadRepository, commentRepository, likeRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._likeRepository = likeRepository;
  }

  async execute({ userId, commentId, threadId }) {
    await this._threadRepository.verifyAvailableThread(threadId);
    await this._commentRepository.verifyAvailableComment(commentId);

    const isLiked = await this._likeRepository.verifyCommentLike(
      userId,
      commentId
    );

    if (isLiked) {
      await this._likeRepository.unlikeComment(userId, commentId);
    } else {
      await this._likeRepository.likeComment(userId, commentId);
    }
  }
}

module.exports = LikeUseCase;
