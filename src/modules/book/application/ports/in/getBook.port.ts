import { Book } from '@modules/book/domain/entities/book.entity';

export const GET_BOOK_USE_CASE = Symbol('IGetBookUseCase');

export interface IGetBookUseCase {
  execute(id: string): Promise<Book>;
}
