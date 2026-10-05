import { BookId } from '@modules/book/domain/valueObjects/bookId.valueObject';
import { LibraryId } from '@modules/library/domain/valueObjects/libraryId.valueObject';
import { AuthorId } from '@modules/author/domain/valueObjects/authorId.valueObject';

export class Book {
  private constructor(
    private readonly id: BookId,
    private readonly title: string,
    private readonly description: string,
    private readonly authorId: AuthorId,
    private readonly libraryId: LibraryId,
  ) {}

  static create(
    title: string,
    description: string,
    authorId: string,
    libraryId: string,
  ): Book {
    return new Book(
      BookId.create(),
      title,
      description,
      AuthorId.from(authorId),
      LibraryId.from(libraryId),
    );
  }

  static reconstitute(
    id: string,
    title: string,
    description: string,
    authorId: string,
    libraryId: string,
  ): Book {
    return new Book(
      BookId.from(id),
      title,
      description,
      AuthorId.from(authorId),
      LibraryId.from(libraryId),
    );
  }

  getId(): BookId {
    return this.id;
  }

  getTitle(): string {
    return this.title;
  }

  getDescription(): string {
    return this.description;
  }

  getAuthorId(): AuthorId {
    return this.authorId;
  }

  getLibraryId(): LibraryId {
    return this.libraryId;
  }
}
