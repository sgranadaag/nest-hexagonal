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
import { CREATE_AUTHOR_USE_CASE } from '@modules/author/application/ports/in/createAuthor.port';
import type { ICreateAuthorUseCase } from '@modules/author/application/ports/in/createAuthor.port';
import { GET_AUTHOR_USE_CASE } from '@modules/author/application/ports/in/getAuthor.port';
import type { IGetAuthorUseCase } from '@modules/author/application/ports/in/getAuthor.port';
import { DELETE_AUTHOR_USE_CASE } from '@modules/author/application/ports/in/deleteAuthor.port';
import type { IDeleteAuthorUseCase } from '@modules/author/application/ports/in/deleteAuthor.port';
import { CreateAuthorDto } from './dto/createAuthor.dto';
import { AuthorResponseDto } from './dto/authorResponse.dto';

@Controller('authors')
export class AuthorController {
  constructor(
    @Inject(CREATE_AUTHOR_USE_CASE)
    private readonly createAuthorUseCase: ICreateAuthorUseCase,
    @Inject(GET_AUTHOR_USE_CASE)
    private readonly getAuthorUseCase: IGetAuthorUseCase,
    @Inject(DELETE_AUTHOR_USE_CASE)
    private readonly deleteAuthorUseCase: IDeleteAuthorUseCase,
  ) {}

  @Post()
  async createAuthor(@Body() dto: CreateAuthorDto): Promise<AuthorResponseDto> {
    const author = await this.createAuthorUseCase.execute(
      dto.name,
      dto.booksAccount,
    );
    return AuthorResponseDto.fromDomain(author);
  }

  @Get(':id')
  async getAuthor(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<AuthorResponseDto> {
    const author = await this.getAuthorUseCase.execute(id);
    return AuthorResponseDto.fromDomain(author);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAuthor(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.deleteAuthorUseCase.execute(id);
  }
}
