import { Book } from '@modules/book/domain/book.entity';

export const BOOK_REPOSITORY = Symbol('BookRepositoryPort');

export interface BookRepositoryPort {
  save(book: Book): Promise<Book>;
  find(id: string): Promise<Book | null>;
  findByAuthor(authorId: string): Promise<Book[]>;
  findByLibrary(libraryId: string): Promise<Book[]>;
  delete(id: string): Promise<void>;
}
