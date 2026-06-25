import type { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import request from 'supertest';
import { createTestApp } from './utils/create-test-app';
import { User } from '../src/users/entities/user.entity';
import { Role } from '../src/roles/enums/role.enum';

describe('Users roles & blocking (e2e)', () => {
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

  async function registerUser(label: string) {
    const email = `roles-${label}-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}@example.com`;
    const response = await request(server)
      .post('/auth/register')
      .send({ email, password: 'password123' });
    return {
      id: response.body.user.id as string,
      email,
      accessToken: response.body.accessToken as string,
    };
  }

  // Гарантированно делаем пользователя админом напрямую через репозиторий,
  // не завязываясь на гонку "первый зарегистрированный = админ" между файлами.
  async function promoteToAdmin(id: string) {
    await usersRepository.update({ id }, { roles: [Role.ADMIN] });
  }

  describe('PATCH /users/:id/roles', () => {
    it('allows an admin to grant another user the admin role', async () => {
      const admin = await registerUser('admin-grant');
      await promoteToAdmin(admin.id);
      const target = await registerUser('target-grant');

      const response = await request(server)
        .patch(`/users/${target.id}/roles`)
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .send({ roles: ['admin'] })
        .expect(200);

      expect(response.body.roles).toEqual(['admin']);
    });

    it('rejects a non-admin with 403', async () => {
      const user = await registerUser('non-admin-roles');
      const target = await registerUser('target-roles-2');

      await request(server)
        .patch(`/users/${target.id}/roles`)
        .set('Authorization', `Bearer ${user.accessToken}`)
        .send({ roles: ['admin'] })
        .expect(403);
    });

    it('rejects changing your own roles with 403', async () => {
      const admin = await registerUser('admin-self-roles');
      await promoteToAdmin(admin.id);

      await request(server)
        .patch(`/users/${admin.id}/roles`)
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .send({ roles: ['user'] })
        .expect(403);
    });

    it('rejects unauthenticated requests with 401', async () => {
      const target = await registerUser('target-roles-3');

      await request(server)
        .patch(`/users/${target.id}/roles`)
        .send({ roles: ['admin'] })
        .expect(401);
    });
  });

  describe('PATCH /users/:id/blocked', () => {
    it('allows an admin to block another user, immediately revoking access', async () => {
      const admin = await registerUser('admin-block');
      await promoteToAdmin(admin.id);
      const target = await registerUser('target-block');

      await request(server)
        .patch(`/users/${target.id}/blocked`)
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .send({ isBlocked: true })
        .expect(200);

      // Уже выданный access-токен немедленно перестаёт работать.
      await request(server)
        .get('/auth/me')
        .set('Authorization', `Bearer ${target.accessToken}`)
        .expect(401);

      // И залогиниться той же учёткой больше нельзя.
      await request(server)
        .post('/auth/login')
        .send({ email: target.email, password: 'password123' })
        .expect(401);
    });

    it('rejects a non-admin with 403', async () => {
      const user = await registerUser('non-admin-block');
      const target = await registerUser('target-block-2');

      await request(server)
        .patch(`/users/${target.id}/blocked`)
        .set('Authorization', `Bearer ${user.accessToken}`)
        .send({ isBlocked: true })
        .expect(403);
    });

    it('rejects blocking yourself with 403', async () => {
      const admin = await registerUser('admin-self-block');
      await promoteToAdmin(admin.id);

      await request(server)
        .patch(`/users/${admin.id}/blocked`)
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .send({ isBlocked: true })
        .expect(403);
    });
  });
});
