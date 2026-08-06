import { Library } from '@modules/library/domain/entities/library.entity';

describe('Library', () => {
  it('creates a library with a generated id', () => {
    const library = Library.create('Central Library', '123 Main St');

    expect(typeof library.getId().get()).toBe('string');
    expect(library.getId().get().length).toBeGreaterThan(0);
    expect(library.getName()).toBe('Central Library');
    expect(library.getAddress().get()).toBe('123 Main St');
  });

  it('reconstitutes a library with a known id', () => {
    const library = Library.reconstitute(
      'lib-1',
      'Central Library',
      '123 Main St',
    );

    expect(library.getId().get()).toBe('lib-1');
  });
});
