import { Book } from '@modules/book/domain/entities/book.entity';

export const CREATE_BOOK_USE_CASE = Symbol('ICreateBookUseCase');

export interface ICreateBookUseCase {
  execute(
    title: string,
    description: string,
    authorId: string,
    libraryId: string,
  ): Promise<Book>;
}
