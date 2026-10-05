import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Author } from '@modules/author/domain/author.entity';
import { IAuthorRepository } from '@modules/author/application/ports/authorRepository.port';
import { PostgresAuthorEntity } from './postgresAuthor.entity';
import { PostgresAuthorMapper } from './postgresAuthor.mapper';

@Injectable()
export class PostgresAuthorAdapter implements IAuthorRepository {
  constructor(
    @InjectRepository(PostgresAuthorEntity)
    private readonly repository: Repository<PostgresAuthorEntity>,
  ) {}

  async save(author: Author): Promise<Author> {
    const entity = PostgresAuthorMapper.toPersistence(author);
    await this.repository.save(entity);
    return author;
  }

  async find(id: string): Promise<Author | null> {
    const entity = await this.repository.findOneBy({ id });
    return entity ? PostgresAuthorMapper.toDomain(entity) : null;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
