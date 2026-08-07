import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
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
import { CreateBookDto } from './dto/createBook.dto';
import { BookResponseDto } from './dto/bookResponse.dto';

@Controller('books')
export class BookController {
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

  @Post()
  async createBook(@Body() dto: CreateBookDto): Promise<BookResponseDto> {
    const book = await this.createBookUseCase.execute(
      dto.title,
      dto.description,
      dto.authorId,
      dto.libraryId,
    );
    return BookResponseDto.fromDomain(book);
  }

  @Get('author/:authorId')
  async getBooksByAuthor(
    @Param('authorId', ParseUUIDPipe) authorId: string,
  ): Promise<BookResponseDto[]> {
    const books = await this.getBookByAuthorUseCase.execute(authorId);
    return books.map((book) => BookResponseDto.fromDomain(book));
  }

  @Get('library/:libraryId')
  async getBooksByLibrary(
    @Param('libraryId', ParseUUIDPipe) libraryId: string,
  ): Promise<BookResponseDto[]> {
    const books = await this.getBookByLibraryUseCase.execute(libraryId);
    return books.map((book) => BookResponseDto.fromDomain(book));
  }

  @Get(':id')
  async getBook(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<BookResponseDto> {
    const book = await this.getBookUseCase.execute(id);
    return BookResponseDto.fromDomain(book);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBook(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.deleteBookUseCase.execute(id);
  }
}
