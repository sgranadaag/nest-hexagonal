import { Injectable } from '@nestjs/common';
import { Book } from '@modules/book/domain/entities/book.entity';
import { IBookRepository } from '@modules/book/application/interfaces/bookRepository.interface';

@Injectable()
export class InMemoryBookRepository implements IBookRepository {
  private readonly books = new Map<string, Book>();

  save(book: Book): Promise<Book> {
    this.books.set(book.getId().get(), book);
    return Promise.resolve(book);
  }

  find(id: string): Promise<Book | null> {
    return Promise.resolve(this.books.get(id) ?? null);
  }

  findByAuthor(authorId: string): Promise<Book[]> {
    const books = [...this.books.values()].filter(
      (book) => book.getAuthorId().get() === authorId,
    );
    return Promise.resolve(books);
  }

  findByLibrary(libraryId: string): Promise<Book[]> {
    const books = [...this.books.values()].filter(
      (book) => book.getLibraryId().get() === libraryId,
    );
    return Promise.resolve(books);
  }

  delete(id: string): Promise<void> {
    this.books.delete(id);
    return Promise.resolve();
  }
}
