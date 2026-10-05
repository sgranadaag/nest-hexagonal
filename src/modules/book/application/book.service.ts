import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Book } from '@modules/book/domain/book.entity';
import { BOOK_REPOSITORY } from '@modules/book/application/ports/bookRepository.port';
import type { IBookRepository } from '@modules/book/application/ports/bookRepository.port';
import { LIBRARY_REPOSITORY } from '@modules/library/application/ports/libraryRepository.port';
import type { ILibraryRepository } from '@modules/library/application/ports/libraryRepository.port';
import { AUTHOR_REPOSITORY } from '@modules/author/application/ports/authorRepository.port';
import type { IAuthorRepository } from '@modules/author/application/ports/authorRepository.port';

@Injectable()
export class BookService {
  constructor(
    @Inject(BOOK_REPOSITORY) private readonly bookRepository: IBookRepository,
    @Inject(LIBRARY_REPOSITORY)
    private readonly libraryRepository: ILibraryRepository,
    @Inject(AUTHOR_REPOSITORY)
    private readonly authorRepository: IAuthorRepository,
  ) {}

  async create(
    title: string,
    description: string,
    authorId: string,
    libraryId: string,
  ): Promise<Book> {
    const [library, author] = await Promise.all([
      this.libraryRepository.find(libraryId),
      this.authorRepository.find(authorId),
    ]);

    if (!library) {
      throw new NotFoundException(`Library ${libraryId} not found`);
    }
    if (!author) {
      throw new NotFoundException(`Author ${authorId} not found`);
    }

    const book = Book.create(title, description, authorId, libraryId);
    return this.bookRepository.save(book);
  }

  async get(id: string): Promise<Book> {
    const book = await this.bookRepository.find(id);
    if (!book) {
      throw new NotFoundException(`Book ${id} not found`);
    }

    return book;
  }

  async getByAuthor(authorId: string): Promise<Book[]> {
    return this.bookRepository.findByAuthor(authorId);
  }

  async getByLibrary(libraryId: string): Promise<Book[]> {
    return this.bookRepository.findByLibrary(libraryId);
  }

  async delete(id: string): Promise<void> {
    const book = await this.bookRepository.find(id);
    if (!book) {
      throw new NotFoundException(`Book ${id} not found`);
    }

    await this.bookRepository.delete(id);
  }
}
