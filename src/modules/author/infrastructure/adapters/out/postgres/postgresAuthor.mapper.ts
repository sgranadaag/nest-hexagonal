import { Author } from '@modules/author/domain/entities/author.entity';
import { PostgresAuthorEntity } from './postgresAuthor.entity';

export class PostgresAuthorMapper {
  static toDomain(entity: PostgresAuthorEntity): Author {
    return Author.reconstitute(entity.id, entity.name, entity.booksAccount);
  }

  static toPersistence(author: Author): PostgresAuthorEntity {
    const entity = new PostgresAuthorEntity();
    entity.id = author.getId().get();
    entity.name = author.getName();
    entity.booksAccount = author.getBooksAccount();
    return entity;
  }
}
