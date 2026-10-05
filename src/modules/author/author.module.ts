import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthorController } from './infrastructure/author.controller';
import { AuthorService } from './application/author.service';
import { PostgresAuthorEntity } from './infrastructure/adapters/postgresAuthor.entity';
import { PostgresAuthorAdapter } from './infrastructure/adapters/postgresAuthor.adapter';
import { AUTHOR_REPOSITORY } from './application/ports/authorRepository.port';

@Module({
  imports: [TypeOrmModule.forFeature([PostgresAuthorEntity])],
  controllers: [AuthorController],
  providers: [
    AuthorService,
    { provide: AUTHOR_REPOSITORY, useClass: PostgresAuthorAdapter },
  ],
  exports: [AUTHOR_REPOSITORY],
})
export class AuthorModule {}
