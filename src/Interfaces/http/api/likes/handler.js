const LikeUseCase = require('../../../../Applications/use_case/LikeUseCase');
class LikesHandler {
  constructor(container) {
    this._container = container;

    this.putLikeHandler = this.putLikeHandler.bind(this);
  }

  async putLikeHandler(request, h) {
    const useCasePayload = {
      threadId: request.params.threadId,
      commentId: request.params.commentId,
      userId: request.auth.credentials.id,
    };

    const likeUseCase = this._container.getInstance(LikeUseCase.name);
    await likeUseCase.execute(useCasePayload);

    const response = h.response({
      status: 'success',
    });
    response.code(200);
    return response;
  }
}

module.exports = LikesHandler;
