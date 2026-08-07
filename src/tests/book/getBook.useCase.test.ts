import { NotFoundException } from '@nestjs/common';
import type { Cache } from '@nestjs/cache-manager';
import { GetBookUseCase } from '@modules/book/application/useCases/getBook.useCase';
import { IBookRepository } from '@modules/book/application/ports/out/bookRepository.port';
import { Book } from '@modules/book/domain/entities/book.entity';

describe('GetBookUseCase', () => {
  const book = Book.reconstitute(
    'book-1',
    'DDD',
    'Tackling complexity',
    'author-1',
    'lib-1',
  );

  let findMock: jest.Mock;
  let getMock: jest.Mock;
  let setMock: jest.Mock;
  let useCase: GetBookUseCase;

  beforeEach(() => {
    findMock = jest.fn().mockResolvedValue(null);
    getMock = jest.fn().mockResolvedValue(undefined);
    setMock = jest.fn();

    const repository: IBookRepository = {
      save: jest.fn(),
      find: findMock,
      findByAuthor: jest.fn(),
      findByLibrary: jest.fn(),
      delete: jest.fn(),
    };
    const cache = { get: getMock, set: setMock } as unknown as Cache;

    useCase = new GetBookUseCase(repository, cache);
  });

  it('returns the cached book without hitting the repository', async () => {
    getMock.mockResolvedValue(book);

    const result = await useCase.execute('book-1');

    expect(result).toBe(book);
    expect(findMock).not.toHaveBeenCalled();
  });

  it('falls back to the repository and caches the result on a cache miss', async () => {
    findMock.mockResolvedValue(book);

    const result = await useCase.execute('book-1');

    expect(result).toBe(book);
    expect(setMock).toHaveBeenCalledWith('book:book-1', book);
  });

  it('throws NotFoundException when the book does not exist', async () => {
    await expect(useCase.execute('missing')).rejects.toThrow(NotFoundException);
  });
});
