class DeleteReplyUseCase {
  constructor({ replyRepository }) {
    this._replyRepository = replyRepository;
  }

  async execute(useCasePayload) {
    const { replyId, owner } = useCasePayload;

    // Verify if the reply exists
    await this._replyRepository.verifyAvailableReply(replyId);

    // Verify if the user is the owner of the reply
    await this._replyRepository.verifyReplyOwner(replyId, owner);

    // Delete the reply
    await this._replyRepository.deleteReply(replyId);
  }
}

module.exports = DeleteReplyUseCase;
