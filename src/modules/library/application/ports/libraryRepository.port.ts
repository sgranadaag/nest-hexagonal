import { Library } from '@modules/library/domain/library.entity';

export const LIBRARY_REPOSITORY = Symbol('ILibraryRepository');

export interface ILibraryRepository {
  save(library: Library): Promise<Library>;
  find(id: string): Promise<Library | null>;
  delete(id: string): Promise<void>;
}
