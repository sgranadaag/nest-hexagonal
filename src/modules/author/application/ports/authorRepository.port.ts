import { Author } from '@modules/author/domain/author.entity';

export const AUTHOR_REPOSITORY = Symbol('IAuthorRepository');

export interface IAuthorRepository {
  save(author: Author): Promise<Author>;
  find(id: string): Promise<Author | null>;
  delete(id: string): Promise<void>;
}
