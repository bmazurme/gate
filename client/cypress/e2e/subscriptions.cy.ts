describe('Subscriptions flow (UI)', () => {
  it('subscribes to a plan from the Plans page and reflects it on the dashboard', () => {
    cy.registerViaApi().then(() => {
      cy.visit('/plans');

      cy.contains('.g-text_variant_subheader-2', 'Basic')
        .closest('.g-card')
        .within(() => {
          cy.contains('button', 'Subscribe').click();
        });

      cy.contains('.g-text_variant_subheader-2', 'Basic')
        .closest('.g-card')
        .within(() => {
          cy.contains('button', 'Current plan').should('be.disabled');
        });

      cy.contains('.g-text_variant_subheader-2', 'Extended')
        .closest('.g-card')
        .within(() => {
          cy.contains('button', 'Cancel current plan to switch').should('be.disabled');
        });

      cy.visit('/profile');
      cy.contains('Subscription active').should('be.visible');

      cy.visit('/');
      cy.contains('Active subscription: Basic').should('be.visible');
    });
  });

  it('does not allow subscribing to a second plan while one is active', () => {
    cy.registerViaApi({ plan: 'extended' }).then(() => {
      cy.visit('/plans');

      cy.contains('.g-text_variant_subheader-2', 'Extended')
        .closest('.g-card')
        .within(() => {
          cy.contains('button', 'Current plan').should('be.disabled');
        });

      cy.contains('.g-text_variant_subheader-2', 'Basic')
        .closest('.g-card')
        .within(() => {
          cy.contains('button', 'Cancel current plan to switch').should('be.disabled');
        });
    });
  });

  it('cancels the active subscription from the profile page banner', () => {
    cy.registerViaApi({ plan: 'basic' }).then(() => {
      cy.visit('/profile');

      cy.contains('Subscription active').should('be.visible');
      cy.contains('Plan: Basic').should('be.visible');
      cy.contains('button', 'Cancel subscription').click();

      cy.contains("You don't have an active subscription yet.").should('be.visible');

      cy.visit('/plans');
      cy.contains('.g-text_variant_subheader-2', 'Basic')
        .closest('.g-card')
        .within(() => {
          cy.contains('button', 'Subscribe').should('be.enabled');
        });
    });
  });

  it('lists the subscription and cancels it from the detail page', () => {
    cy.registerViaApi({ plan: 'basic' }).then(() => {
      cy.visit('/subscriptions');
      cy.contains('a', 'Details').click();

      cy.contains('active').should('be.visible');
      cy.contains('button', 'Cancel subscription').click();

      cy.contains('canceled').should('be.visible');
      cy.contains('button', 'Cancel subscription').should('not.exist');
    });
  });

  it('edits the subscription price from the edit page', () => {
    cy.registerViaApi({ plan: 'basic' }).then(() => {
      cy.visit('/subscriptions');
      cy.contains('a', 'Details').click();

      cy.contains('9.99 USD').should('be.visible');
      cy.contains('a', 'Edit').click();

      cy.location('pathname').should('match', /\/subscriptions\/[^/]+\/edit$/);
      cy.get('input[type="number"]').clear();
      cy.get('input[type="number"]').type('59.99');
      cy.contains('button', 'Save changes').click();

      cy.location('pathname').should('match', /\/subscriptions\/[^/]+$/);
      cy.contains('59.99 USD').should('be.visible');
    });
  });

  it('rejects an invalid price on the edit page', () => {
    cy.registerViaApi({ plan: 'basic' }).then(() => {
      cy.visit('/subscriptions');
      cy.contains('a', 'Details').click();
      cy.contains('a', 'Edit').click();

      cy.get('input[type="number"]').clear();
      cy.get('input[type="number"]').type('-5');
      cy.contains('button', 'Save changes').click();

      cy.contains('Enter a price greater than 0').should('be.visible');
      cy.location('pathname').should('match', /\/subscriptions\/[^/]+\/edit$/);
    });
  });

  it('keeps the page number in the URL and survives a reload', () => {
    const plans = ['basic', 'extended', 'max'];

    cy.registerViaApi().then(({ accessToken }) => {
      // Создаём 11 подписок (cancel сразу после subscribe), чтобы получить
      // вторую страницу при pageSize=10.
      cy.wrap(Array.from({ length: 11 }, (_, i) => i)).each((i: number) => {
        cy.request({
          method: 'POST',
          url: `${Cypress.env('apiUrl')}/subscriptions`,
          headers: { Authorization: `Bearer ${accessToken}` },
          body: { plan: plans[i % plans.length] },
        }).then((response) => {
          cy.request({
            method: 'POST',
            url: `${Cypress.env('apiUrl')}/subscriptions/${response.body.id}/cancel`,
            headers: { Authorization: `Bearer ${accessToken}` },
          });
        });
      });

      cy.visit('/subscriptions');
      cy.get('[data-qa="pagination-page-2"]').click();

      cy.location('search').should('include', 'page=2');

      cy.get('.g-table tbody tr')
        .first()
        .find('td')
        .first()
        .invoke('text')
        .then((page2Plan) => {
          cy.reload();

          cy.location('search', { timeout: 10000 }).should('include', 'page=2');
          cy.get('.g-table tbody tr')
            .first()
            .find('td')
            .first()
            .invoke('text')
            .should('equal', page2Plan);
        });
    });
  });
});
