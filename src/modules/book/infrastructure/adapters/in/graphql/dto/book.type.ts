import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Book } from '@modules/book/domain/entities/book.entity';

@ObjectType('Book')
export class BookType {
  @Field(() => ID)
  readonly id: string;

  @Field()
  readonly title: string;

  @Field()
  readonly description: string;

  @Field(() => ID)
  readonly authorId: string;

  @Field(() => ID)
  readonly libraryId: string;

  private constructor(
    id: string,
    title: string,
    description: string,
    authorId: string,
    libraryId: string,
  ) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.authorId = authorId;
    this.libraryId = libraryId;
  }

  static fromDomain(book: Book): BookType {
    return new BookType(
      book.getId().get(),
      book.getTitle(),
      book.getDescription(),
      book.getAuthorId().get(),
      book.getLibraryId().get(),
    );
  }
}
