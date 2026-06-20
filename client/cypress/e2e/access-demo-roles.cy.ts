describe('Access demo by role (UI)', () => {
  it('grants the "User" block to every authenticated account', () => {
    cy.registerViaApi().then(() => {
      cy.visit('/access-demo');

      cy.contains('.g-text_variant_subheader-2', 'User')
        .closest('.g-card')
        .within(() => {
          cy.contains('button', 'Test access').click();
        });
      cy.contains('Access granted').scrollIntoView();
      cy.contains('Access granted').should('be.visible');
    });
  });

  it('denies the "Admin" block to a regular account', () => {
    cy.registerViaApi().then(() => {
      cy.visit('/access-demo');

      cy.contains('.g-text_variant_subheader-2', 'Admin')
        .closest('.g-card')
        .within(() => {
          cy.contains('button', 'Test access').click();
        });
      cy.contains('Access denied').scrollIntoView();
      cy.contains('Access denied').should('be.visible');
    });
  });

  it('grants the "Admin" block to an admin account', () => {
    cy.registerViaApi().then((admin) => {
      cy.promoteToAdmin(admin.email);
      cy.visit('/access-demo');

      cy.contains('.g-text_variant_subheader-2', 'Admin')
        .closest('.g-card')
        .within(() => {
          cy.contains('button', 'Test access').click();
        });
      cy.contains('Access granted').scrollIntoView();
      cy.contains('Access granted').should('be.visible');
    });
  });
});
