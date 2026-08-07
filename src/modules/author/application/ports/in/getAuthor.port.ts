import { Author } from '@modules/author/domain/entities/author.entity';

export const GET_AUTHOR_USE_CASE = Symbol('IGetAuthorUseCase');

export interface IGetAuthorUseCase {
  execute(id: string): Promise<Author>;
}
