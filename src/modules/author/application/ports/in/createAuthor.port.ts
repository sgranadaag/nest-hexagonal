import { Author } from '@modules/author/domain/entities/author.entity';

export const CREATE_AUTHOR_USE_CASE = Symbol('ICreateAuthorUseCase');

export interface ICreateAuthorUseCase {
  execute(name: string, booksAccount: number): Promise<Author>;
}
