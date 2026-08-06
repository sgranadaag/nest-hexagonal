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
import { CreateAuthorUseCase } from '@modules/author/application/useCases/createAuthor.useCase';
import { GetAuthorUseCase } from '@modules/author/application/useCases/getAuthor.useCase';
import { DeleteAuthorUseCase } from '@modules/author/application/useCases/deleteAuthor.useCase';
import { CreateAuthorDto } from './dto/createAuthor.dto';
import { AuthorResponseDto } from './dto/authorResponse.dto';

@Controller('authors')
export class AuthorController {
  constructor(
    private readonly createAuthorUseCase: CreateAuthorUseCase,
    private readonly getAuthorUseCase: GetAuthorUseCase,
    private readonly deleteAuthorUseCase: DeleteAuthorUseCase,
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
