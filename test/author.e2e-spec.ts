import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/middlewares/httpException.filter';

const NON_EXISTENT_ID = '00000000-0000-0000-0000-000000000000';

describe('Author (e2e)', () => {
  let app: INestApplication;

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

  it('creates, fetches and deletes an author', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/authors')
      .send({ name: 'Jane Doe', booksAccount: 2 })
      .expect(201);

    expect(createResponse.body).toMatchObject({
      name: 'Jane Doe',
      booksAccount: 2,
    });
    const { id } = createResponse.body as { id: string };
    expect(id).toEqual(expect.any(String));

    const getResponse = await request(app.getHttpServer())
      .get(`/authors/${id}`)
      .expect(200);
    expect(getResponse.body).toEqual(createResponse.body);

    await request(app.getHttpServer()).delete(`/authors/${id}`).expect(204);

    await request(app.getHttpServer()).get(`/authors/${id}`).expect(404);
  });

  it('rejects an invalid create payload', () => {
    return request(app.getHttpServer())
      .post('/authors')
      .send({ name: 'Jane Doe', booksAccount: -1 })
      .expect(400);
  });

  it('returns 404 for an author that does not exist', () => {
    return request(app.getHttpServer())
      .get(`/authors/${NON_EXISTENT_ID}`)
      .expect(404);
  });
});
