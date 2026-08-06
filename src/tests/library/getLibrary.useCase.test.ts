import { NotFoundException } from '@nestjs/common';
import type { Cache } from '@nestjs/cache-manager';
import { GetLibraryUseCase } from '@modules/library/application/useCases/getLibrary.useCase';
import { ILibraryRepository } from '@modules/library/application/interfaces/libraryRepository.interface';
import { Library } from '@modules/library/domain/entities/library.entity';

describe('GetLibraryUseCase', () => {
  const library = Library.reconstitute(
    'lib-1',
    'Central Library',
    '123 Main St',
  );

  let findMock: jest.Mock;
  let getMock: jest.Mock;
  let setMock: jest.Mock;
  let useCase: GetLibraryUseCase;

  beforeEach(() => {
    findMock = jest.fn().mockResolvedValue(null);
    getMock = jest.fn().mockResolvedValue(undefined);
    setMock = jest.fn();

    const repository: ILibraryRepository = {
      save: jest.fn(),
      find: findMock,
      delete: jest.fn(),
    };
    const cache = { get: getMock, set: setMock } as unknown as Cache;

    useCase = new GetLibraryUseCase(repository, cache);
  });

  it('returns the cached library without hitting the repository', async () => {
    getMock.mockResolvedValue(library);

    const result = await useCase.execute('lib-1');

    expect(result).toBe(library);
    expect(findMock).not.toHaveBeenCalled();
  });

  it('falls back to the repository and caches the result on a cache miss', async () => {
    findMock.mockResolvedValue(library);

    const result = await useCase.execute('lib-1');

    expect(result).toBe(library);
    expect(setMock).toHaveBeenCalledWith('library:lib-1', library);
  });

  it('throws NotFoundException when the library does not exist', async () => {
    await expect(useCase.execute('missing')).rejects.toThrow(NotFoundException);
  });
});
