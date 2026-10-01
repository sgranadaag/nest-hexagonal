import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { HttpExceptionFilter } from '../../src/middlewares/httpException.filter';

const NON_EXISTENT_ID = '00000000-0000-0000-0000-000000000000';

interface GraphQLResponse<T> {
  data: T | null;
  errors?: { message: string }[];
}

describe('Book GraphQL (e2e)', () => {
  let app: INestApplication;
  let libraryId: string;
  let authorId: string;

  const graphql = (query: string) =>
    request(app.getHttpServer()).post('/graphql').send({ query });

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();

    const libraryResponse = await graphql(`
      mutation {
        createLibrary(
          input: { name: "GQL Uptown Library", address: "456 Oak Ave" }
        ) {
          id
        }
      }
    `);
    libraryId = (
      libraryResponse.body as GraphQLResponse<{
        createLibrary: { id: string };
      }>
    ).data!.createLibrary.id;

    const authorResponse = await graphql(`
      mutation {
        createAuthor(input: { name: "GQL John Smith", booksAccount: 1 }) {
          id
        }
      }
    `);
    authorId = (
      authorResponse.body as GraphQLResponse<{ createAuthor: { id: string } }>
    ).data!.createAuthor.id;
  });

  afterAll(async () => {
    await graphql(`mutation { deleteAuthor(id: "${authorId}") }`);
    await graphql(`mutation { deleteLibrary(id: "${libraryId}") }`);
    await app.close();
  });

  it('creates, queries and deletes a book', async () => {
    const createResponse = await graphql(
      `mutation {
        createBook(input: {
          title: "Clean Architecture"
          description: "A craftsman's guide to software structure"
          authorId: "${authorId}"
          libraryId: "${libraryId}"
        }) { id title description authorId libraryId }
      }`,
    ).expect(200);
    const createBody = createResponse.body as GraphQLResponse<{
      createBook: {
        id: string;
        title: string;
        authorId: string;
        libraryId: string;
      };
    }>;
    expect(createBody.errors).toBeUndefined();
    const book = createBody.data!.createBook;
    expect(book).toMatchObject({
      title: 'Clean Architecture',
      authorId,
      libraryId,
    });

    const getResponse = await graphql(
      `query { book(id: "${book.id}") { id } }`,
    ).expect(200);
    expect(
      (getResponse.body as GraphQLResponse<{ book: { id: string } }>).data!.book
        .id,
    ).toBe(book.id);

    const byAuthorResponse = await graphql(
      `query { booksByAuthor(authorId: "${authorId}") { id } }`,
    ).expect(200);
    expect(
      (
        byAuthorResponse.body as GraphQLResponse<{
          booksByAuthor: { id: string }[];
        }>
      ).data!.booksByAuthor,
    ).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: book.id })]),
    );

    const byLibraryResponse = await graphql(
      `query { booksByLibrary(libraryId: "${libraryId}") { id } }`,
    ).expect(200);
    expect(
      (
        byLibraryResponse.body as GraphQLResponse<{
          booksByLibrary: { id: string }[];
        }>
      ).data!.booksByLibrary,
    ).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: book.id })]),
    );

    const deleteResponse = await graphql(
      `mutation { deleteBook(id: "${book.id}") }`,
    ).expect(200);
    expect(
      (deleteResponse.body as GraphQLResponse<{ deleteBook: boolean }>).data!
        .deleteBook,
    ).toBe(true);

    const afterDeleteResponse = await graphql(
      `query { book(id: "${book.id}") { id } }`,
    ).expect(200);
    expect(
      (afterDeleteResponse.body as GraphQLResponse<null>).errors?.[0]?.message,
    ).toContain('not found');
  });

  it('rejects a book referencing a non-existent author', async () => {
    const response = await graphql(
      `mutation {
        createBook(input: {
          title: "Clean Architecture"
          description: "A craftsman's guide to software structure"
          authorId: "${NON_EXISTENT_ID}"
          libraryId: "${libraryId}"
        }) { id }
      }`,
    ).expect(200);
    expect(
      (response.body as GraphQLResponse<null>).errors?.[0]?.message,
    ).toContain('not found');
  });

  it('rejects a book referencing a non-existent library', async () => {
    const response = await graphql(
      `mutation {
        createBook(input: {
          title: "Clean Architecture"
          description: "A craftsman's guide to software structure"
          authorId: "${authorId}"
          libraryId: "${NON_EXISTENT_ID}"
        }) { id }
      }`,
    ).expect(200);
    expect(
      (response.body as GraphQLResponse<null>).errors?.[0]?.message,
    ).toContain('not found');
  });
});
