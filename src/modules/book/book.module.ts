import { Module } from '@nestjs/common';
import { LibraryModule } from '@modules/library/library.module';
import { AuthorModule } from '@modules/author/author.module';
import { BookController } from './infrastructure/presentation/book.controller';
import { CreateBookUseCase } from './application/useCases/createBook.useCase';
import { GetBookUseCase } from './application/useCases/getBook.useCase';
import { GetBookByAuthorUseCase } from './application/useCases/getBookByAuthor.useCase';
import { GetBookByLibraryUseCase } from './application/useCases/getBookByLibrary.useCase';
import { DeleteBookUseCase } from './application/useCases/deleteBook.useCase';
import { InMemoryBookRepository } from './infrastructure/repositories/inMemoryBook.repository';
import { BOOK_REPOSITORY } from './application/interfaces/bookRepository.interface';

@Module({
  imports: [LibraryModule, AuthorModule],
  controllers: [BookController],
  providers: [
    CreateBookUseCase,
    GetBookUseCase,
    GetBookByAuthorUseCase,
    GetBookByLibraryUseCase,
    DeleteBookUseCase,
    { provide: BOOK_REPOSITORY, useClass: InMemoryBookRepository },
  ],
  exports: [BOOK_REPOSITORY],
})
export class BookModule {}
