import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { CreateBookUseCase } from '@modules/book/application/useCases/createBook.useCase';
import { GetBookUseCase } from '@modules/book/application/useCases/getBook.useCase';
import { GetBookByAuthorUseCase } from '@modules/book/application/useCases/getBookByAuthor.useCase';
import { GetBookByLibraryUseCase } from '@modules/book/application/useCases/getBookByLibrary.useCase';
import { DeleteBookUseCase } from '@modules/book/application/useCases/deleteBook.useCase';
import { CreateBookDto } from './dto/createBook.dto';
import { BookResponseDto } from './dto/bookResponse.dto';

@Controller('books')
export class BookController {
  constructor(
    private readonly createBookUseCase: CreateBookUseCase,
    private readonly getBookUseCase: GetBookUseCase,
    private readonly getBookByAuthorUseCase: GetBookByAuthorUseCase,
    private readonly getBookByLibraryUseCase: GetBookByLibraryUseCase,
    private readonly deleteBookUseCase: DeleteBookUseCase,
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
