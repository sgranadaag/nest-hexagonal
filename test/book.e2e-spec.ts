import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/middlewares/httpException.filter';

const NON_EXISTENT_ID = '00000000-0000-0000-0000-000000000000';

describe('Book (e2e)', () => {
  let app: INestApplication;
  let libraryId: string;
  let authorId: string;

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

    const library = await request(app.getHttpServer())
      .post('/libraries')
      .send({ name: 'Uptown Library', address: '456 Oak Ave' });
    libraryId = (library.body as { id: string }).id;

    const author = await request(app.getHttpServer())
      .post('/authors')
      .send({ name: 'John Smith', booksAccount: 1 });
    authorId = (author.body as { id: string }).id;
  });

  afterAll(async () => {
    await request(app.getHttpServer()).delete(`/authors/${authorId}`);
    await request(app.getHttpServer()).delete(`/libraries/${libraryId}`);
    await app.close();
  });

  it('creates, fetches and deletes a book', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/books')
      .send({
        title: 'Clean Architecture',
        description: "A craftsman's guide to software structure",
        authorId,
        libraryId,
      })
      .expect(201);

    expect(createResponse.body).toMatchObject({
      title: 'Clean Architecture',
      authorId,
      libraryId,
    });
    const { id } = createResponse.body as { id: string };

    await request(app.getHttpServer()).get(`/books/${id}`).expect(200);

    const byAuthor = await request(app.getHttpServer())
      .get(`/books/author/${authorId}`)
      .expect(200);
    expect(byAuthor.body).toEqual(
      expect.arrayContaining([expect.objectContaining({ id })]),
    );

    const byLibrary = await request(app.getHttpServer())
      .get(`/books/library/${libraryId}`)
      .expect(200);
    expect(byLibrary.body).toEqual(
      expect.arrayContaining([expect.objectContaining({ id })]),
    );

    await request(app.getHttpServer()).delete(`/books/${id}`).expect(204);

    await request(app.getHttpServer()).get(`/books/${id}`).expect(404);
  });

  it('rejects a book referencing a non-existent author', () => {
    return request(app.getHttpServer())
      .post('/books')
      .send({
        title: 'Clean Architecture',
        description: "A craftsman's guide to software structure",
        authorId: NON_EXISTENT_ID,
        libraryId,
      })
      .expect(404);
  });

  it('rejects a book referencing a non-existent library', () => {
    return request(app.getHttpServer())
      .post('/books')
      .send({
        title: 'Clean Architecture',
        description: "A craftsman's guide to software structure",
        authorId,
        libraryId: NON_EXISTENT_ID,
      })
      .expect(404);
  });
});
