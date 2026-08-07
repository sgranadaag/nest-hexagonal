import { Library } from '@modules/library/domain/entities/library.entity';

export const GET_LIBRARY_USE_CASE = Symbol('IGetLibraryUseCase');

export interface IGetLibraryUseCase {
  execute(id: string): Promise<Library>;
}
