describe('Plans admin (UI)', () => {
  afterEach(() => {
    // Каталог тарифов — общие данные для всех тестов в раннере, поэтому
    // после каждого теста восстанавливаем дефолтную цену basic-плана.
    cy.registerViaApi().then(({ accessToken }) => {
      cy.request({
        method: 'PATCH',
        url: `${Cypress.env('apiUrl')}/subscriptions/plans/basic`,
        headers: { Authorization: `Bearer ${accessToken}` },
        body: { price: 9.99 },
      });
    });
  });

  it('lists all plans and edits the price of one', () => {
    cy.registerViaApi().then(() => {
      cy.visit('/admin/plans');
      cy.get('.g-table tbody tr').should('have.length', 3);
      cy.contains('.g-table tbody tr', 'Basic').should('contain', '9.99 USD');

      cy.contains('.g-table tbody tr', 'Basic').within(() => {
        cy.contains('a', 'Edit').click();
      });

      cy.location('pathname').should('eq', '/admin/plans/basic/edit');
      cy.get('input[type="number"]').clear();
      cy.get('input[type="number"]').type('14.99');
      cy.contains('button', 'Save changes').click();

      cy.location('pathname').should('eq', '/admin/plans');
      cy.contains('.g-table tbody tr', 'Basic').should('contain', '14.99 USD');
    });
  });

  it('rejects an invalid price on the plan edit page', () => {
    cy.registerViaApi().then(() => {
      cy.visit('/admin/plans/basic/edit');

      cy.get('input[type="number"]').clear();
      cy.get('input[type="number"]').type('0');
      cy.contains('button', 'Save changes').click();

      cy.contains('Enter a price greater than 0').should('be.visible');
      cy.location('pathname').should('eq', '/admin/plans/basic/edit');
    });
  });

  it('redirects to the admin plans list for an unknown plan', () => {
    cy.registerViaApi().then(() => {
      cy.visit('/admin/plans/unknown/edit');
      cy.location('pathname').should('eq', '/admin/plans');
    });
  });
});
