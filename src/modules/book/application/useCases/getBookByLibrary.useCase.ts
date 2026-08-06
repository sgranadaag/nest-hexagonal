import { Inject, Injectable } from '@nestjs/common';
import { Book } from '@modules/book/domain/entities/book.entity';
import { BOOK_REPOSITORY } from '@modules/book/application/interfaces/bookRepository.interface';
import type { IBookRepository } from '@modules/book/application/interfaces/bookRepository.interface';

@Injectable()
export class GetBookByLibraryUseCase {
  constructor(
    @Inject(BOOK_REPOSITORY) private readonly bookRepository: IBookRepository,
  ) {}

  async execute(libraryId: string): Promise<Book[]> {
    return this.bookRepository.findByLibrary(libraryId);
  }
}
