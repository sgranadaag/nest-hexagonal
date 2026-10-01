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

describe('Library GraphQL (e2e)', () => {
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

  it('creates, queries and deletes a library', async () => {
    const createResponse = await graphql(`
      mutation {
        createLibrary(input: { name: "GraphQL Library", address: "1 GQL St" }) {
          id
          name
          address
        }
      }
    `).expect(200);
    const createBody = createResponse.body as GraphQLResponse<{
      createLibrary: { id: string; name: string; address: string };
    }>;
    expect(createBody.errors).toBeUndefined();
    const library = createBody.data!.createLibrary;
    expect(library).toMatchObject({
      name: 'GraphQL Library',
      address: '1 GQL St',
    });

    const getResponse = await graphql(
      `query { library(id: "${library.id}") { id name address } }`,
    ).expect(200);
    const getBody = getResponse.body as GraphQLResponse<{
      library: { id: string; name: string; address: string };
    }>;
    expect(getBody.data!.library).toEqual(library);

    const deleteResponse = await graphql(
      `mutation { deleteLibrary(id: "${library.id}") }`,
    ).expect(200);
    const deleteBody = deleteResponse.body as GraphQLResponse<{
      deleteLibrary: boolean;
    }>;
    expect(deleteBody.data!.deleteLibrary).toBe(true);

    const afterDeleteResponse = await graphql(
      `query { library(id: "${library.id}") { id } }`,
    ).expect(200);
    const afterDeleteBody = afterDeleteResponse.body as GraphQLResponse<null>;
    expect(afterDeleteBody.errors?.[0]?.message).toContain('not found');
  });

  it('rejects an invalid create input', async () => {
    const response = await graphql(`
      mutation {
        createLibrary(input: { name: "", address: "x" }) {
          id
        }
      }
    `).expect(200);
    const body = response.body as GraphQLResponse<null>;
    expect(body.errors).toBeDefined();
  });

  it('returns a not found error for a library that does not exist', async () => {
    const response = await graphql(
      `query { library(id: "${NON_EXISTENT_ID}") { id } }`,
    ).expect(200);
    const body = response.body as GraphQLResponse<null>;
    expect(body.errors?.[0]?.message).toContain('not found');
  });
});
