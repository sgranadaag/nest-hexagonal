import { Book } from '@modules/book/domain/entities/book.entity';

export const BOOK_REPOSITORY = Symbol('IBookRepository');

export interface IBookRepository {
  save(book: Book): Promise<Book>;
  find(id: string): Promise<Book | null>;
  findByAuthor(authorId: string): Promise<Book[]>;
  findByLibrary(libraryId: string): Promise<Book[]>;
  delete(id: string): Promise<void>;
}
