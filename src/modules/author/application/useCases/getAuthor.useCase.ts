import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Author } from '@modules/author/domain/entities/author.entity';
import { AUTHOR_REPOSITORY } from '@modules/author/application/ports/out/authorRepository.port';
import type { IAuthorRepository } from '@modules/author/application/ports/out/authorRepository.port';
import { buildCacheKey } from '@utils/cacheKey.util';
import type { IGetAuthorUseCase } from '@modules/author/application/ports/in/getAuthor.port';

const CACHE_NAMESPACE = 'author';

@Injectable()
export class GetAuthorUseCase implements IGetAuthorUseCase {
  constructor(
    @Inject(AUTHOR_REPOSITORY)
    private readonly authorRepository: IAuthorRepository,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  async execute(id: string): Promise<Author> {
    const cacheKey = buildCacheKey(CACHE_NAMESPACE, id);
    const cached = await this.cache.get<Author>(cacheKey);
    if (cached) {
      return cached;
    }

    const author = await this.authorRepository.find(id);
    if (!author) {
      throw new NotFoundException(`Author ${id} not found`);
    }

    await this.cache.set(cacheKey, author);
    return author;
  }
}
