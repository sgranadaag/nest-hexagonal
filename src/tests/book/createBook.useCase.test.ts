import { NotFoundException } from '@nestjs/common';
import { CreateBookUseCase } from '@modules/book/application/useCases/createBook.useCase';
import { IBookRepository } from '@modules/book/application/ports/out/bookRepository.port';
import { ILibraryRepository } from '@modules/library/application/ports/out/libraryRepository.port';
import { IAuthorRepository } from '@modules/author/application/ports/out/authorRepository.port';
import { Book } from '@modules/book/domain/entities/book.entity';
import { Library } from '@modules/library/domain/entities/library.entity';
import { Author } from '@modules/author/domain/entities/author.entity';

describe('CreateBookUseCase', () => {
  const library = Library.reconstitute(
    'lib-1',
    'Central Library',
    '123 Main St',
  );
  const author = Author.reconstitute('author-1', 'Jane Doe', 2);

  let saveMock: jest.Mock;
  let libraryFindMock: jest.Mock;
  let authorFindMock: jest.Mock;
  let useCase: CreateBookUseCase;

  beforeEach(() => {
    saveMock = jest.fn((book: Book) => Promise.resolve(book));
    libraryFindMock = jest.fn().mockResolvedValue(library);
    authorFindMock = jest.fn().mockResolvedValue(author);

    const bookRepository: IBookRepository = {
      save: saveMock,
      find: jest.fn(),
      findByAuthor: jest.fn(),
      findByLibrary: jest.fn(),
      delete: jest.fn(),
    };
    const libraryRepository: ILibraryRepository = {
      save: jest.fn(),
      find: libraryFindMock,
      delete: jest.fn(),
    };
    const authorRepository: IAuthorRepository = {
      save: jest.fn(),
      find: authorFindMock,
      delete: jest.fn(),
    };

    useCase = new CreateBookUseCase(
      bookRepository,
      libraryRepository,
      authorRepository,
    );
  });

  it('creates and persists a book when both the library and author exist', async () => {
    const book = await useCase.execute(
      'DDD',
      'Tackling complexity',
      'author-1',
      'lib-1',
    );

    expect(saveMock).toHaveBeenCalledWith(book);
    expect(book.getAuthorId().get()).toBe('author-1');
    expect(book.getLibraryId().get()).toBe('lib-1');
  });

  it('throws NotFoundException when the library does not exist', async () => {
    libraryFindMock.mockResolvedValue(null);

    await expect(
      useCase.execute('DDD', 'Tackling complexity', 'author-1', 'missing-lib'),
    ).rejects.toThrow(NotFoundException);
  });

  it('throws NotFoundException when the author does not exist', async () => {
    authorFindMock.mockResolvedValue(null);

    await expect(
      useCase.execute('DDD', 'Tackling complexity', 'missing-author', 'lib-1'),
    ).rejects.toThrow(NotFoundException);
  });
});
