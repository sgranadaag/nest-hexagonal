import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Library } from '@modules/library/domain/library.entity';
import { LIBRARY_REPOSITORY } from '@modules/library/application/ports/libraryRepository.port';
import type { LibraryRepositoryPort } from '@modules/library/application/ports/libraryRepository.port';

@Injectable()
export class LibraryService {
  constructor(
    @Inject(LIBRARY_REPOSITORY)
    private readonly libraryRepository: LibraryRepositoryPort,
  ) {}

  async create(name: string, address: string): Promise<Library> {
    const library = Library.create(name, address);
    return this.libraryRepository.save(library);
  }

  async get(id: string): Promise<Library> {
    const library = await this.libraryRepository.find(id);
    if (!library) {
      throw new NotFoundException(`Library ${id} not found`);
    }

    return library;
  }

  async delete(id: string): Promise<void> {
    const library = await this.libraryRepository.find(id);
    if (!library) {
      throw new NotFoundException(`Library ${id} not found`);
    }

    await this.libraryRepository.delete(id);
  }
}
