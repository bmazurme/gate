describe('Localization', () => {
  it('switches the UI language and persists the choice across reloads', () => {
    cy.registerViaApi().then(() => {
      cy.visit('/');
      cy.contains('Dashboard').should('be.visible');
      cy.contains('Subscription service').should('be.visible');

      cy.contains('button', 'Russian').click();

      cy.contains('Дашборд').should('be.visible');
      cy.contains('Сервис подписок').should('be.visible');
      cy.contains('a', 'Тарифы').should('be.visible');
      cy.contains('a', 'Подписки').should('be.visible');
      cy.contains('a', 'Пользователи').should('be.visible');
      cy.contains('a', 'Профиль').should('be.visible');
      cy.contains('a', 'Проверка доступа').should('be.visible');
      cy.contains('button', 'English').should('be.visible');

      cy.reload();
      cy.contains('Дашборд', { timeout: 10000 }).should('be.visible');

      cy.visit('/plans');
      cy.contains('Тарифы').should('be.visible');
      cy.contains('Выберите тарифный план').should('be.visible');
      cy.contains('Подписаться').should('be.visible');

      cy.visit('/profile');
      cy.contains("У вас пока нет активной подписки.").should('be.visible');

      cy.contains('button', 'English').click();
      cy.contains("You don't have an active subscription yet.").should('be.visible');

      cy.visit('/plans');
      cy.contains('Plans').should('be.visible');
      cy.contains('Choose a subscription plan').should('be.visible');
      cy.contains('Subscribe').should('be.visible');
    });
  });

  it('shows translated page title and back button in Russian', () => {
    cy.registerViaApi({ plan: 'basic' }).then(() => {
      cy.visit('/subscriptions');
      cy.contains('button', 'Russian').click();

      cy.contains('Подписки').should('be.visible');
      cy.contains('История ваших подписок').should('be.visible');
      cy.contains('a', 'Подробнее').click();

      cy.contains('Детали подписки').should('be.visible');
      cy.contains('button', 'Назад').should('be.visible');
      cy.contains('Отменить подписку').should('be.visible');
      cy.contains('Платежи').should('be.visible');

      cy.contains('button', 'Назад').click();
      cy.location('pathname').should('eq', '/subscriptions');
    });
  });
});
