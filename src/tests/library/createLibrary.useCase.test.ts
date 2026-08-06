import { CreateLibraryUseCase } from '@modules/library/application/useCases/createLibrary.useCase';
import { ILibraryRepository } from '@modules/library/application/ports/libraryRepository.interface';
import { Library } from '@modules/library/domain/entities/library.entity';

describe('CreateLibraryUseCase', () => {
  it('creates and persists a library', async () => {
    const saveMock = jest.fn((library: Library) => Promise.resolve(library));
    const repository: ILibraryRepository = {
      save: saveMock,
      find: jest.fn(),
      delete: jest.fn(),
    };
    const useCase = new CreateLibraryUseCase(repository);

    const library = await useCase.execute('Central Library', '123 Main St');

    expect(saveMock).toHaveBeenCalledWith(library);
    expect(library.getName()).toBe('Central Library');
    expect(library.getAddress().get()).toBe('123 Main St');
  });
});
