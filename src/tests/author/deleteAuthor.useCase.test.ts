import { NotFoundException } from '@nestjs/common';
import type { Cache } from '@nestjs/cache-manager';
import { DeleteAuthorUseCase } from '@modules/author/application/useCases/deleteAuthor.useCase';
import { IAuthorRepository } from '@modules/author/application/interfaces/authorRepository.interface';
import { Author } from '@modules/author/domain/entities/author.entity';

describe('DeleteAuthorUseCase', () => {
  const author = Author.reconstitute('author-1', 'Jane Doe', 2);

  let findMock: jest.Mock;
  let deleteMock: jest.Mock;
  let delMock: jest.Mock;
  let useCase: DeleteAuthorUseCase;

  beforeEach(() => {
    findMock = jest.fn().mockResolvedValue(author);
    deleteMock = jest.fn().mockResolvedValue(undefined);
    delMock = jest.fn();

    const repository: IAuthorRepository = {
      save: jest.fn(),
      find: findMock,
      delete: deleteMock,
    };
    const cache = {
      get: jest.fn(),
      set: jest.fn(),
      del: delMock,
    } as unknown as Cache;

    useCase = new DeleteAuthorUseCase(repository, cache);
  });

  it('deletes the author and evicts the cache entry', async () => {
    await useCase.execute('author-1');

    expect(deleteMock).toHaveBeenCalledWith('author-1');
    expect(delMock).toHaveBeenCalledWith('author:author-1');
  });

  it('throws NotFoundException when the author does not exist', async () => {
    findMock.mockResolvedValue(null);

    await expect(useCase.execute('missing')).rejects.toThrow(NotFoundException);
  });
});
