const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');
const pool = require('../../database/postgres/pool');
const container = require('../../container');
const createServer = require('../createServer');

describe('/replies endpoint', () => {
  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('when POST /threads/{threadId}/comments/{commentId}/replies', () => {
    it('should response 401 when request without authentication', async () => {
      // Arrange
      const requestPayload = {
        content: 'Isi balasan',
      };
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments/comment-123/replies',
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 404 when comment not found', async () => {
      // Arrange
      const requestPayload = {
        content: 'Isi balasan',
      };
      const server = await createServer(container);
      const { userId, accessToken } = await ServerTestHelper.getUserIdAndAccessToken({
        server,
      });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: userId,
      });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments/comment-999/replies',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('comment tidak ditemukan');
    });

    it('should response 400 when request payload does not contain required property', async () => {
      // Arrange
      const requestPayload = {};
      const server = await createServer(container);
      const { userId, accessToken } = await ServerTestHelper.getUserIdAndAccessToken({
        server,
      });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: userId,
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
        owner: userId,
      });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments/comment-123/replies',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        'tidak dapat membuat reply baru karena properti yang dibutuhkan tidak ada',
      );
    });

    it('should response 400 when request payload does not meet data type specification', async () => {
      // Arrange
      const requestPayload = {
        content: 12345, // Invalid type
      };
      const server = await createServer(container);
      const { userId, accessToken } = await ServerTestHelper.getUserIdAndAccessToken({
        server,
      });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: userId,
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
        owner: userId,
      });
      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments/comment-123/replies',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        'tidak dapat membuat reply baru karena tipe data tidak sesuai',
      );
    });

    it('should response 201 and persist new reply', async () => {
      // Arrange
      const requestPayload = {
        content: 'Isi balasan',
      };
      const server = await createServer(container);
      const { userId, accessToken } = await ServerTestHelper.getUserIdAndAccessToken({
        server,
      });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: userId,
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
        owner: userId,
      });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments/comment-123/replies',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedReply).toBeDefined();
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}', () => {
    it('should response 401 when request without authentication', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123/replies/reply-123',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 404 when reply not found', async () => {
      // Arrange
      const server = await createServer(container);
      const { userId, accessToken } = await ServerTestHelper.getUserIdAndAccessToken({
        server,
      });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: userId,
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
        owner: userId,
      });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123/replies/reply-999',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('reply tidak ditemukan');
    });

    it('should response 403 when user is not the owner of the reply', async () => {
      // Arrange
      const server = await createServer(container);
      const { userId, accessToken } = await ServerTestHelper.getUserIdAndAccessToken({
        server,
      });

      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: userId,
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
        owner: userId,
      });
      const otherUserId = 'user-456';
      await UsersTableTestHelper.addUser({
        id: otherUserId,
        username: 'otheruser',
        password: 'secret',
      });
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        content: 'Balasan lain',
        commentId: 'comment-123',
        owner: otherUserId,
      });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123/replies/reply-123',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        'anda tidak berhak mengakses resource ini',
      );
    });

    it('should response 200 and delete reply', async () => {
      // Arrange
      const server = await createServer(container);
      const { userId, accessToken } = await ServerTestHelper.getUserIdAndAccessToken({
        server,
      });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: userId,
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
        owner: userId,
      });
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        content: 'Balasan',
        commentId: 'comment-123',
        owner: userId,
      });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123/replies/reply-123',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });
  });
});
