import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LibraryModule } from '@modules/library/library.module';
import { AuthorModule } from '@modules/author/author.module';
import { BookController } from './infrastructure/adapters/in/rest/book.controller';
import { CreateBookUseCase } from './application/useCases/createBook.useCase';
import { GetBookUseCase } from './application/useCases/getBook.useCase';
import { GetBookByAuthorUseCase } from './application/useCases/getBookByAuthor.useCase';
import { GetBookByLibraryUseCase } from './application/useCases/getBookByLibrary.useCase';
import { DeleteBookUseCase } from './application/useCases/deleteBook.useCase';
import { InMemoryBookRepository } from './infrastructure/adapters/out/inMemory/inMemoryBook.repository';
import { PostgresBookEntity } from './infrastructure/adapters/out/postgres/postgresBook.entity';
import { PostgresBookRepository } from './infrastructure/adapters/out/postgres/postgresBook.repository';
import { BOOK_REPOSITORY } from './application/ports/out/bookRepository.port';
import { CREATE_BOOK_USE_CASE } from './application/ports/in/createBook.port';
import { GET_BOOK_USE_CASE } from './application/ports/in/getBook.port';
import { GET_BOOK_BY_AUTHOR_USE_CASE } from './application/ports/in/getBookByAuthor.port';
import { GET_BOOK_BY_LIBRARY_USE_CASE } from './application/ports/in/getBookByLibrary.port';
import { DELETE_BOOK_USE_CASE } from './application/ports/in/deleteBook.port';

@Module({
  imports: [
    LibraryModule,
    AuthorModule,
    TypeOrmModule.forFeature([PostgresBookEntity]),
  ],
  controllers: [BookController],
  providers: [
    InMemoryBookRepository,
    { provide: BOOK_REPOSITORY, useClass: PostgresBookRepository },
    { provide: CREATE_BOOK_USE_CASE, useClass: CreateBookUseCase },
    { provide: GET_BOOK_USE_CASE, useClass: GetBookUseCase },
    { provide: GET_BOOK_BY_AUTHOR_USE_CASE, useClass: GetBookByAuthorUseCase },
    {
      provide: GET_BOOK_BY_LIBRARY_USE_CASE,
      useClass: GetBookByLibraryUseCase,
    },
    { provide: DELETE_BOOK_USE_CASE, useClass: DeleteBookUseCase },
  ],
  exports: [BOOK_REPOSITORY],
})
export class BookModule {}
