import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Book } from '@modules/book/domain/entities/book.entity';
import { BOOK_REPOSITORY } from '@modules/book/application/ports/bookRepository.interface';
import type { IBookRepository } from '@modules/book/application/ports/bookRepository.interface';
import { LIBRARY_REPOSITORY } from '@modules/library/application/ports/libraryRepository.interface';
import type { ILibraryRepository } from '@modules/library/application/ports/libraryRepository.interface';
import { AUTHOR_REPOSITORY } from '@modules/author/application/ports/authorRepository.interface';
import type { IAuthorRepository } from '@modules/author/application/ports/authorRepository.interface';

@Injectable()
export class CreateBookUseCase {
  constructor(
    @Inject(BOOK_REPOSITORY) private readonly bookRepository: IBookRepository,
    @Inject(LIBRARY_REPOSITORY)
    private readonly libraryRepository: ILibraryRepository,
    @Inject(AUTHOR_REPOSITORY)
    private readonly authorRepository: IAuthorRepository,
  ) {}

  async execute(
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
}
