export const DELETE_LIBRARY_USE_CASE = Symbol('IDeleteLibraryUseCase');

export interface IDeleteLibraryUseCase {
  execute(id: string): Promise<void>;
}
