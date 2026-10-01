import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Health (e2e)', () => {
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

  it('GET /health returns the app status', async () => {
    const response = await request(app.getHttpServer())
      .get('/health')
      .expect(200);

    const body = response.body as {
      status: string;
      uptime: number;
      timestamp: string;
    };
    expect(body).toMatchObject({ status: 'ok' });
    expect(typeof body.uptime).toBe('number');
    expect(typeof body.timestamp).toBe('string');
  });
});
