import { Inject, ParseUUIDPipe } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CREATE_LIBRARY_USE_CASE } from '@modules/library/application/ports/in/createLibrary.port';
import type { ICreateLibraryUseCase } from '@modules/library/application/ports/in/createLibrary.port';
import { GET_LIBRARY_USE_CASE } from '@modules/library/application/ports/in/getLibrary.port';
import type { IGetLibraryUseCase } from '@modules/library/application/ports/in/getLibrary.port';
import { DELETE_LIBRARY_USE_CASE } from '@modules/library/application/ports/in/deleteLibrary.port';
import type { IDeleteLibraryUseCase } from '@modules/library/application/ports/in/deleteLibrary.port';
import { CreateLibraryInput } from './dto/createLibrary.input';
import { LibraryType } from './dto/library.type';

@Resolver(() => LibraryType)
export class LibraryResolver {
  constructor(
    @Inject(CREATE_LIBRARY_USE_CASE)
    private readonly createLibraryUseCase: ICreateLibraryUseCase,
    @Inject(GET_LIBRARY_USE_CASE)
    private readonly getLibraryUseCase: IGetLibraryUseCase,
    @Inject(DELETE_LIBRARY_USE_CASE)
    private readonly deleteLibraryUseCase: IDeleteLibraryUseCase,
  ) {}

  @Mutation(() => LibraryType)
  async createLibrary(
    @Args('input') input: CreateLibraryInput,
  ): Promise<LibraryType> {
    const library = await this.createLibraryUseCase.execute(
      input.name,
      input.address,
    );
    return LibraryType.fromDomain(library);
  }

  @Query(() => LibraryType)
  async library(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
  ): Promise<LibraryType> {
    const library = await this.getLibraryUseCase.execute(id);
    return LibraryType.fromDomain(library);
  }

  @Mutation(() => Boolean)
  async deleteLibrary(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
  ): Promise<boolean> {
    await this.deleteLibraryUseCase.execute(id);
    return true;
  }
}
