import { Book } from '@modules/book/domain/entities/book.entity';

describe('Book', () => {
  it('creates a book with a generated id, referencing its author and library by id', () => {
    const book = Book.create('DDD', 'Tackling complexity', 'author-1', 'lib-1');

    expect(typeof book.getId().get()).toBe('string');
    expect(book.getId().get().length).toBeGreaterThan(0);
    expect(book.getTitle()).toBe('DDD');
    expect(book.getDescription()).toBe('Tackling complexity');
    expect(book.getAuthorId().get()).toBe('author-1');
    expect(book.getLibraryId().get()).toBe('lib-1');
  });

  it('reconstitutes a book with a known id', () => {
    const book = Book.reconstitute(
      'book-1',
      'DDD',
      'Tackling complexity',
      'author-1',
      'lib-1',
    );

    expect(book.getId().get()).toBe('book-1');
  });
});
