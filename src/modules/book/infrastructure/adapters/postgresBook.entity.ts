import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { PostgresAuthorEntity } from '@modules/author/infrastructure/adapters/postgresAuthor.entity';
import { PostgresLibraryEntity } from '@modules/library/infrastructure/adapters/postgresLibrary.entity';

@Entity('books')
export class PostgresBookEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  authorId: string;

  @ManyToOne(() => PostgresAuthorEntity, (author) => author.books)
  author: PostgresAuthorEntity;

  @Column()
  libraryId: string;

  @ManyToOne(() => PostgresLibraryEntity, (library) => library.books)
  library: PostgresLibraryEntity;
}
