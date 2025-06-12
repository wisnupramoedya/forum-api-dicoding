const AddThreadUseCase = require('../AddThreadUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const NewThread = require('../../../Domains/threads/entities/NewThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');

describe('AddThreadUseCase', () => {
  it('should orchestrate the add thread action correctly', async () => {
    // Arrange
    const useCasePayload = {
      title: 'Ini judul thread',
      body: 'Ini body thread.',
      owner: 'user-123',
    };

    const expectedAddedThread = new AddedThread({
      id: 'thread-123',
      title: useCasePayload.title,
      body: useCasePayload.body,
      owner: useCasePayload.owner,
      date: '2025-05-30T12:00:00.000Z',
    });

    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.addThread = jest.fn(() => Promise.resolve(
      new AddedThread({
        id: 'thread-123',
        title: useCasePayload.title,
        body: useCasePayload.body,
        owner: useCasePayload.owner,
        date: '2025-05-30T12:00:00.000Z',
      }),
    ));

    const addThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Act
    const addedThread = await addThreadUseCase.execute(useCasePayload);

    // Assert
    expect(addedThread).toStrictEqual(expectedAddedThread);
    expect(mockThreadRepository.addThread).toHaveBeenCalledWith(
      new NewThread(useCasePayload),
    );
  });
});
