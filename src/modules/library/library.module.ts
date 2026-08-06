import { Module } from '@nestjs/common';
import { LibraryController } from './infrastructure/presentation/library.controller';
import { CreateLibraryUseCase } from './application/useCases/createLibrary.useCase';
import { GetLibraryUseCase } from './application/useCases/getLibrary.useCase';
import { DeleteLibraryUseCase } from './application/useCases/deleteLibrary.useCase';
import { InMemoryLibraryRepository } from './infrastructure/adapters/inMemoryLibrary.repository';
import { LIBRARY_REPOSITORY } from './application/ports/libraryRepository.interface';

@Module({
  controllers: [LibraryController],
  providers: [
    CreateLibraryUseCase,
    GetLibraryUseCase,
    DeleteLibraryUseCase,
    { provide: LIBRARY_REPOSITORY, useClass: InMemoryLibraryRepository },
  ],
  exports: [LIBRARY_REPOSITORY],
})
export class LibraryModule {}
