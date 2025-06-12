const NewComment = require('../../Domains/comments/entities/NewComment');

class AddCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const { content, owner, threadId } = useCasePayload;

    // Verify if the thread exists
    await this._threadRepository.verifyAvailableThread(threadId);

    // Create a new comment
    const newComment = new NewComment({
      content,
      owner,
      threadId,
    });

    // Add the comment to the repository
    const addedComment = await this._commentRepository.addComment(newComment);

    return addedComment;
  }
}

module.exports = AddCommentUseCase;
