import { Address } from '@modules/library/domain/valueObjects/address.valueObject';

describe('Address', () => {
  it('accepts a valid address', () => {
    const address = Address.create('123 Main St');

    expect(address.isValid()).toBe(true);
    expect(address.get()).toBe('123 Main St');
  });

  it('rejects an empty address', () => {
    expect(() => Address.create('')).toThrow();
  });

  it('rejects an address longer than 256 characters', () => {
    expect(() => Address.create('a'.repeat(257))).toThrow();
  });
});
