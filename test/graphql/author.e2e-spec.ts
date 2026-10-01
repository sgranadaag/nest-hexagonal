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

describe('Author GraphQL (e2e)', () => {
  let app: INestApplication;

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
  });

  afterAll(async () => {
    await app.close();
  });

  it('creates, queries and deletes an author', async () => {
    const createResponse = await graphql(`
      mutation {
        createAuthor(input: { name: "GraphQL Author", booksAccount: 2 }) {
          id
          name
          booksAccount
        }
      }
    `).expect(200);
    const createBody = createResponse.body as GraphQLResponse<{
      createAuthor: { id: string; name: string; booksAccount: number };
    }>;
    expect(createBody.errors).toBeUndefined();
    const author = createBody.data!.createAuthor;
    expect(author).toMatchObject({
      name: 'GraphQL Author',
      booksAccount: 2,
    });

    const getResponse = await graphql(
      `query { author(id: "${author.id}") { id name booksAccount } }`,
    ).expect(200);
    const getBody = getResponse.body as GraphQLResponse<{
      author: { id: string; name: string; booksAccount: number };
    }>;
    expect(getBody.data!.author).toEqual(author);

    const deleteResponse = await graphql(
      `mutation { deleteAuthor(id: "${author.id}") }`,
    ).expect(200);
    const deleteBody = deleteResponse.body as GraphQLResponse<{
      deleteAuthor: boolean;
    }>;
    expect(deleteBody.data!.deleteAuthor).toBe(true);

    const afterDeleteResponse = await graphql(
      `query { author(id: "${author.id}") { id } }`,
    ).expect(200);
    const afterDeleteBody = afterDeleteResponse.body as GraphQLResponse<null>;
    expect(afterDeleteBody.errors?.[0]?.message).toContain('not found');
  });

  it('rejects an invalid create input', async () => {
    const response = await graphql(`
      mutation {
        createAuthor(input: { name: "", booksAccount: -1 }) {
          id
        }
      }
    `).expect(200);
    const body = response.body as GraphQLResponse<null>;
    expect(body.errors).toBeDefined();
  });

  it('returns a not found error for an author that does not exist', async () => {
    const response = await graphql(
      `query { author(id: "${NON_EXISTENT_ID}") { id } }`,
    ).expect(200);
    const body = response.body as GraphQLResponse<null>;
    expect(body.errors?.[0]?.message).toContain('not found');
  });
});
