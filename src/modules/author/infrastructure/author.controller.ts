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
import { AuthorService } from '@modules/author/application/author.service';
import { CreateAuthorDto } from './dto/createAuthor.dto';
import { AuthorResponseDto } from './dto/authorResponse.dto';

@Controller('authors')
export class AuthorController {
  constructor(private readonly authorService: AuthorService) {}

  @Post()
  async createAuthor(@Body() dto: CreateAuthorDto): Promise<AuthorResponseDto> {
    const author = await this.authorService.create(dto.name, dto.booksAccount);
    return AuthorResponseDto.fromDomain(author);
  }

  @Get(':id')
  async getAuthor(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<AuthorResponseDto> {
    const author = await this.authorService.get(id);
    return AuthorResponseDto.fromDomain(author);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAuthor(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.authorService.delete(id);
  }
}
