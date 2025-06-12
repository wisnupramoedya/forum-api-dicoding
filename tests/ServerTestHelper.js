/* istanbul ignore file */

const ServerTestHelper = {
  async getUserIdAndAccessToken({ server, username = 'dicoding' }) {
    const requestPayload = {
      username,
      password: 'secret',
    };

    const userResponse = await server.inject({
      method: 'POST',
      url: '/users',
      payload: {
        ...requestPayload,
        fullname: 'Dicoding Indonesia',
      },
    });

    const loginResponse = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: requestPayload,
    });

    const { id: userId } = JSON.parse(userResponse.payload).data.addedUser;
    const { accessToken } = JSON.parse(loginResponse.payload).data;
    return { userId, accessToken };
  },
};

module.exports = ServerTestHelper;
