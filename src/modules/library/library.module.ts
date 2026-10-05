import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LibraryController } from './infrastructure/library.controller';
import { LibraryService } from './application/library.service';
import { PostgresLibraryEntity } from './infrastructure/adapters/postgresLibrary.entity';
import { PostgresLibraryAdapter } from './infrastructure/adapters/postgresLibrary.adapter';
import { LIBRARY_REPOSITORY } from './application/ports/libraryRepository.port';

@Module({
  imports: [TypeOrmModule.forFeature([PostgresLibraryEntity])],
  controllers: [LibraryController],
  providers: [
    LibraryService,
    { provide: LIBRARY_REPOSITORY, useClass: PostgresLibraryAdapter },
  ],
  exports: [LIBRARY_REPOSITORY],
})
export class LibraryModule {}
