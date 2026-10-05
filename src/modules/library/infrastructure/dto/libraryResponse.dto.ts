import { Library } from '@modules/library/domain/library.entity';

export class LibraryResponseDto {
  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly address: string,
  ) {}

  static fromDomain(library: Library): LibraryResponseDto {
    return new LibraryResponseDto(
      library.getId().get(),
      library.getName(),
      library.getAddress().get(),
    );
  }
}
