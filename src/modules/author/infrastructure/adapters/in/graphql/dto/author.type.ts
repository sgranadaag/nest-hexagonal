import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { Author } from '@modules/author/domain/entities/author.entity';

@ObjectType('Author')
export class AuthorType {
  @Field(() => ID)
  readonly id: string;

  @Field()
  readonly name: string;

  @Field(() => Int)
  readonly booksAccount: number;

  private constructor(id: string, name: string, booksAccount: number) {
    this.id = id;
    this.name = name;
    this.booksAccount = booksAccount;
  }

  static fromDomain(author: Author): AuthorType {
    return new AuthorType(
      author.getId().get(),
      author.getName(),
      author.getBooksAccount(),
    );
  }
}
