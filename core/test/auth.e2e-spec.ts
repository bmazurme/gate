import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './utils/create-test-app';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let server: Parameters<typeof request>[0];

  const email = `auth-e2e-${Date.now()}@example.com`;
  const password = 'password123';

  beforeAll(async () => {
    app = await createTestApp();
    server = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  it('registers a new user and sets a refresh cookie, without leaking the password', async () => {
    const response = await request(server)
      .post('/auth/register')
      .send({ email, password, name: 'E2E User' })
      .expect(201);

    expect(response.body.accessToken).toBeDefined();
    expect(response.body.user.email).toBe(email);
    expect(response.body.user.password).toBeUndefined();
    expect(response.body.user.refreshTokenHash).toBeUndefined();
    expect(response.headers['set-cookie']?.[0]).toMatch(/^refresh_token=/);
  });

  it('rejects duplicate registration with 409', async () => {
    await request(server)
      .post('/auth/register')
      .send({ email, password })
      .expect(409);
  });

  it('logs in with correct credentials', async () => {
    const response = await request(server)
      .post('/auth/login')
      .send({ email, password })
      .expect(201);

    expect(response.body.accessToken).toBeDefined();
  });

  it('rejects login with the wrong password', async () => {
    await request(server)
      .post('/auth/login')
      .send({ email, password: 'wrong-password' })
      .expect(401);
  });

  it('returns the current user via /auth/me with a valid access token', async () => {
    const loginResponse = await request(server)
      .post('/auth/login')
      .send({ email, password });
    const { accessToken } = loginResponse.body;

    const meResponse = await request(server)
      .get('/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(meResponse.body.email).toBe(email);
  });

  it('rejects /auth/me without a token', async () => {
    await request(server).get('/auth/me').expect(401);
  });

  it('refreshes the access token using the refresh cookie and rotates it', async () => {
    const loginResponse = await request(server)
      .post('/auth/login')
      .send({ email, password });
    const cookie = loginResponse.headers['set-cookie'][0];

    const refreshResponse = await request(server)
      .post('/auth/refresh')
      .set('Cookie', cookie)
      .expect(200);

    expect(refreshResponse.body.accessToken).toBeDefined();
  });

  it('rejects refresh without a cookie', async () => {
    await request(server).post('/auth/refresh').expect(401);
  });

  it('logs out and invalidates the refresh cookie', async () => {
    const loginResponse = await request(server)
      .post('/auth/login')
      .send({ email, password });
    const cookie = loginResponse.headers['set-cookie'][0];

    await request(server)
      .post('/auth/logout')
      .set('Cookie', cookie)
      .expect(204);
    await request(server)
      .post('/auth/refresh')
      .set('Cookie', cookie)
      .expect(401);
  });
});
