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
import { CREATE_LIBRARY_USE_CASE } from '@modules/library/application/ports/in/createLibrary.port';
import type { ICreateLibraryUseCase } from '@modules/library/application/ports/in/createLibrary.port';
import { GET_LIBRARY_USE_CASE } from '@modules/library/application/ports/in/getLibrary.port';
import type { IGetLibraryUseCase } from '@modules/library/application/ports/in/getLibrary.port';
import { DELETE_LIBRARY_USE_CASE } from '@modules/library/application/ports/in/deleteLibrary.port';
import type { IDeleteLibraryUseCase } from '@modules/library/application/ports/in/deleteLibrary.port';
import { CreateLibraryDto } from './dto/createLibrary.dto';
import { LibraryResponseDto } from './dto/libraryResponse.dto';

@Controller('libraries')
export class LibraryController {
  constructor(
    @Inject(CREATE_LIBRARY_USE_CASE)
    private readonly createLibraryUseCase: ICreateLibraryUseCase,
    @Inject(GET_LIBRARY_USE_CASE)
    private readonly getLibraryUseCase: IGetLibraryUseCase,
    @Inject(DELETE_LIBRARY_USE_CASE)
    private readonly deleteLibraryUseCase: IDeleteLibraryUseCase,
  ) {}

  @Post()
  async createLibrary(
    @Body() dto: CreateLibraryDto,
  ): Promise<LibraryResponseDto> {
    const library = await this.createLibraryUseCase.execute(
      dto.name,
      dto.address,
    );
    return LibraryResponseDto.fromDomain(library);
  }

  @Get(':id')
  async getLibrary(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<LibraryResponseDto> {
    const library = await this.getLibraryUseCase.execute(id);
    return LibraryResponseDto.fromDomain(library);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteLibrary(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.deleteLibraryUseCase.execute(id);
  }
}
