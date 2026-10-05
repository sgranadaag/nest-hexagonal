import { Author } from '@modules/author/domain/author.entity';

export const AUTHOR_REPOSITORY = Symbol('AuthorRepositoryPort');

export interface AuthorRepositoryPort {
  save(author: Author): Promise<Author>;
  find(id: string): Promise<Author | null>;
  delete(id: string): Promise<void>;
}
