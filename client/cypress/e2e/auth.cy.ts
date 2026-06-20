describe('Auth flow (UI)', () => {
  it('registers a new account through the UI and lands on the dashboard', () => {
    const email = `cy-register-${Date.now()}@example.com`;
    const password = 'password123';

    cy.visit('/register');
    cy.get('input[type="email"]').type(email);
    cy.get('input[placeholder*="Name"]').type('Cypress User');
    cy.get('input[type="password"]').type(password);
    cy.contains('button', 'Sign up').click();

    cy.location('pathname').should('eq', '/');
    cy.contains('Dashboard').should('be.visible');
    cy.visit('/profile');
    cy.contains(email).should('be.visible');
  });

  it('logs out and is redirected to the login page', () => {
    cy.registerViaApi().then(({ email }) => {
      cy.visit('/profile');
      cy.contains(email).should('be.visible');
      cy.contains('button', 'Log out').click();

      cy.location('pathname').should('eq', '/login');
    });
  });

  it('logs in with valid credentials through the UI', () => {
    cy.registerViaApi().then(({ email, password }) => {
      cy.visit('/login');
      cy.get('input[type="email"]').type(email);
      cy.get('input[type="password"]').type(password);
      cy.contains('button', 'Sign in').click();

      cy.location('pathname').should('eq', '/');
      cy.visit('/profile');
      cy.contains(email).should('be.visible');
    });
  });

  it('shows an error for wrong credentials', () => {
    cy.registerViaApi().then(({ email }) => {
      cy.visit('/login');
      cy.get('input[type="email"]').type(email);
      cy.get('input[type="password"]').type('wrong-password');
      cy.contains('button', 'Sign in').click();

      cy.contains(/invalid email or password/i).should('be.visible');
      cy.location('pathname').should('eq', '/login');
    });
  });

  it('redirects an unauthenticated visitor away from protected pages', () => {
    cy.visit('/plans');

    cy.location('pathname').should('eq', '/login');
  });
});
