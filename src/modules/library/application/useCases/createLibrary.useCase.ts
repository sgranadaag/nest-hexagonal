import { Inject, Injectable } from '@nestjs/common';
import { Library } from '@modules/library/domain/entities/library.entity';
import { LIBRARY_REPOSITORY } from '@modules/library/application/ports/out/libraryRepository.port';
import type { ILibraryRepository } from '@modules/library/application/ports/out/libraryRepository.port';
import type { ICreateLibraryUseCase } from '@modules/library/application/ports/in/createLibrary.port';

@Injectable()
export class CreateLibraryUseCase implements ICreateLibraryUseCase {
  constructor(
    @Inject(LIBRARY_REPOSITORY)
    private readonly libraryRepository: ILibraryRepository,
  ) {}

  async execute(name: string, address: string): Promise<Library> {
    const library = Library.create(name, address);
    return this.libraryRepository.save(library);
  }
}
