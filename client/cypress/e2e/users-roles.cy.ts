describe('User roles & blocking (UI)', () => {
  it('lets an admin grant and revoke the admin role for another user', () => {
    cy.registerViaApi().then((target) => {
      cy.registerViaApi().then((admin) => {
        cy.promoteToAdmin(admin.email);
        cy.visit('/users');

        cy.contains('.g-table tbody tr', target.email).within(() => {
          cy.contains('a', 'Edit').click();
        });

        cy.location('pathname').should('match', /\/users\/[^/]+\/edit$/);
        cy.intercept('PATCH', '**/users/*/roles').as('updateRoles');
        cy.contains('label', 'Admin role').click();
        cy.wait('@updateRoles');

        cy.visit('/users');
        cy.contains('.g-table tbody tr', target.email).should('contain', 'Admin');
      });
    });
  });

  it('lets an admin block another user, immediately revoking their access', () => {
    cy.registerViaApi().then((target) => {
      cy.registerViaApi().then((admin) => {
        cy.promoteToAdmin(admin.email);
        cy.visit('/users');

        cy.contains('.g-table tbody tr', target.email).within(() => {
          cy.contains('a', 'Edit').click();
        });

        cy.intercept('PATCH', '**/users/*/blocked').as('updateBlocked');
        cy.contains('label', 'Blocked').click();
        cy.wait('@updateBlocked');

        cy.visit('/users');
        cy.contains('.g-table tbody tr', target.email).should('contain', 'Blocked');

        cy.request({
          method: 'POST',
          url: `${Cypress.env('apiUrl')}/auth/login`,
          body: { email: target.email, password: target.password },
          failOnStatusCode: false,
        }).then((response) => {
          expect(response.status).to.eq(401);
        });
      });
    });
  });

  it('does not show role-management actions to a non-admin', () => {
    cy.registerViaApi().then(() => {
      cy.visit('/users');
      cy.get('.g-table').should('be.visible');
      cy.contains('a', 'Edit').should('not.exist');
    });
  });

  it('redirects a non-admin away from the user edit page', () => {
    cy.registerViaApi().then(() => {
      cy.visit('/users/some-id/edit');
      cy.location('pathname').should('eq', '/users');
    });
  });
});
