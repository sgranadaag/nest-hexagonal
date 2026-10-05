import { Library } from '@modules/library/domain/library.entity';
import { PostgresLibraryEntity } from './postgresLibrary.entity';

export class PostgresLibraryMapper {
  static toDomain(entity: PostgresLibraryEntity): Library {
    return Library.reconstitute(entity.id, entity.name, entity.address);
  }

  static toPersistence(library: Library): PostgresLibraryEntity {
    const entity = new PostgresLibraryEntity();
    entity.id = library.getId().get();
    entity.name = library.getName();
    entity.address = library.getAddress().get();
    return entity;
  }
}
