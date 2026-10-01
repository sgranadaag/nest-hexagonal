import { Inject, ParseUUIDPipe } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CREATE_BOOK_USE_CASE } from '@modules/book/application/ports/in/createBook.port';
import type { ICreateBookUseCase } from '@modules/book/application/ports/in/createBook.port';
import { GET_BOOK_USE_CASE } from '@modules/book/application/ports/in/getBook.port';
import type { IGetBookUseCase } from '@modules/book/application/ports/in/getBook.port';
import { GET_BOOK_BY_AUTHOR_USE_CASE } from '@modules/book/application/ports/in/getBookByAuthor.port';
import type { IGetBookByAuthorUseCase } from '@modules/book/application/ports/in/getBookByAuthor.port';
import { GET_BOOK_BY_LIBRARY_USE_CASE } from '@modules/book/application/ports/in/getBookByLibrary.port';
import type { IGetBookByLibraryUseCase } from '@modules/book/application/ports/in/getBookByLibrary.port';
import { DELETE_BOOK_USE_CASE } from '@modules/book/application/ports/in/deleteBook.port';
import type { IDeleteBookUseCase } from '@modules/book/application/ports/in/deleteBook.port';
import { CreateBookInput } from './dto/createBook.input';
import { BookType } from './dto/book.type';

@Resolver(() => BookType)
export class BookResolver {
  constructor(
    @Inject(CREATE_BOOK_USE_CASE)
    private readonly createBookUseCase: ICreateBookUseCase,
    @Inject(GET_BOOK_USE_CASE)
    private readonly getBookUseCase: IGetBookUseCase,
    @Inject(GET_BOOK_BY_AUTHOR_USE_CASE)
    private readonly getBookByAuthorUseCase: IGetBookByAuthorUseCase,
    @Inject(GET_BOOK_BY_LIBRARY_USE_CASE)
    private readonly getBookByLibraryUseCase: IGetBookByLibraryUseCase,
    @Inject(DELETE_BOOK_USE_CASE)
    private readonly deleteBookUseCase: IDeleteBookUseCase,
  ) {}

  @Mutation(() => BookType)
  async createBook(@Args('input') input: CreateBookInput): Promise<BookType> {
    const book = await this.createBookUseCase.execute(
      input.title,
      input.description,
      input.authorId,
      input.libraryId,
    );
    return BookType.fromDomain(book);
  }

  @Query(() => [BookType])
  async booksByAuthor(
    @Args('authorId', { type: () => ID }, ParseUUIDPipe) authorId: string,
  ): Promise<BookType[]> {
    const books = await this.getBookByAuthorUseCase.execute(authorId);
    return books.map((book) => BookType.fromDomain(book));
  }

  @Query(() => [BookType])
  async booksByLibrary(
    @Args('libraryId', { type: () => ID }, ParseUUIDPipe) libraryId: string,
  ): Promise<BookType[]> {
    const books = await this.getBookByLibraryUseCase.execute(libraryId);
    return books.map((book) => BookType.fromDomain(book));
  }

  @Query(() => BookType)
  async book(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
  ): Promise<BookType> {
    const book = await this.getBookUseCase.execute(id);
    return BookType.fromDomain(book);
  }

  @Mutation(() => Boolean)
  async deleteBook(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
  ): Promise<boolean> {
    await this.deleteBookUseCase.execute(id);
    return true;
  }
}
