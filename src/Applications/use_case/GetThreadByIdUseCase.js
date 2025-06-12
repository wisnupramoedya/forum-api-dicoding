class GetThreadByIdUseCase {
  constructor({
    threadRepository,
    commentRepository,
    replyRepository,
    likeRepository,
  }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
    this._likeRepository = likeRepository;
  }

  async execute(useCasePayload) {
    const { threadId } = useCasePayload;

    const thread = await this._threadRepository.getThreadById(threadId);
    const comments = await this._commentRepository.getCommentsByThreadId(
      threadId
    );

    const commentLikes =
      await this._likeRepository.getCommentLikeCountByThreadId(threadId);
    const replies = await this._replyRepository.getRepliesByThreadId(threadId);

    const formattedComments = comments.map((comment) => ({
      id: comment.id,
      username: comment.username,
      date: comment.date,
      content: comment.is_delete
        ? '**komentar telah dihapus**'
        : comment.content,
      likeCount:
        commentLikes.find((like) => like.comment_id === comment.id)
          ?.like_count || 0,
      replies: replies
        .filter((reply) => reply.comment_id === comment.id)
        .map((reply) => ({
          id: reply.id,
          username: reply.username,
          date: reply.date,
          content: reply.is_delete
            ? '**balasan telah dihapus**'
            : reply.content,
        })),
    }));

    return {
      ...thread,
      comments: formattedComments,
    };
  }
}

module.exports = GetThreadByIdUseCase;
