import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Book } from '@modules/book/domain/entities/book.entity';
import { BOOK_REPOSITORY } from '@modules/book/application/ports/bookRepository.interface';
import type { IBookRepository } from '@modules/book/application/ports/bookRepository.interface';
import { buildCacheKey } from '@utils/cacheKey.util';

const CACHE_NAMESPACE = 'book';

@Injectable()
export class GetBookUseCase {
  constructor(
    @Inject(BOOK_REPOSITORY) private readonly bookRepository: IBookRepository,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  async execute(id: string): Promise<Book> {
    const cacheKey = buildCacheKey(CACHE_NAMESPACE, id);
    const cached = await this.cache.get<Book>(cacheKey);
    if (cached) {
      return cached;
    }

    const book = await this.bookRepository.find(id);
    if (!book) {
      throw new NotFoundException(`Book ${id} not found`);
    }

    await this.cache.set(cacheKey, book);
    return book;
  }
}
