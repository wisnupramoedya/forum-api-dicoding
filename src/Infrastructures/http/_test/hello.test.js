const createServer = require('../createServer');

describe('/ endpoint', () => {
  it('should response 200 and return hello world', async () => {
    // Arrange
    const server = await createServer({});

    // Action
    const response = await server.inject({
      method: 'GET',
      url: '/hello',
    });

    // Assert
    const responseJson = JSON.parse(response.payload);
    expect(response.statusCode).toEqual(200);
    expect(responseJson.status).toEqual('success');
    expect(responseJson.data.message).toEqual('Hello, World!');
  });
});
