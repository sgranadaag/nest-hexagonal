import { AuthorId } from '@modules/author/domain/valueObjects/authorId.valueObject';

export class Author {
  private constructor(
    private readonly id: AuthorId,
    private readonly name: string,
    private readonly booksAccount: number,
  ) {}

  static create(name: string, booksAccount: number): Author {
    return new Author(AuthorId.create(), name, booksAccount);
  }

  static reconstitute(id: string, name: string, booksAccount: number): Author {
    return new Author(AuthorId.from(id), name, booksAccount);
  }

  getId(): AuthorId {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getBooksAccount(): number {
    return this.booksAccount;
  }
}
