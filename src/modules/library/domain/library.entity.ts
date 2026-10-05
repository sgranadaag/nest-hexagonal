import { LibraryId } from '@modules/library/domain/valueObjects/libraryId.valueObject';
import { Address } from '@modules/library/domain/valueObjects/address.valueObject';

export class Library {
  private constructor(
    private readonly id: LibraryId,
    private readonly name: string,
    private readonly address: Address,
  ) {}

  static create(name: string, address: string): Library {
    return new Library(LibraryId.create(), name, Address.create(address));
  }

  static reconstitute(id: string, name: string, address: string): Library {
    return new Library(LibraryId.from(id), name, Address.create(address));
  }

  getId(): LibraryId {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getAddress(): Address {
    return this.address;
  }
}
