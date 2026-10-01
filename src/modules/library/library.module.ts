import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LibraryController } from './infrastructure/adapters/in/rest/library.controller';
import { CreateLibraryUseCase } from './application/useCases/createLibrary.useCase';
import { GetLibraryUseCase } from './application/useCases/getLibrary.useCase';
import { DeleteLibraryUseCase } from './application/useCases/deleteLibrary.useCase';
import { InMemoryLibraryRepository } from './infrastructure/adapters/out/inMemory/inMemoryLibrary.repository';
import { PostgresLibraryEntity } from './infrastructure/adapters/out/postgres/postgresLibrary.entity';
import { PostgresLibraryRepository } from './infrastructure/adapters/out/postgres/postgresLibrary.repository';
import { LIBRARY_REPOSITORY } from './application/ports/out/libraryRepository.port';
import { CREATE_LIBRARY_USE_CASE } from './application/ports/in/createLibrary.port';
import { GET_LIBRARY_USE_CASE } from './application/ports/in/getLibrary.port';
import { DELETE_LIBRARY_USE_CASE } from './application/ports/in/deleteLibrary.port';

@Module({
  imports: [TypeOrmModule.forFeature([PostgresLibraryEntity])],
  controllers: [LibraryController],
  providers: [
    InMemoryLibraryRepository,
    { provide: LIBRARY_REPOSITORY, useClass: PostgresLibraryRepository },
    { provide: CREATE_LIBRARY_USE_CASE, useClass: CreateLibraryUseCase },
    { provide: GET_LIBRARY_USE_CASE, useClass: GetLibraryUseCase },
    { provide: DELETE_LIBRARY_USE_CASE, useClass: DeleteLibraryUseCase },
  ],
  exports: [LIBRARY_REPOSITORY],
})
export class LibraryModule {}
