import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { AUTHOR_REPOSITORY } from '@modules/author/application/interfaces/authorRepository.interface';
import type { IAuthorRepository } from '@modules/author/application/interfaces/authorRepository.interface';
import { buildCacheKey } from '@utils/cacheKey.util';

const CACHE_NAMESPACE = 'author';

@Injectable()
export class DeleteAuthorUseCase {
  constructor(
    @Inject(AUTHOR_REPOSITORY)
    private readonly authorRepository: IAuthorRepository,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  async execute(id: string): Promise<void> {
    const author = await this.authorRepository.find(id);
    if (!author) {
      throw new NotFoundException(`Author ${id} not found`);
    }

    await this.authorRepository.delete(id);
    await this.cache.del(buildCacheKey(CACHE_NAMESPACE, id));
  }
}
