import { CreateAuthorUseCase } from '@modules/author/application/useCases/createAuthor.useCase';
import { IAuthorRepository } from '@modules/author/application/interfaces/authorRepository.interface';
import { Author } from '@modules/author/domain/entities/author.entity';

describe('CreateAuthorUseCase', () => {
  it('creates and persists an author', async () => {
    const saveMock = jest.fn((author: Author) => Promise.resolve(author));
    const repository: IAuthorRepository = {
      save: saveMock,
      find: jest.fn(),
      delete: jest.fn(),
    };
    const useCase = new CreateAuthorUseCase(repository);

    const author = await useCase.execute('Jane Doe', 2);

    expect(saveMock).toHaveBeenCalledWith(author);
    expect(author.getName()).toBe('Jane Doe');
    expect(author.getBooksAccount()).toBe(2);
  });
});
