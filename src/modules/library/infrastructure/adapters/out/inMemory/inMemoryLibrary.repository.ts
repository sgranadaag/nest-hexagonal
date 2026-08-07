import { Injectable } from '@nestjs/common';
import { Library } from '@modules/library/domain/entities/library.entity';
import { ILibraryRepository } from '@modules/library/application/ports/out/libraryRepository.port';

@Injectable()
export class InMemoryLibraryRepository implements ILibraryRepository {
  private readonly libraries = new Map<string, Library>();

  save(library: Library): Promise<Library> {
    this.libraries.set(library.getId().get(), library);
    return Promise.resolve(library);
  }

  find(id: string): Promise<Library | null> {
    return Promise.resolve(this.libraries.get(id) ?? null);
  }

  delete(id: string): Promise<void> {
    this.libraries.delete(id);
    return Promise.resolve();
  }
}
