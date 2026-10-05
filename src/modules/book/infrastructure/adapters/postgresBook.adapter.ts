import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from '@modules/book/domain/book.entity';
import { BookRepositoryPort } from '@modules/book/application/ports/bookRepository.port';
import { PostgresBookEntity } from './postgresBook.entity';
import { PostgresBookMapper } from './postgresBook.mapper';

@Injectable()
export class PostgresBookAdapter implements BookRepositoryPort {
  constructor(
    @InjectRepository(PostgresBookEntity)
    private readonly repository: Repository<PostgresBookEntity>,
  ) {}

  async save(book: Book): Promise<Book> {
    const entity = PostgresBookMapper.toPersistence(book);
    await this.repository.save(entity);
    return book;
  }

  async find(id: string): Promise<Book | null> {
    const entity = await this.repository.findOneBy({ id });
    return entity ? PostgresBookMapper.toDomain(entity) : null;
  }

  async findByAuthor(authorId: string): Promise<Book[]> {
    const entities = await this.repository.findBy({ authorId });
    return entities.map((entity) => PostgresBookMapper.toDomain(entity));
  }

  async findByLibrary(libraryId: string): Promise<Book[]> {
    const entities = await this.repository.findBy({ libraryId });
    return entities.map((entity) => PostgresBookMapper.toDomain(entity));
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
