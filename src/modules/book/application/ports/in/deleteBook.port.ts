export const DELETE_BOOK_USE_CASE = Symbol('IDeleteBookUseCase');

export interface IDeleteBookUseCase {
  execute(id: string): Promise<void>;
}
