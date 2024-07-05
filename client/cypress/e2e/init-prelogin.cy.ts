describe('Initial page open no login credentials', () => {
  it('Open registration page and form', () => {
    // open dev localhost on port 5173
    cy.visit('/');
    // Should see a registration link, and be able to click it
    cy.get('[data-testid="registration-link"]').click();
    // Should load the registration page that contains a registration form
    cy.url().should('include', '/register');
    cy.get('form[data-testid="registration-form"]').should('exist');
  })
})