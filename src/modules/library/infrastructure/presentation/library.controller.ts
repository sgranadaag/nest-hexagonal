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
import { CreateLibraryUseCase } from '@modules/library/application/useCases/createLibrary.useCase';
import { GetLibraryUseCase } from '@modules/library/application/useCases/getLibrary.useCase';
import { DeleteLibraryUseCase } from '@modules/library/application/useCases/deleteLibrary.useCase';
import { CreateLibraryDto } from './dto/createLibrary.dto';
import { LibraryResponseDto } from './dto/libraryResponse.dto';

@Controller('libraries')
export class LibraryController {
  constructor(
    private readonly createLibraryUseCase: CreateLibraryUseCase,
    private readonly getLibraryUseCase: GetLibraryUseCase,
    private readonly deleteLibraryUseCase: DeleteLibraryUseCase,
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
