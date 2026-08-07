import { Inject, Injectable } from '@nestjs/common';
import { Book } from '@modules/book/domain/entities/book.entity';
import { BOOK_REPOSITORY } from '@modules/book/application/ports/out/bookRepository.port';
import type { IBookRepository } from '@modules/book/application/ports/out/bookRepository.port';
import type { IGetBookByAuthorUseCase } from '@modules/book/application/ports/in/getBookByAuthor.port';

@Injectable()
export class GetBookByAuthorUseCase implements IGetBookByAuthorUseCase {
  constructor(
    @Inject(BOOK_REPOSITORY) private readonly bookRepository: IBookRepository,
  ) {}

  async execute(authorId: string): Promise<Book[]> {
    return this.bookRepository.findByAuthor(authorId);
  }
}
