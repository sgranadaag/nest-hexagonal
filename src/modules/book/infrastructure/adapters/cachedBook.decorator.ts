import type { Cache } from '@nestjs/cache-manager';
import { Book } from '@modules/book/domain/book.entity';
import { IBookRepository } from '@modules/book/application/ports/bookRepository.port';
import { buildCacheKey } from '@utils/cacheKey.util';

const CACHE_NAMESPACE = 'book';

interface BookSnapshot {
  id: string;
  title: string;
  description: string;
  authorId: string;
  libraryId: string;
}

export class CachedBookDecorator implements IBookRepository {
  constructor(
    private readonly inner: IBookRepository,
    private readonly cache: Cache,
  ) {}

  async save(book: Book): Promise<Book> {
    const saved = await this.inner.save(book);
    await this.cache.del(buildCacheKey(CACHE_NAMESPACE, book.getId().get()));
    return saved;
  }

  async find(id: string): Promise<Book | null> {
    const cacheKey = buildCacheKey(CACHE_NAMESPACE, id);
    const cached = await this.cache.get<BookSnapshot>(cacheKey);
    if (cached) {
      return Book.reconstitute(
        cached.id,
        cached.title,
        cached.description,
        cached.authorId,
        cached.libraryId,
      );
    }

    const book = await this.inner.find(id);
    if (book) {
      const snapshot: BookSnapshot = {
        id: book.getId().get(),
        title: book.getTitle(),
        description: book.getDescription(),
        authorId: book.getAuthorId().get(),
        libraryId: book.getLibraryId().get(),
      };
      await this.cache.set(cacheKey, snapshot);
    }
    return book;
  }

  findByAuthor(authorId: string): Promise<Book[]> {
    return this.inner.findByAuthor(authorId);
  }

  findByLibrary(libraryId: string): Promise<Book[]> {
    return this.inner.findByLibrary(libraryId);
  }

  async delete(id: string): Promise<void> {
    await this.inner.delete(id);
    await this.cache.del(buildCacheKey(CACHE_NAMESPACE, id));
  }
}
