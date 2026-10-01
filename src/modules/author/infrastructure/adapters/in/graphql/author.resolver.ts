import { Inject, ParseUUIDPipe } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CREATE_AUTHOR_USE_CASE } from '@modules/author/application/ports/in/createAuthor.port';
import type { ICreateAuthorUseCase } from '@modules/author/application/ports/in/createAuthor.port';
import { GET_AUTHOR_USE_CASE } from '@modules/author/application/ports/in/getAuthor.port';
import type { IGetAuthorUseCase } from '@modules/author/application/ports/in/getAuthor.port';
import { DELETE_AUTHOR_USE_CASE } from '@modules/author/application/ports/in/deleteAuthor.port';
import type { IDeleteAuthorUseCase } from '@modules/author/application/ports/in/deleteAuthor.port';
import { CreateAuthorInput } from './dto/createAuthor.input';
import { AuthorType } from './dto/author.type';

@Resolver(() => AuthorType)
export class AuthorResolver {
  constructor(
    @Inject(CREATE_AUTHOR_USE_CASE)
    private readonly createAuthorUseCase: ICreateAuthorUseCase,
    @Inject(GET_AUTHOR_USE_CASE)
    private readonly getAuthorUseCase: IGetAuthorUseCase,
    @Inject(DELETE_AUTHOR_USE_CASE)
    private readonly deleteAuthorUseCase: IDeleteAuthorUseCase,
  ) {}

  @Mutation(() => AuthorType)
  async createAuthor(
    @Args('input') input: CreateAuthorInput,
  ): Promise<AuthorType> {
    const author = await this.createAuthorUseCase.execute(
      input.name,
      input.booksAccount,
    );
    return AuthorType.fromDomain(author);
  }

  @Query(() => AuthorType)
  async author(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
  ): Promise<AuthorType> {
    const author = await this.getAuthorUseCase.execute(id);
    return AuthorType.fromDomain(author);
  }

  @Mutation(() => Boolean)
  async deleteAuthor(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
  ): Promise<boolean> {
    await this.deleteAuthorUseCase.execute(id);
    return true;
  }
}
