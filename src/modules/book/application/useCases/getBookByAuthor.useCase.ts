import { Inject, Injectable } from '@nestjs/common';
import { Book } from '@modules/book/domain/entities/book.entity';
import { BOOK_REPOSITORY } from '@modules/book/application/ports/bookRepository.interface';
import type { IBookRepository } from '@modules/book/application/ports/bookRepository.interface';

@Injectable()
export class GetBookByAuthorUseCase {
  constructor(
    @Inject(BOOK_REPOSITORY) private readonly bookRepository: IBookRepository,
  ) {}

  async execute(authorId: string): Promise<Book[]> {
    return this.bookRepository.findByAuthor(authorId);
  }
}
