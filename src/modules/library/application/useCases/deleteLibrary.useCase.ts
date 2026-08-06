import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { LIBRARY_REPOSITORY } from '@modules/library/application/interfaces/libraryRepository.interface';
import type { ILibraryRepository } from '@modules/library/application/interfaces/libraryRepository.interface';
import { buildCacheKey } from '@utils/cacheKey.util';

const CACHE_NAMESPACE = 'library';

@Injectable()
export class DeleteLibraryUseCase {
  constructor(
    @Inject(LIBRARY_REPOSITORY)
    private readonly libraryRepository: ILibraryRepository,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  async execute(id: string): Promise<void> {
    const library = await this.libraryRepository.find(id);
    if (!library) {
      throw new NotFoundException(`Library ${id} not found`);
    }

    await this.libraryRepository.delete(id);
    await this.cache.del(buildCacheKey(CACHE_NAMESPACE, id));
  }
}
