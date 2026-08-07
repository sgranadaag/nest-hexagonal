import { Book } from '@modules/book/domain/entities/book.entity';

export class BookResponseDto {
  private constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly description: string,
    public readonly authorId: string,
    public readonly libraryId: string,
  ) {}

  static fromDomain(book: Book): BookResponseDto {
    return new BookResponseDto(
      book.getId().get(),
      book.getTitle(),
      book.getDescription(),
      book.getAuthorId().get(),
      book.getLibraryId().get(),
    );
  }
}
