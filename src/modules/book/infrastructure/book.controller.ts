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
import { BookService } from '@modules/book/application/book.service';
import { CreateBookDto } from './dto/createBook.dto';
import { BookResponseDto } from './dto/bookResponse.dto';

@Controller('books')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Post()
  async createBook(@Body() dto: CreateBookDto): Promise<BookResponseDto> {
    const book = await this.bookService.create(
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
    const books = await this.bookService.getByAuthor(authorId);
    return books.map((book) => BookResponseDto.fromDomain(book));
  }

  @Get('library/:libraryId')
  async getBooksByLibrary(
    @Param('libraryId', ParseUUIDPipe) libraryId: string,
  ): Promise<BookResponseDto[]> {
    const books = await this.bookService.getByLibrary(libraryId);
    return books.map((book) => BookResponseDto.fromDomain(book));
  }

  @Get(':id')
  async getBook(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<BookResponseDto> {
    const book = await this.bookService.get(id);
    return BookResponseDto.fromDomain(book);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBook(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.bookService.delete(id);
  }
}
