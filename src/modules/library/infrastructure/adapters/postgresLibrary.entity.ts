import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { PostgresBookEntity } from '@modules/book/infrastructure/adapters/postgresBook.entity';

@Entity('libraries')
export class PostgresLibraryEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  address: string;

  @OneToMany(() => PostgresBookEntity, (book) => book.library)
  books: PostgresBookEntity[];
}
