import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Library } from '@modules/library/domain/entities/library.entity';
import { ILibraryRepository } from '@modules/library/application/ports/out/libraryRepository.port';
import { PostgresLibraryEntity } from './postgresLibrary.entity';
import { PostgresLibraryMapper } from './postgresLibrary.mapper';

@Injectable()
export class PostgresLibraryRepository implements ILibraryRepository {
  constructor(
    @InjectRepository(PostgresLibraryEntity)
    private readonly repository: Repository<PostgresLibraryEntity>,
  ) {}

  async save(library: Library): Promise<Library> {
    const entity = PostgresLibraryMapper.toPersistence(library);
    await this.repository.save(entity);
    return library;
  }

  async find(id: string): Promise<Library | null> {
    const entity = await this.repository.findOneBy({ id });
    return entity ? PostgresLibraryMapper.toDomain(entity) : null;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
