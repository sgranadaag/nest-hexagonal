import { NotFoundException } from '@nestjs/common';
import type { Cache } from '@nestjs/cache-manager';
import { DeleteBookUseCase } from '@modules/book/application/useCases/deleteBook.useCase';
import { IBookRepository } from '@modules/book/application/interfaces/bookRepository.interface';
import { Book } from '@modules/book/domain/entities/book.entity';

describe('DeleteBookUseCase', () => {
  const book = Book.reconstitute(
    'book-1',
    'DDD',
    'Tackling complexity',
    'author-1',
    'lib-1',
  );

  let findMock: jest.Mock;
  let deleteMock: jest.Mock;
  let delMock: jest.Mock;
  let useCase: DeleteBookUseCase;

  beforeEach(() => {
    findMock = jest.fn().mockResolvedValue(book);
    deleteMock = jest.fn().mockResolvedValue(undefined);
    delMock = jest.fn();

    const repository: IBookRepository = {
      save: jest.fn(),
      find: findMock,
      findByAuthor: jest.fn(),
      findByLibrary: jest.fn(),
      delete: deleteMock,
    };
    const cache = {
      get: jest.fn(),
      set: jest.fn(),
      del: delMock,
    } as unknown as Cache;

    useCase = new DeleteBookUseCase(repository, cache);
  });

  it('deletes the book and evicts the cache entry', async () => {
    await useCase.execute('book-1');

    expect(deleteMock).toHaveBeenCalledWith('book-1');
    expect(delMock).toHaveBeenCalledWith('book:book-1');
  });

  it('throws NotFoundException when the book does not exist', async () => {
    findMock.mockResolvedValue(null);

    await expect(useCase.execute('missing')).rejects.toThrow(NotFoundException);
  });
});
