import { Module } from '@nestjs/common';
import { AuthorController } from './infrastructure/presentation/author.controller';
import { CreateAuthorUseCase } from './application/useCases/createAuthor.useCase';
import { GetAuthorUseCase } from './application/useCases/getAuthor.useCase';
import { DeleteAuthorUseCase } from './application/useCases/deleteAuthor.useCase';
import { InMemoryAuthorRepository } from './infrastructure/adapters/inMemoryAuthor.repository';
import { AUTHOR_REPOSITORY } from './application/ports/authorRepository.interface';

@Module({
  controllers: [AuthorController],
  providers: [
    CreateAuthorUseCase,
    GetAuthorUseCase,
    DeleteAuthorUseCase,
    { provide: AUTHOR_REPOSITORY, useClass: InMemoryAuthorRepository },
  ],
  exports: [AUTHOR_REPOSITORY],
})
export class AuthorModule {}
