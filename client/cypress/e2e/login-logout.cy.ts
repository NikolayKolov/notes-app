describe('Login and logout', () => {
  it('Login -> inspect create new note, logout -> see if create new note is removed', () => {
    cy.visit('/');

    /* Login section */
    // open login dialog
    cy.get('[data-testid="login-link"]').click();
    // login dialog modal should appear
    cy.get('div[data-testid="login-dialog"]').should('exist');
    // login with test user/password stored in database
    cy.get('input[name="email"]').type(Cypress.env('test_user'));
    cy.get('input[name="password"]').type(Cypress.env('test_user_password'));
    cy.get('button[name="login"]').click();
    // Test if new options become available
    cy.get('[data-testid="create-new-note"]').should('exist');

    /* Logout section */
    // open logout menu
    cy.get('[data-testid="logout-button"]').click();
    cy.get('li[data-testid="user-name"]').should('have.text', Cypress.env('test_user_name'));
    cy.get('li[data-testid="logout-link"]').click();
    // Test if new options are now unavailable
    cy.get('[data-testid="create-new-note"]').should('not.exist');
  })
})