import { NotFoundException } from '@nestjs/common';
import { AuthorService } from '@modules/author/application/author.service';
import { IAuthorRepository } from '@modules/author/application/ports/authorRepository.port';
import { Author } from '@modules/author/domain/author.entity';

describe('AuthorService', () => {
  const author = Author.reconstitute('author-1', 'Jane Doe', 2);

  let saveMock: jest.Mock;
  let findMock: jest.Mock;
  let deleteMock: jest.Mock;
  let service: AuthorService;

  beforeEach(() => {
    saveMock = jest.fn((author: Author) => Promise.resolve(author));
    findMock = jest.fn().mockResolvedValue(null);
    deleteMock = jest.fn().mockResolvedValue(undefined);

    const repository: IAuthorRepository = {
      save: saveMock,
      find: findMock,
      delete: deleteMock,
    };

    service = new AuthorService(repository);
  });

  describe('create', () => {
    it('creates and persists an author', async () => {
      const created = await service.create('Jane Doe', 2);

      expect(saveMock).toHaveBeenCalledWith(created);
      expect(created.getName()).toBe('Jane Doe');
      expect(created.getBooksAccount()).toBe(2);
    });
  });

  describe('get', () => {
    it('returns the author from the repository', async () => {
      findMock.mockResolvedValue(author);

      const result = await service.get('author-1');

      expect(result).toBe(author);
      expect(findMock).toHaveBeenCalledWith('author-1');
    });

    it('throws NotFoundException when the author does not exist', async () => {
      await expect(service.get('missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('deletes the author', async () => {
      findMock.mockResolvedValue(author);

      await service.delete('author-1');

      expect(deleteMock).toHaveBeenCalledWith('author-1');
    });

    it('throws NotFoundException when the author does not exist', async () => {
      await expect(service.delete('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
