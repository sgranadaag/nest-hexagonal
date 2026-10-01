import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthorController } from './infrastructure/adapters/in/rest/author.controller';
import { AuthorResolver } from './infrastructure/adapters/in/graphql/author.resolver';
import { CreateAuthorUseCase } from './application/useCases/createAuthor.useCase';
import { GetAuthorUseCase } from './application/useCases/getAuthor.useCase';
import { DeleteAuthorUseCase } from './application/useCases/deleteAuthor.useCase';
import { InMemoryAuthorRepository } from './infrastructure/adapters/out/inMemory/inMemoryAuthor.repository';
import { PostgresAuthorEntity } from './infrastructure/adapters/out/postgres/postgresAuthor.entity';
import { PostgresAuthorRepository } from './infrastructure/adapters/out/postgres/postgresAuthor.repository';
import { AUTHOR_REPOSITORY } from './application/ports/out/authorRepository.port';
import { CREATE_AUTHOR_USE_CASE } from './application/ports/in/createAuthor.port';
import { GET_AUTHOR_USE_CASE } from './application/ports/in/getAuthor.port';
import { DELETE_AUTHOR_USE_CASE } from './application/ports/in/deleteAuthor.port';

@Module({
  imports: [TypeOrmModule.forFeature([PostgresAuthorEntity])],
  controllers: [AuthorController],
  providers: [
    AuthorResolver,
    InMemoryAuthorRepository,
    { provide: AUTHOR_REPOSITORY, useClass: PostgresAuthorRepository },
    { provide: CREATE_AUTHOR_USE_CASE, useClass: CreateAuthorUseCase },
    { provide: GET_AUTHOR_USE_CASE, useClass: GetAuthorUseCase },
    { provide: DELETE_AUTHOR_USE_CASE, useClass: DeleteAuthorUseCase },
  ],
  exports: [AUTHOR_REPOSITORY],
})
export class AuthorModule {}
