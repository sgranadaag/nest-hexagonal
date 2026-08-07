import { Library } from '@modules/library/domain/entities/library.entity';

export const CREATE_LIBRARY_USE_CASE = Symbol('ICreateLibraryUseCase');

export interface ICreateLibraryUseCase {
  execute(name: string, address: string): Promise<Library>;
}
