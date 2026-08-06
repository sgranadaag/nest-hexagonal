import { generateId } from '@utils/generateId.util';

export class AuthorId {
  private constructor(private readonly value: string) {}

  static create(): AuthorId {
    return new AuthorId(generateId());
  }

  static from(value: string): AuthorId {
    return new AuthorId(value);
  }

  get(): string {
    return this.value;
  }
}
