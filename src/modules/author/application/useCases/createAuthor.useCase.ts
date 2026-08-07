import { Inject, Injectable } from '@nestjs/common';
import { Author } from '@modules/author/domain/entities/author.entity';
import { AUTHOR_REPOSITORY } from '@modules/author/application/ports/out/authorRepository.port';
import type { IAuthorRepository } from '@modules/author/application/ports/out/authorRepository.port';
import type { ICreateAuthorUseCase } from '@modules/author/application/ports/in/createAuthor.port';

@Injectable()
export class CreateAuthorUseCase implements ICreateAuthorUseCase {
  constructor(
    @Inject(AUTHOR_REPOSITORY)
    private readonly authorRepository: IAuthorRepository,
  ) {}

  async execute(name: string, booksAccount: number): Promise<Author> {
    const author = Author.create(name, booksAccount);
    return this.authorRepository.save(author);
  }
}
