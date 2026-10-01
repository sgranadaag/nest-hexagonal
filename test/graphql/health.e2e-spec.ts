import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Health GraphQL (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('query { health } returns the app status', async () => {
    const response = await request(app.getHttpServer())
      .post('/graphql')
      .send({ query: '{ health { status uptime timestamp } }' })
      .expect(200);

    const body = response.body as {
      data: { health: { status: string; uptime: number; timestamp: string } };
    };
    expect(body.data.health).toMatchObject({ status: 'ok' });
    expect(typeof body.data.health.uptime).toBe('number');
    expect(typeof body.data.health.timestamp).toBe('string');
  });
});
