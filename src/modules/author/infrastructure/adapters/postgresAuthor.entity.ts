import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { PostgresBookEntity } from '@modules/book/infrastructure/adapters/postgresBook.entity';

@Entity('authors')
export class PostgresAuthorEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  booksAccount: number;

  @OneToMany(() => PostgresBookEntity, (book) => book.author)
  books: PostgresBookEntity[];
}
