const NewReply = require('../../Domains/replies/entities/NewReply');

class AddReplyUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(useCasePayload) {
    const {
      content, owner, commentId, threadId,
    } = useCasePayload;

    // Verify if the thread exists
    await this._threadRepository.verifyAvailableThread(threadId);

    // Verify if the comment exists
    await this._commentRepository.verifyAvailableComment(commentId);

    // Create a new reply
    const newReply = new NewReply({
      content,
      owner,
      commentId,
    });

    // Add the reply to the repository
    const addedReply = await this._replyRepository.addReply(newReply);

    return addedReply;
  }
}

module.exports = AddReplyUseCase;
