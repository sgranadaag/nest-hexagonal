import { generateId } from '@utils/generateId.util';

export class BookId {
  private constructor(private readonly value: string) {}

  static create(): BookId {
    return new BookId(generateId());
  }

  static from(value: string): BookId {
    return new BookId(value);
  }

  get(): string {
    return this.value;
  }
}
