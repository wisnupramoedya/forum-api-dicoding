const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const NewComment = require('../../../Domains/comments/entities/NewComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const pool = require('../../database/postgres/pool');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('CommentRepositoryPostgres', () => {
  beforeEach(async () => {
    await UsersTableTestHelper.addUser({ id: 'user-123' });
    await ThreadsTableTestHelper.addThread({
      id: 'thread-123',
      owner: 'user-123',
    });
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment function', () => {
    it('should persist new comment and return added comment correctly', async () => {
      // Arrange
      const newComment = new NewComment({
        content: 'Ini konten comment',
        owner: 'user-123',
        threadId: 'thread-123',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action
      const addedComment = await commentRepositoryPostgres.addComment(
        newComment,
      );

      // Assert
      const comments = await CommentsTableTestHelper.findCommentsById(
        'comment-123',
      );
      expect(comments).toHaveLength(1);
      expect(addedComment).toStrictEqual(
        new AddedComment({
          id: 'comment-123',
          content: 'Ini konten comment',
          owner: 'user-123',
        }),
      );
    });
  });

  describe('verifyAvailableComment function', () => {
    it('should throw NotFoundError when comment is not found', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      // Action & Assert
      await expect(
        commentRepositoryPostgres.verifyAvailableComment('comment-123'),
      ).rejects.toThrow(NotFoundError);
    });
    it('should not throw NotFoundError when comment is found', async () => {
      // Arrange
      const newComment = new NewComment({
        content: 'Ini konten comment',
        owner: 'user-123',
        threadId: 'thread-123',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );
      await commentRepositoryPostgres.addComment(newComment);

      // Action & Assert
      await expect(
        commentRepositoryPostgres.verifyAvailableComment('comment-123'),
      ).resolves.not.toThrow(NotFoundError);
    });
  });

  describe('verifyCommentOwner function', () => {
    it('should throw AuthorizationError when owner does not match', async () => {
      // Arrange
      const newComment = new NewComment({
        content: 'Ini konten comment',
        owner: 'user-123',
        threadId: 'thread-123',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );
      await commentRepositoryPostgres.addComment(newComment);

      // Action & Assert
      await expect(
        commentRepositoryPostgres.verifyCommentOwner('comment-123', 'user-234'),
      ).rejects.toThrow(AuthorizationError);
    });

    it('should not throw AuthorizationError when owner matches', async () => {
      // Arrange
      const newComment = new NewComment({
        content: 'Ini konten comment',
        owner: 'user-123',
        threadId: 'thread-123',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );
      await commentRepositoryPostgres.addComment(newComment);

      // Action & Assert
      await expect(
        commentRepositoryPostgres.verifyCommentOwner('comment-123', 'user-123'),
      ).resolves.not.toThrow(AuthorizationError);
    });
  });

  describe('deleteComment function', () => {
    it('should delete comment correctly', async () => {
      // Arrange
      const newComment = new NewComment({
        content: 'Ini konten comment',
        owner: 'user-123',
        threadId: 'thread-123',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );
      await commentRepositoryPostgres.addComment(newComment);

      // Action
      await commentRepositoryPostgres.deleteComment('comment-123');

      // Assert
      const comments = await CommentsTableTestHelper.findCommentsById(
        'comment-123',
      );
      expect(comments).toHaveLength(1);
      expect(comments[0].is_delete).toBeTruthy();
    });
  });

  describe('getCommentsByThreadId function', () => {
    it('should return comments by thread id correctly', async () => {
      // Arrange
      const expectedComments = [
        {
          id: 'comment-123',
          content: 'Ini konten comment 1',
          thread_id: 'thread-123',
          owner: 'user-123',
          date: new Date('2023-01-19T00:00:00.000Z'),
          is_delete: false,
          username: 'dicoding',
        },
        {
          id: 'comment-456',
          content: 'Ini konten comment 2',
          thread_id: 'thread-123',
          owner: 'user-123',
          date: new Date('2023-01-20T00:00:00.000Z'),
          is_delete: false,
          username: 'dicoding',
        },
      ];

      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        content: 'Ini konten comment 1',
        owner: 'user-123',
        threadId: 'thread-123',
        date: new Date('2023-01-19T00:00:00.000Z'),
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-456',
        content: 'Ini konten comment 2',
        owner: 'user-123',
        threadId: 'thread-123',
        date: new Date('2023-01-20T00:00:00.000Z'),
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const comments = await commentRepositoryPostgres.getCommentsByThreadId(
        'thread-123',
      );

      // Assert
      expect(comments).toHaveLength(2);
      expect(comments).toStrictEqual(expectedComments);
    });
  });

  it('should return empty array when no comments found for thread id', async () => {
    // Arrange
    const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

    // Action
    const comments = await commentRepositoryPostgres.getCommentsByThreadId(
      'thread-123',
    );

    // Assert
    expect(comments).toHaveLength(0);
  });

  it('should return comments even when comments are deleted', async () => {
    // Arrange
    const expectedComments = [
      {
        id: 'comment-123',
        content: 'Ini konten comment 1',
        thread_id: 'thread-123',
        owner: 'user-123',
        date: new Date('2023-01-19T00:00:00.000Z'),
        is_delete: true,
        username: 'dicoding',
      },
      {
        id: 'comment-456',
        content: 'Ini konten comment 2',
        thread_id: 'thread-123',
        owner: 'user-123',
        date: new Date('2023-01-20T00:00:00.000Z'),
        is_delete: false,
        username: 'dicoding',
      },
    ];

    const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
    await CommentsTableTestHelper.addComment({
      id: 'comment-123',
      content: 'Ini konten comment 1',
      owner: 'user-123',
      threadId: 'thread-123',
      date: new Date('2023-01-19T00:00:00.000Z'),
    });
    await CommentsTableTestHelper.addComment({
      id: 'comment-456',
      content: 'Ini konten comment 2',
      owner: 'user-123',
      threadId: 'thread-123',
      date: new Date('2023-01-20T00:00:00.000Z'),
    });
    await commentRepositoryPostgres.deleteComment('comment-123');

    // Action
    const comments = await commentRepositoryPostgres.getCommentsByThreadId(
      'thread-123',
    );

    // Assert
    expect(comments).toHaveLength(2);
    expect(comments).toStrictEqual(expectedComments);
  });
});
