describe('Users page (UI)', () => {
  it('paginates through the users list', () => {
    cy.registerViaApi().then(() => {
      cy.visit('/users');

      cy.get('.g-table').should('be.visible');
      cy.get('.g-table tbody tr').should('have.length.greaterThan', 1);

      cy.get('.g-table tbody tr')
        .first()
        .find('td')
        .first()
        .invoke('text')
        .then((firstPageEmail) => {
          cy.get('[data-qa="pagination-page-2"]').click();

          cy.get('.g-table tbody tr')
            .first()
            .find('td')
            .first()
            .invoke('text')
            .should('not.equal', firstPageEmail);
        });
    });
  });

  it('filters by search and resets back to the first page', () => {
    const uniqueEmail = `cy-users-search-${Date.now()}@example.com`;

    cy.registerViaApi({ email: uniqueEmail }).then(() => {
      cy.visit('/users');
      cy.get('[data-qa="pagination-page-2"]').click();

      cy.get('input[placeholder="Search..."]').type(uniqueEmail);

      cy.get('.g-table tbody tr').should('have.length', 1);
      cy.contains(uniqueEmail).should('be.visible');
    });
  });

  it('keeps the page number in the URL and survives a reload', () => {
    cy.registerViaApi().then(() => {
      cy.visit('/users');
      cy.get('[data-qa="pagination-page-2"]').click();

      cy.location('search').should('include', 'page=2');

      cy.get('.g-table tbody tr')
        .first()
        .find('td')
        .first()
        .invoke('text')
        .then((page2Email) => {
          cy.reload();

          cy.location('search', { timeout: 10000 }).should('include', 'page=2');
          cy.get('.g-table tbody tr')
            .first()
            .find('td')
            .first()
            .invoke('text')
            .should('equal', page2Email);
        });
    });
  });
});
