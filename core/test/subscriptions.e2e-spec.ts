import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './utils/create-test-app';

describe('Subscriptions (e2e)', () => {
  let app: INestApplication;
  let server: Parameters<typeof request>[0];

  beforeAll(async () => {
    app = await createTestApp();
    server = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  async function registerAndLogin(emailPrefix: string) {
    const email = `${emailPrefix}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
    const response = await request(server)
      .post('/auth/register')
      .send({ email, password: 'password123' });
    return { email, accessToken: response.body.accessToken as string };
  }

  it('lists the plan catalog without authentication', async () => {
    const response = await request(server)
      .get('/subscriptions/plans')
      .expect(200);

    expect(response.body).toHaveLength(3);
    expect(response.body.map((p: { plan: string }) => p.plan)).toEqual([
      'basic',
      'extended',
      'max',
    ]);
  });

  it('subscribes, activates and exposes the active subscription via /me', async () => {
    const { accessToken } = await registerAndLogin('sub-flow');

    const subscribeResponse = await request(server)
      .post('/subscriptions')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ plan: 'basic' })
      .expect(201);

    expect(subscribeResponse.body.status).toBe('active');
    const subscriptionId = subscribeResponse.body.id as string;

    const activeResponse = await request(server)
      .get('/subscriptions/me/active')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(activeResponse.body.id).toBe(subscriptionId);

    const listResponse = await request(server)
      .get('/subscriptions/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(listResponse.body).toHaveLength(1);

    const paymentsResponse = await request(server)
      .get(`/payments/subscription/${subscriptionId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(paymentsResponse.body).toHaveLength(1);
    expect(paymentsResponse.body[0].status).toBe('succeeded');
  });

  it('rejects a second subscription while one is already active', async () => {
    const { accessToken } = await registerAndLogin('sub-conflict');

    await request(server)
      .post('/subscriptions')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ plan: 'basic' })
      .expect(201);

    await request(server)
      .post('/subscriptions')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ plan: 'extended' })
      .expect(409);
  });

  it('cancels an owned subscription and rejects a second cancel', async () => {
    const { accessToken } = await registerAndLogin('sub-cancel');

    const subscribeResponse = await request(server)
      .post('/subscriptions')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ plan: 'basic' })
      .expect(201);
    const subscriptionId = subscribeResponse.body.id as string;

    const cancelResponse = await request(server)
      .post(`/subscriptions/${subscriptionId}/cancel`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(201);
    expect(cancelResponse.body.status).toBe('canceled');

    await request(server)
      .post(`/subscriptions/${subscriptionId}/cancel`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(409);
  });

  it("forbids accessing another user's subscription", async () => {
    const owner = await registerAndLogin('sub-owner');
    const intruder = await registerAndLogin('sub-intruder');

    const subscribeResponse = await request(server)
      .post('/subscriptions')
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .send({ plan: 'basic' })
      .expect(201);
    const subscriptionId = subscribeResponse.body.id as string;

    await request(server)
      .get(`/subscriptions/${subscriptionId}`)
      .set('Authorization', `Bearer ${intruder.accessToken}`)
      .expect(403);

    await request(server)
      .post(`/subscriptions/${subscriptionId}/cancel`)
      .set('Authorization', `Bearer ${intruder.accessToken}`)
      .expect(403);

    const paymentsResponse = await request(server)
      .get(`/payments/subscription/${subscriptionId}`)
      .set('Authorization', `Bearer ${intruder.accessToken}`)
      .expect(200);
    expect(paymentsResponse.body).toEqual([]);
  });

  it('rejects subscribing without authentication', async () => {
    await request(server)
      .post('/subscriptions')
      .send({ plan: 'basic' })
      .expect(401);
  });
});
