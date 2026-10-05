import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Author } from '@modules/author/domain/author.entity';
import { AUTHOR_REPOSITORY } from '@modules/author/application/ports/authorRepository.port';
import type { IAuthorRepository } from '@modules/author/application/ports/authorRepository.port';

@Injectable()
export class AuthorService {
  constructor(
    @Inject(AUTHOR_REPOSITORY)
    private readonly authorRepository: IAuthorRepository,
  ) {}

  async create(name: string, booksAccount: number): Promise<Author> {
    const author = Author.create(name, booksAccount);
    return this.authorRepository.save(author);
  }

  async get(id: string): Promise<Author> {
    const author = await this.authorRepository.find(id);
    if (!author) {
      throw new NotFoundException(`Author ${id} not found`);
    }

    return author;
  }

  async delete(id: string): Promise<void> {
    const author = await this.authorRepository.find(id);
    if (!author) {
      throw new NotFoundException(`Author ${id} not found`);
    }

    await this.authorRepository.delete(id);
  }
}
