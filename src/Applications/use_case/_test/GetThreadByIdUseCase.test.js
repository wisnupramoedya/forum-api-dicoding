const GetThreadByIdUseCase = require('../GetThreadByIdUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const ThreadDataBuilder = require('./fixtures/ThreadDataBuilder');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const CommentDataBuilder = require('./fixtures/CommentDataBuilder');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const ReplyDataBuilder = require('./fixtures/ReplyDataBuilder');

describe('GetThreadByIdUseCase', () => {
  it('should orchestrating the get thread by id action correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
    };

    const {
      is_delete: isDeletedFirstComment,
      owner: firstOwner,
      thread_id: firstThreadId,
      ...firstComment
    } = new CommentDataBuilder()
      .withComment({
        id: 'comment-123',
        content: 'komentar pertama',
        date: new Date('2023-01-19T00:00:00.000Z'),
      })
      .build();

    const {
      is_delete: isDeletedSecondComment,
      owner: secondOwner,
      thread_id: secondThreadId,
      ...secondComment
    } = new CommentDataBuilder()
      .withComment({
        id: 'comment-234',
        date: new Date('2023-01-20T00:00:00.000Z'),
        is_delete: true,
      })
      .build();

    const {
      is_delete: isDeletedFirstReply,
      owner: firstReplyOwner,
      comment_id: firstCommentId,
      ...firstReply
    } = new ReplyDataBuilder()
      .withReply({
        id: 'reply-123',
        content: 'balasan pertama',
        date: new Date('2023-01-19T00:00:00.000Z'),
      })
      .build();
    const {
      is_delete: isDeletedSecondReply,
      owner: secondReplyOwner,
      comment_id: secondCommentId,
      ...secondReply
    } = new ReplyDataBuilder()
      .withReply({
        id: 'reply-234',
        content: 'balasan kedua',
        date: new Date('2023-01-20T00:00:00.000Z'),
        is_delete: true,
      })
      .build();

    const thread = new ThreadDataBuilder().withThread({}).build();

    const expectedThread = {
      ...thread,
      comments: [
        {
          ...firstComment,
          replies: [
            firstReply,
            { ...secondReply, content: '**balasan telah dihapus**' },
          ],
        },
        {
          ...secondComment,
          content: '**komentar telah dihapus**',
          replies: [],
        },
      ],
    };

    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.getThreadById = jest.fn(() => Promise.resolve(thread));
    const mockCommentRepository = new CommentRepository();
    mockCommentRepository.getCommentsByThreadId = jest.fn(() => Promise.resolve([
      {
        ...firstComment,
        owner: firstOwner,
        thread_id: firstThreadId,
        is_delete: isDeletedFirstComment,
      },
      {
        ...secondComment,
        owner: secondOwner,
        thread_id: secondThreadId,
        is_delete: isDeletedSecondComment,
      },
    ]));
    const mockReplyRepository = new ReplyRepository();
    mockReplyRepository.getRepliesByThreadId = jest.fn(() => Promise.resolve([
      {
        ...firstReply,
        is_delete: isDeletedFirstReply,
        owner: firstReplyOwner,
        comment_id: firstCommentId,
      },
      {
        ...secondReply,
        is_delete: isDeletedSecondReply,
        owner: secondReplyOwner,
        comment_id: secondCommentId,
      },
    ]));

    const getThreadByIdUseCase = new GetThreadByIdUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const result = await getThreadByIdUseCase.execute(useCasePayload);

    // Assert
    expect(result).toStrictEqual(expectedThread);
    expect(result.comments.length).toEqual(2);
    expect(mockThreadRepository.getThreadById).toHaveBeenCalledWith(
      useCasePayload.threadId,
    );
    expect(mockCommentRepository.getCommentsByThreadId).toHaveBeenCalledWith(
      useCasePayload.threadId,
    );
    expect(mockReplyRepository.getRepliesByThreadId).toHaveBeenCalledWith(
      useCasePayload.threadId,
    );
  });
});
