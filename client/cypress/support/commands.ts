import type { SubscriptionPlan } from '../../src/store/api/subscriptionsApi/types';

export interface RegisteredUser {
  email: string;
  password: string;
  accessToken: string;
}

export interface RegisterViaApiOptions {
  email?: string;
  password?: string;
  plan?: SubscriptionPlan;
}

Cypress.Commands.add(
  'registerViaApi',
  (options: RegisterViaApiOptions = {}): Cypress.Chainable<RegisteredUser> => {
    const email =
      options.email ?? `cy-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
    const password = options.password ?? 'password123';

    return cy
      .request('POST', `${Cypress.env('apiUrl')}/auth/register`, { email, password })
      .then((response) => {
        const accessToken = response.body.accessToken as string;

        if (!options.plan) {
          return { email, password, accessToken };
        }

        return cy
          .request({
            method: 'POST',
            url: `${Cypress.env('apiUrl')}/subscriptions`,
            headers: { Authorization: `Bearer ${accessToken}` },
            body: { plan: options.plan },
          })
          .then(() => ({ email, password, accessToken }));
      });
  },
);

// Тестовая утилита: напрямую через psql выставляет пользователю роль admin,
// минуя API (которое само требует прав admin — иначе курицы и яйца).
Cypress.Commands.add('promoteToAdmin', (email: string) => {
  return cy.exec(
    `PGPASSWORD=postgres psql -h localhost -p 5434 -U postgres -d gate -c "UPDATE users SET roles='{admin}' WHERE email='${email}'"`,
  );
});

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      registerViaApi(options?: RegisterViaApiOptions): Chainable<RegisteredUser>;
      promoteToAdmin(email: string): Chainable<Cypress.Exec>;
    }
  }
}
