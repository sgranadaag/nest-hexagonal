import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { BOOK_REPOSITORY } from '@modules/book/application/interfaces/bookRepository.interface';
import type { IBookRepository } from '@modules/book/application/interfaces/bookRepository.interface';
import { buildCacheKey } from '@utils/cacheKey.util';

const CACHE_NAMESPACE = 'book';

@Injectable()
export class DeleteBookUseCase {
  constructor(
    @Inject(BOOK_REPOSITORY) private readonly bookRepository: IBookRepository,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  async execute(id: string): Promise<void> {
    const book = await this.bookRepository.find(id);
    if (!book) {
      throw new NotFoundException(`Book ${id} not found`);
    }

    await this.bookRepository.delete(id);
    await this.cache.del(buildCacheKey(CACHE_NAMESPACE, id));
  }
}
