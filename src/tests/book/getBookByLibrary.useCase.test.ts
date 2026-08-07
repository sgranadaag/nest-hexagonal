import { GetBookByLibraryUseCase } from '@modules/book/application/useCases/getBookByLibrary.useCase';
import { IBookRepository } from '@modules/book/application/ports/out/bookRepository.port';
import { Book } from '@modules/book/domain/entities/book.entity';

describe('GetBookByLibraryUseCase', () => {
  it('returns the books held by the given library', async () => {
    const books = [
      Book.reconstitute(
        'book-1',
        'DDD',
        'Tackling complexity',
        'author-1',
        'lib-1',
      ),
    ];
    const findByLibraryMock = jest.fn().mockResolvedValue(books);
    const repository: IBookRepository = {
      save: jest.fn(),
      find: jest.fn(),
      findByAuthor: jest.fn(),
      findByLibrary: findByLibraryMock,
      delete: jest.fn(),
    };
    const useCase = new GetBookByLibraryUseCase(repository);

    const result = await useCase.execute('lib-1');

    expect(result).toBe(books);
    expect(findByLibraryMock).toHaveBeenCalledWith('lib-1');
  });
});
