import { generateId } from '@utils/generateId.util';

export class LibraryId {
  private constructor(private readonly value: string) {}

  static create(): LibraryId {
    return new LibraryId(generateId());
  }

  static from(value: string): LibraryId {
    return new LibraryId(value);
  }

  get(): string {
    return this.value;
  }
}
