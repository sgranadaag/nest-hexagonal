import { Book } from '@modules/book/domain/book.entity';
import { PostgresBookEntity } from './postgresBook.entity';

export class PostgresBookMapper {
  static toDomain(entity: PostgresBookEntity): Book {
    return Book.reconstitute(
      entity.id,
      entity.title,
      entity.description,
      entity.authorId,
      entity.libraryId,
    );
  }

  static toPersistence(book: Book): PostgresBookEntity {
    const entity = new PostgresBookEntity();
    entity.id = book.getId().get();
    entity.title = book.getTitle();
    entity.description = book.getDescription();
    entity.authorId = book.getAuthorId().get();
    entity.libraryId = book.getLibraryId().get();
    return entity;
  }
}
