import type { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import request from 'supertest';
import { createTestApp } from './utils/create-test-app';
import { User } from '../src/users/entities/user.entity';
import { Role } from '../src/roles/enums/role.enum';

type Plan = 'basic' | 'extended' | 'max';

describe('Access demo (e2e)', () => {
  let app: INestApplication;
  let server: Parameters<typeof request>[0];
  let usersRepository: Repository<User>;

  beforeAll(async () => {
    app = await createTestApp();
    server = app.getHttpServer();
    usersRepository = app.get(getRepositoryToken(User));
  });

  afterAll(async () => {
    await app.close();
  });

  async function userWithPlan(plan: Plan | null) {
    const email = `access-demo-${plan ?? 'none'}-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}@example.com`;
    const registerResponse = await request(server)
      .post('/auth/register')
      .send({ email, password: 'password123' });
    const accessToken = registerResponse.body.accessToken as string;

    if (plan) {
      await request(server)
        .post('/subscriptions')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ plan })
        .expect(201);
    }

    return accessToken;
  }

  // basic < extended < max — у каждого уровня должен открываться доступ
  // ровно к своему и к более низким эндпоинтам, и не выше.
  const expectedAccess: Record<string, Record<Plan, boolean>> = {
    basic: { basic: true, extended: false, max: false },
    extended: { basic: true, extended: true, max: false },
    max: { basic: true, extended: true, max: true },
  };

  it.each(Object.entries(expectedAccess))(
    'a "%s" subscriber gets the expected access matrix',
    async (plan, expected) => {
      const accessToken = await userWithPlan(plan as Plan);

      for (const tier of ['basic', 'extended', 'max'] as Plan[]) {
        const response = await request(server)
          .get(`/access-demo/${tier}`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.status).toBe(expected[tier] ? 200 : 403);
      }
    },
  );

  it('denies all tiers for a user without any subscription', async () => {
    const accessToken = await userWithPlan(null);

    for (const tier of ['basic', 'extended', 'max'] as Plan[]) {
      await request(server)
        .get(`/access-demo/${tier}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(403);
    }
  });

  it('rejects unauthenticated requests', async () => {
    await request(server).get('/access-demo/basic').expect(401);
  });

  describe('role-based access', () => {
    async function registerUser(label: string) {
      const email = `access-demo-role-${label}-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}@example.com`;
      const response = await request(server)
        .post('/auth/register')
        .send({ email, password: 'password123' });
      return {
        id: response.body.user.id as string,
        accessToken: response.body.accessToken as string,
      };
    }

    it('grants /access-demo/role/user to every authenticated user', async () => {
      const user = await registerUser('user');

      await request(server)
        .get('/access-demo/role/user')
        .set('Authorization', `Bearer ${user.accessToken}`)
        .expect(200);
    });

    it('denies /access-demo/role/admin to a regular user', async () => {
      const user = await registerUser('non-admin');

      await request(server)
        .get('/access-demo/role/admin')
        .set('Authorization', `Bearer ${user.accessToken}`)
        .expect(403);
    });

    it('grants /access-demo/role/admin to an admin', async () => {
      const admin = await registerUser('admin');
      await usersRepository.update({ id: admin.id }, { roles: [Role.ADMIN] });

      const response = await request(server)
        .get('/access-demo/role/admin')
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .expect(200);

      expect(response.body.role).toBe('admin');
    });

    it('rejects unauthenticated requests', async () => {
      await request(server).get('/access-demo/role/user').expect(401);
    });
  });
});
