import { Book } from '@modules/book/domain/entities/book.entity';

export const GET_BOOK_BY_AUTHOR_USE_CASE = Symbol('IGetBookByAuthorUseCase');

export interface IGetBookByAuthorUseCase {
  execute(authorId: string): Promise<Book[]>;
}
