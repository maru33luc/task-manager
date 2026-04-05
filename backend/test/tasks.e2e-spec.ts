import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Tasks (e2e)', () => {
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();

    // register + login (unique email per run)
    const unique = Date.now();
    const email = `e2e+task${unique}@example.com`;

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password: 'Pass1234!', name: 'E2E' })
      .expect(201);

    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password: 'Pass1234!' })
      .expect(200);

    token = login.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('/tasks (POST) creates a task', async () => {
    const res = await request(app.getHttpServer())
      .post('/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'E2E Task' })
      .expect(201);

    expect(res.body.id).toBeDefined();
    expect(res.body.title).toBe('E2E Task');
  }, 20000);
});
