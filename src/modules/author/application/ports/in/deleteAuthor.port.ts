export const DELETE_AUTHOR_USE_CASE = Symbol('IDeleteAuthorUseCase');

export interface IDeleteAuthorUseCase {
  execute(id: string): Promise<void>;
}
