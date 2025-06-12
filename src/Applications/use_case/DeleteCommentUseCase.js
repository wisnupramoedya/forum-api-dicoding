class DeleteCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const { commentId, owner } = useCasePayload;

    // Verify if the comment exists
    await this._commentRepository.verifyAvailableComment(commentId);

    // Verify if the comment owner is correct
    await this._commentRepository.verifyCommentOwner(commentId, owner);

    // Delete the comment
    await this._commentRepository.deleteComment(commentId);
  }
}
module.exports = DeleteCommentUseCase;
