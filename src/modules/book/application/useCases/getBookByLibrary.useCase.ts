import { Inject, Injectable } from '@nestjs/common';
import { Book } from '@modules/book/domain/entities/book.entity';
import { BOOK_REPOSITORY } from '@modules/book/application/ports/out/bookRepository.port';
import type { IBookRepository } from '@modules/book/application/ports/out/bookRepository.port';
import type { IGetBookByLibraryUseCase } from '@modules/book/application/ports/in/getBookByLibrary.port';

@Injectable()
export class GetBookByLibraryUseCase implements IGetBookByLibraryUseCase {
  constructor(
    @Inject(BOOK_REPOSITORY) private readonly bookRepository: IBookRepository,
  ) {}

  async execute(libraryId: string): Promise<Book[]> {
    return this.bookRepository.findByLibrary(libraryId);
  }
}
