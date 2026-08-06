import { Injectable } from '@nestjs/common';
import { Author } from '@modules/author/domain/entities/author.entity';
import { IAuthorRepository } from '@modules/author/application/ports/authorRepository.interface';

@Injectable()
export class InMemoryAuthorRepository implements IAuthorRepository {
  private readonly authors = new Map<string, Author>();

  save(author: Author): Promise<Author> {
    this.authors.set(author.getId().get(), author);
    return Promise.resolve(author);
  }

  find(id: string): Promise<Author | null> {
    return Promise.resolve(this.authors.get(id) ?? null);
  }

  delete(id: string): Promise<void> {
    this.authors.delete(id);
    return Promise.resolve();
  }
}
