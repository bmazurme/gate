import type { SubscriptionPlan } from '../../src/store/api/subscriptionsApi/types';

describe('Access demo (UI)', () => {
  const cases: Array<{ plan: SubscriptionPlan; expected: Record<string, boolean> }> = [
    { plan: 'basic', expected: { Basic: true, Extended: false, Max: false } },
    { plan: 'extended', expected: { Basic: true, Extended: true, Max: false } },
    { plan: 'max', expected: { Basic: true, Extended: true, Max: true } },
  ];

  cases.forEach(({ plan, expected }) => {
    it(`shows the correct access matrix for a "${plan}" subscriber`, () => {
      cy.registerViaApi({ plan }).then(() => {
        cy.visit('/access-demo');

        Object.entries(expected).forEach(([tier, allowed]) => {
          cy.contains(tier)
            .closest('.g-card')
            .within(() => {
              cy.contains('button', 'Test access').click();
              cy.contains(allowed ? 'Access granted' : 'Access denied').should('be.visible');
            });
        });
      });
    });
  });

  it('denies all tiers for a user without a subscription', () => {
    cy.registerViaApi().then(() => {
      cy.visit('/access-demo');

      ['Basic', 'Extended', 'Max'].forEach((tier) => {
        cy.contains(tier)
          .closest('.g-card')
          .within(() => {
            cy.contains('button', 'Test access').click();
            cy.contains('Access denied').should('be.visible');
          });
      });
    });
  });
});
