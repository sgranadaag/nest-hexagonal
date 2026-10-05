import { Author } from '@modules/author/domain/author.entity';

describe('Author', () => {
  it('creates an author with a generated id', () => {
    const author = Author.create('Jane Doe', 2);

    expect(typeof author.getId().get()).toBe('string');
    expect(author.getId().get().length).toBeGreaterThan(0);
    expect(author.getName()).toBe('Jane Doe');
    expect(author.getBooksAccount()).toBe(2);
  });

  it('reconstitutes an author with a known id', () => {
    const author = Author.reconstitute('author-1', 'Jane Doe', 2);

    expect(author.getId().get()).toBe('author-1');
  });
});
