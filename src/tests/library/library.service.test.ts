import { NotFoundException } from '@nestjs/common';
import { LibraryService } from '@modules/library/application/library.service';
import { LibraryRepositoryPort } from '@modules/library/application/ports/libraryRepository.port';
import { Library } from '@modules/library/domain/library.entity';

describe('LibraryService', () => {
  const library = Library.reconstitute(
    'lib-1',
    'Central Library',
    '123 Main St',
  );

  let saveMock: jest.Mock;
  let findMock: jest.Mock;
  let deleteMock: jest.Mock;
  let service: LibraryService;

  beforeEach(() => {
    saveMock = jest.fn((library: Library) => Promise.resolve(library));
    findMock = jest.fn().mockResolvedValue(null);
    deleteMock = jest.fn().mockResolvedValue(undefined);

    const repository: LibraryRepositoryPort = {
      save: saveMock,
      find: findMock,
      delete: deleteMock,
    };

    service = new LibraryService(repository);
  });

  describe('create', () => {
    it('creates and persists a library', async () => {
      const created = await service.create('Central Library', '123 Main St');

      expect(saveMock).toHaveBeenCalledWith(created);
      expect(created.getName()).toBe('Central Library');
      expect(created.getAddress().get()).toBe('123 Main St');
    });
  });

  describe('get', () => {
    it('returns the library from the repository', async () => {
      findMock.mockResolvedValue(library);

      const result = await service.get('lib-1');

      expect(result).toBe(library);
      expect(findMock).toHaveBeenCalledWith('lib-1');
    });

    it('throws NotFoundException when the library does not exist', async () => {
      await expect(service.get('missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('deletes the library', async () => {
      findMock.mockResolvedValue(library);

      await service.delete('lib-1');

      expect(deleteMock).toHaveBeenCalledWith('lib-1');
    });

    it('throws NotFoundException when the library does not exist', async () => {
      await expect(service.delete('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
