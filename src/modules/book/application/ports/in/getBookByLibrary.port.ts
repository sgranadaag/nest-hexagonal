import { Book } from '@modules/book/domain/entities/book.entity';

export const GET_BOOK_BY_LIBRARY_USE_CASE = Symbol('IGetBookByLibraryUseCase');

export interface IGetBookByLibraryUseCase {
  execute(libraryId: string): Promise<Book[]>;
}
