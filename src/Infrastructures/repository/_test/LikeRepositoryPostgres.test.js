const LikeRepositoryPostgres = require('../LikeRepositoryPostgres');
const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');

describe('LikeRepositoryPostgres', () => {
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
    await LikesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('verifyCommentLike function', () => {
    it('should return true when the user has liked the comment', async () => {
      // Arrange
      const payload = {
        userId: 'user-123',
        commentId: 'comment-123',
      };

      const likeRepository = new LikeRepositoryPostgres(pool, {});
      await LikesTableTestHelper.addLike({
        commentId: payload.commentId,
        userId: payload.userId,
      });

      // Action
      const result = await likeRepository.verifyCommentLike(
        payload.userId,
        payload.commentId
      );

      // Assert
      expect(result).toBeTruthy();
    });

    it('should return false when the user has not liked the comment', async () => {
      // Arrange
      const payload = {
        userId: 'user-123',
        commentId: 'comment-123',
      };

      const likeRepository = new LikeRepositoryPostgres(pool, {});

      // Action
      const result = await likeRepository.verifyCommentLike(
        payload.userId,
        payload.commentId
      );

      // Assert
      expect(result).toBeFalsy();
    });
  });

  describe('likeComment function', () => {
    it('should add like to the comment', async () => {
      // Arrange
      const payload = {
        userId: 'user-123',
        commentId: 'comment-123',
      };

      const likeRepository = new LikeRepositoryPostgres(pool, {});

      // Action
      await likeRepository.likeComment(payload.userId, payload.commentId);

      // Assert
      const isLiked = await likeRepository.verifyCommentLike(
        payload.userId,
        payload.commentId
      );
      expect(isLiked).toBeTruthy();
    });
  });

  describe('unlikeComment function', () => {
    it('should remove like from the comment', async () => {
      // Arrange
      const payload = {
        userId: 'user-123',
        commentId: 'comment-123',
      };

      const likeRepository = new LikeRepositoryPostgres(pool, {});
      await LikesTableTestHelper.addLike({
        commentId: payload.commentId,
        userId: payload.userId,
      });

      // Action
      await likeRepository.unlikeComment(payload.userId, payload.commentId);

      // Assert
      const isLiked = await likeRepository.verifyCommentLike(
        payload.userId,
        payload.commentId
      );
      expect(isLiked).toBeFalsy();
    });
  });

  describe('getCommentLikesCountByThreadId function', () => {
    it('should return the count of likes for comments in a thread', async () => {
      // Arrange
      const payload = {
        threadId: 'thread-123',
      };

      const likeRepository = new LikeRepositoryPostgres(pool, {});
      await UsersTableTestHelper.addUser({
        id: 'user-456',
        username: 'user456',
      });
      await LikesTableTestHelper.addLike({
        commentId: 'comment-123',
        userId: 'user-123',
      });
      await LikesTableTestHelper.addLike({
        commentId: 'comment-123',
        userId: 'user-456',
      });

      // Action
      const result = await likeRepository.getCommentLikeCountByThreadId(
        payload.threadId
      );

      // Assert
      expect(result).toEqual([
        {
          comment_id: 'comment-123',
          like_count: 2,
        },
      ]);
    });
  });
});
