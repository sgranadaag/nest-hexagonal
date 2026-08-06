import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Library } from '@modules/library/domain/entities/library.entity';
import { LIBRARY_REPOSITORY } from '@modules/library/application/ports/libraryRepository.interface';
import type { ILibraryRepository } from '@modules/library/application/ports/libraryRepository.interface';
import { buildCacheKey } from '@utils/cacheKey.util';

const CACHE_NAMESPACE = 'library';

@Injectable()
export class GetLibraryUseCase {
  constructor(
    @Inject(LIBRARY_REPOSITORY)
    private readonly libraryRepository: ILibraryRepository,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  async execute(id: string): Promise<Library> {
    const cacheKey = buildCacheKey(CACHE_NAMESPACE, id);
    const cached = await this.cache.get<Library>(cacheKey);
    if (cached) {
      return cached;
    }

    const library = await this.libraryRepository.find(id);
    if (!library) {
      throw new NotFoundException(`Library ${id} not found`);
    }

    await this.cache.set(cacheKey, library);
    return library;
  }
}
