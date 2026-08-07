import { NotFoundException } from '@nestjs/common';
import type { Cache } from '@nestjs/cache-manager';
import { DeleteLibraryUseCase } from '@modules/library/application/useCases/deleteLibrary.useCase';
import { ILibraryRepository } from '@modules/library/application/ports/out/libraryRepository.port';
import { Library } from '@modules/library/domain/entities/library.entity';

describe('DeleteLibraryUseCase', () => {
  const library = Library.reconstitute(
    'lib-1',
    'Central Library',
    '123 Main St',
  );

  let findMock: jest.Mock;
  let deleteMock: jest.Mock;
  let delMock: jest.Mock;
  let useCase: DeleteLibraryUseCase;

  beforeEach(() => {
    findMock = jest.fn().mockResolvedValue(library);
    deleteMock = jest.fn().mockResolvedValue(undefined);
    delMock = jest.fn();

    const repository: ILibraryRepository = {
      save: jest.fn(),
      find: findMock,
      delete: deleteMock,
    };
    const cache = {
      get: jest.fn(),
      set: jest.fn(),
      del: delMock,
    } as unknown as Cache;

    useCase = new DeleteLibraryUseCase(repository, cache);
  });

  it('deletes the library and evicts the cache entry', async () => {
    await useCase.execute('lib-1');

    expect(deleteMock).toHaveBeenCalledWith('lib-1');
    expect(delMock).toHaveBeenCalledWith('library:lib-1');
  });

  it('throws NotFoundException when the library does not exist', async () => {
    findMock.mockResolvedValue(null);

    await expect(useCase.execute('missing')).rejects.toThrow(NotFoundException);
  });
});
