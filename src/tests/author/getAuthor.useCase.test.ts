import { NotFoundException } from '@nestjs/common';
import type { Cache } from '@nestjs/cache-manager';
import { GetAuthorUseCase } from '@modules/author/application/useCases/getAuthor.useCase';
import { IAuthorRepository } from '@modules/author/application/ports/out/authorRepository.port';
import { Author } from '@modules/author/domain/entities/author.entity';

describe('GetAuthorUseCase', () => {
  const author = Author.reconstitute('author-1', 'Jane Doe', 2);

  let findMock: jest.Mock;
  let getMock: jest.Mock;
  let setMock: jest.Mock;
  let useCase: GetAuthorUseCase;

  beforeEach(() => {
    findMock = jest.fn().mockResolvedValue(null);
    getMock = jest.fn().mockResolvedValue(undefined);
    setMock = jest.fn();

    const repository: IAuthorRepository = {
      save: jest.fn(),
      find: findMock,
      delete: jest.fn(),
    };
    const cache = { get: getMock, set: setMock } as unknown as Cache;

    useCase = new GetAuthorUseCase(repository, cache);
  });

  it('returns the cached author without hitting the repository', async () => {
    getMock.mockResolvedValue(author);

    const result = await useCase.execute('author-1');

    expect(result).toBe(author);
    expect(findMock).not.toHaveBeenCalled();
  });

  it('falls back to the repository and caches the result on a cache miss', async () => {
    findMock.mockResolvedValue(author);

    const result = await useCase.execute('author-1');

    expect(result).toBe(author);
    expect(setMock).toHaveBeenCalledWith('author:author-1', author);
  });

  it('throws NotFoundException when the author does not exist', async () => {
    await expect(useCase.execute('missing')).rejects.toThrow(NotFoundException);
  });
});
