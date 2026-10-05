import { NotFoundException } from '@nestjs/common';
import { BookService } from '@modules/book/application/book.service';
import { BookRepositoryPort } from '@modules/book/application/ports/bookRepository.port';
import { LibraryRepositoryPort } from '@modules/library/application/ports/libraryRepository.port';
import { AuthorRepositoryPort } from '@modules/author/application/ports/authorRepository.port';
import { Book } from '@modules/book/domain/book.entity';
import { Library } from '@modules/library/domain/library.entity';
import { Author } from '@modules/author/domain/author.entity';

describe('BookService', () => {
  const library = Library.reconstitute(
    'lib-1',
    'Central Library',
    '123 Main St',
  );
  const author = Author.reconstitute('author-1', 'Jane Doe', 2);
  const book = Book.reconstitute(
    'book-1',
    'DDD',
    'Tackling complexity',
    'author-1',
    'lib-1',
  );

  let saveMock: jest.Mock;
  let findMock: jest.Mock;
  let findByAuthorMock: jest.Mock;
  let findByLibraryMock: jest.Mock;
  let deleteMock: jest.Mock;
  let libraryFindMock: jest.Mock;
  let authorFindMock: jest.Mock;
  let service: BookService;

  beforeEach(() => {
    saveMock = jest.fn((book: Book) => Promise.resolve(book));
    findMock = jest.fn().mockResolvedValue(null);
    findByAuthorMock = jest.fn();
    findByLibraryMock = jest.fn();
    deleteMock = jest.fn().mockResolvedValue(undefined);
    libraryFindMock = jest.fn().mockResolvedValue(library);
    authorFindMock = jest.fn().mockResolvedValue(author);

    const bookRepository: BookRepositoryPort = {
      save: saveMock,
      find: findMock,
      findByAuthor: findByAuthorMock,
      findByLibrary: findByLibraryMock,
      delete: deleteMock,
    };
    const libraryRepository: LibraryRepositoryPort = {
      save: jest.fn(),
      find: libraryFindMock,
      delete: jest.fn(),
    };
    const authorRepository: AuthorRepositoryPort = {
      save: jest.fn(),
      find: authorFindMock,
      delete: jest.fn(),
    };

    service = new BookService(
      bookRepository,
      libraryRepository,
      authorRepository,
    );
  });

  describe('create', () => {
    it('creates and persists a book when both the library and author exist', async () => {
      const created = await service.create(
        'DDD',
        'Tackling complexity',
        'author-1',
        'lib-1',
      );

      expect(saveMock).toHaveBeenCalledWith(created);
      expect(created.getAuthorId().get()).toBe('author-1');
      expect(created.getLibraryId().get()).toBe('lib-1');
    });

    it('throws NotFoundException when the library does not exist', async () => {
      libraryFindMock.mockResolvedValue(null);

      await expect(
        service.create('DDD', 'Tackling complexity', 'author-1', 'missing-lib'),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException when the author does not exist', async () => {
      authorFindMock.mockResolvedValue(null);

      await expect(
        service.create('DDD', 'Tackling complexity', 'missing-author', 'lib-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('get', () => {
    it('returns the book from the repository', async () => {
      findMock.mockResolvedValue(book);

      const result = await service.get('book-1');

      expect(result).toBe(book);
      expect(findMock).toHaveBeenCalledWith('book-1');
    });

    it('throws NotFoundException when the book does not exist', async () => {
      await expect(service.get('missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getByAuthor', () => {
    it('returns the books written by the given author', async () => {
      const books = [book];
      findByAuthorMock.mockResolvedValue(books);

      const result = await service.getByAuthor('author-1');

      expect(result).toBe(books);
      expect(findByAuthorMock).toHaveBeenCalledWith('author-1');
    });
  });

  describe('getByLibrary', () => {
    it('returns the books held by the given library', async () => {
      const books = [book];
      findByLibraryMock.mockResolvedValue(books);

      const result = await service.getByLibrary('lib-1');

      expect(result).toBe(books);
      expect(findByLibraryMock).toHaveBeenCalledWith('lib-1');
    });
  });

  describe('delete', () => {
    it('deletes the book', async () => {
      findMock.mockResolvedValue(book);

      await service.delete('book-1');

      expect(deleteMock).toHaveBeenCalledWith('book-1');
    });

    it('throws NotFoundException when the book does not exist', async () => {
      await expect(service.delete('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
