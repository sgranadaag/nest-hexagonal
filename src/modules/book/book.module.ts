import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { LibraryModule } from '@modules/library/library.module';
import { AuthorModule } from '@modules/author/author.module';
import { BookController } from './infrastructure/book.controller';
import { BookService } from './application/book.service';
import { PostgresBookEntity } from './infrastructure/adapters/postgresBook.entity';
import { PostgresBookAdapter } from './infrastructure/adapters/postgresBook.adapter';
import { CachedBookDecorator } from './infrastructure/adapters/cachedBook.decorator';
import { BOOK_REPOSITORY } from './application/ports/bookRepository.port';
import type { BookRepositoryPort } from './application/ports/bookRepository.port';

@Module({
  imports: [
    LibraryModule,
    AuthorModule,
    TypeOrmModule.forFeature([PostgresBookEntity]),
  ],
  controllers: [BookController],
  providers: [
    BookService,
    PostgresBookAdapter,
    {
      provide: BOOK_REPOSITORY,
      inject: [PostgresBookAdapter, CACHE_MANAGER],
      useFactory: (adapter: BookRepositoryPort, cache: Cache) =>
        new CachedBookDecorator(adapter, cache),
    },
  ],
  exports: [BOOK_REPOSITORY],
})
export class BookModule {}
