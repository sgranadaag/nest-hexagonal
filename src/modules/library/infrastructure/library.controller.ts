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
import { LibraryService } from '@modules/library/application/library.service';
import { CreateLibraryDto } from './dto/createLibrary.dto';
import { LibraryResponseDto } from './dto/libraryResponse.dto';

@Controller('libraries')
export class LibraryController {
  constructor(private readonly libraryService: LibraryService) {}

  @Post()
  async createLibrary(
    @Body() dto: CreateLibraryDto,
  ): Promise<LibraryResponseDto> {
    const library = await this.libraryService.create(dto.name, dto.address);
    return LibraryResponseDto.fromDomain(library);
  }

  @Get(':id')
  async getLibrary(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<LibraryResponseDto> {
    const library = await this.libraryService.get(id);
    return LibraryResponseDto.fromDomain(library);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteLibrary(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.libraryService.delete(id);
  }
}
