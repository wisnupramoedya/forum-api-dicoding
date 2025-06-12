const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');
const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const NewReply = require('../../../Domains/replies/entities/NewReply');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('ReplyRepositoryPostgres', () => {
  beforeEach(async () => {
    await UsersTableTestHelper.addUser({ id: 'user-123' });
    await ThreadsTableTestHelper.addThread({
      id: 'thread-123',
      owner: 'user-123',
    });
    await CommentsTableTestHelper.addComment({
      id: 'comment-123',
      owner: 'user-123',
      threadId: 'thread-123',
    });
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addReply function', () => {
    it('should persist new reply and return added reply correctly', async () => {
      // Arrange
      const newReply = {
        content: 'This is a reply',
        commentId: 'comment-123',
        owner: 'user-123',
      };
      const fakeIdGenerator = () => '123'; // stub!
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action
      const addedReply = await replyRepositoryPostgres.addReply(newReply);

      // Assert
      const replies = await RepliesTableTestHelper.findRepliesById('reply-123');
      expect(replies).toHaveLength(1);
      expect(addedReply).toStrictEqual(
        new AddedReply({
          id: 'reply-123',
          content: 'This is a reply',
          owner: 'user-123',
        }),
      );
    });
  });

  describe('verifyAvailableReply function', () => {
    it('should throw NotFoundError if reply is not available', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool);

      // Action & Assert
      await expect(
        replyRepositoryPostgres.verifyAvailableReply('reply-123'),
      ).rejects.toThrow(NotFoundError);
    });

    it('should not throw NotFoundError if reply is available', async () => {
      // Arrange
      const newReply = new NewReply({
        content: 'Ini adalah reply',
        owner: 'user-123',
        commentId: 'comment-123',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );
      await replyRepositoryPostgres.addReply(newReply);

      // Action & Assert
      await expect(
        replyRepositoryPostgres.verifyAvailableReply('reply-123'),
      ).resolves.not.toThrow(NotFoundError);
    });
  });

  describe('verifyReplyOwner function', () => {
    it('should throw AuthorizationError if owner does not match', async () => {
      // Arrange
      const newReply = new NewReply({
        content: 'Ini adalah reply',
        owner: 'user-123',
        commentId: 'comment-123',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );
      await replyRepositoryPostgres.addReply(newReply);

      // Action & Assert
      await expect(
        replyRepositoryPostgres.verifyReplyOwner('reply-123', 'user-456'),
      ).rejects.toThrow(AuthorizationError);
    });

    it('should not throw AuthorizationError when owner matches', async () => {
      // Arrange
      const newReply = new NewReply({
        content: 'Ini adalah reply',
        owner: 'user-123',
        commentId: 'comment-123',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );
      await replyRepositoryPostgres.addReply(newReply);

      // Action & Assert
      await expect(
        replyRepositoryPostgres.verifyReplyOwner('reply-123', 'user-123'),
      ).resolves.not.toThrow(AuthorizationError);
    });
  });

  describe('deleteReply function', () => {
    it('should delete reply correctly', async () => {
      // Arrange
      const newReply = new NewReply({
        content: 'Ini adalah reply',
        owner: 'user-123',
        commentId: 'comment-123',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );
      await replyRepositoryPostgres.addReply(newReply);

      // Action
      await replyRepositoryPostgres.deleteReply('reply-123');

      // Assert
      const replies = await RepliesTableTestHelper.findRepliesById('reply-123');
      expect(replies).toHaveLength(1);
      expect(replies[0].is_delete).toBeTruthy();
    });
  });

  describe('getRepliesByThreadId function', () => {
    it('should return empty array if no replies found for the thread id', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool);

      // Action
      const replies = await replyRepositoryPostgres.getRepliesByThreadId(
        'thread-123',
      );

      // Assert
      expect(replies).toHaveLength(0);
    });

    it('should return replies for a given thread id', async () => {
      // Arrange
      const expectedReplies = [
        {
          id: 'reply-123',
          content: 'Ini adalah reply 1',
          owner: 'user-123',
          comment_id: 'comment-123',
          date: new Date('2023-10-01T00:00:00.000Z'),
          is_delete: false,
          username: 'dicoding',
        },
      ];

      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        content: 'Ini adalah reply 1',
        owner: 'user-123',
        commentId: 'comment-123',
        date: new Date('2023-10-01T00:00:00.000Z'),
      });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool);

      // Action
      const replies = await replyRepositoryPostgres.getRepliesByThreadId(
        'thread-123',
      );

      // Assert
      expect(replies).toHaveLength(1);
      expect(replies).toStrictEqual(expectedReplies);
    });

    it('should return replies even when replies are deleted', async () => {
      // Arrange
      const expectedReplies = [
        {
          id: 'reply-123',
          content: 'Ini adalah reply 1',
          owner: 'user-123',
          comment_id: 'comment-123',
          date: new Date('2023-10-01T00:00:00.000Z'),
          is_delete: true,
          username: 'dicoding',
        },
      ];

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        content: 'Ini adalah reply 1',
        owner: 'user-123',
        commentId: 'comment-123',
        date: new Date('2023-10-01T00:00:00.000Z'),
      });
      await replyRepositoryPostgres.deleteReply('reply-123');

      // Action
      const replies = await replyRepositoryPostgres.getRepliesByThreadId(
        'thread-123',
      );

      // Assert
      expect(replies).toHaveLength(1);
      expect(replies).toStrictEqual(expectedReplies);
    });
  });
});
