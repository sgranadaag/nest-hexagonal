const MAX_ADDRESS_LENGTH = 256;

export class Address {
  private constructor(private readonly value: string) {}

  static create(value: string): Address {
    const address = new Address(value);
    if (!address.isValid()) {
      throw new Error('Invalid address');
    }
    return address;
  }

  isValid(): boolean {
    return (
      this.value.trim().length > 0 && this.value.length <= MAX_ADDRESS_LENGTH
    );
  }

  get(): string {
    return this.value;
  }
}
