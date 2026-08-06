import { GetBookByAuthorUseCase } from '@modules/book/application/useCases/getBookByAuthor.useCase';
import { IBookRepository } from '@modules/book/application/interfaces/bookRepository.interface';
import { Book } from '@modules/book/domain/entities/book.entity';

describe('GetBookByAuthorUseCase', () => {
  it('returns the books written by the given author', async () => {
    const books = [
      Book.reconstitute(
        'book-1',
        'DDD',
        'Tackling complexity',
        'author-1',
        'lib-1',
      ),
    ];
    const findByAuthorMock = jest.fn().mockResolvedValue(books);
    const repository: IBookRepository = {
      save: jest.fn(),
      find: jest.fn(),
      findByAuthor: findByAuthorMock,
      findByLibrary: jest.fn(),
      delete: jest.fn(),
    };
    const useCase = new GetBookByAuthorUseCase(repository);

    const result = await useCase.execute('author-1');

    expect(result).toBe(books);
    expect(findByAuthorMock).toHaveBeenCalledWith('author-1');
  });
});
