import { Author } from '@modules/author/domain/entities/author.entity';

export class AuthorResponseDto {
  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly booksAccount: number,
  ) {}

  static fromDomain(author: Author): AuthorResponseDto {
    return new AuthorResponseDto(
      author.getId().get(),
      author.getName(),
      author.getBooksAccount(),
    );
  }
}
