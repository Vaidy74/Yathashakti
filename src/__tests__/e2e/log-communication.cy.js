// Example Cypress test for the Communication Logging user journey

describe('Communication Logging Journey', () => {
  beforeEach(() => {
    // Log in before each test
    cy.visit('/api/auth/signin');
    cy.get('input[name="email"]').type(Cypress.env('testUserEmail'));
    cy.get('input[name="password"]').type(Cypress.env('testUserPassword'));
    cy.get('button[type="submit"]').click();
    
    // Verify login was successful
    cy.url().should('include', '/dashboard');
  });

  it('should navigate to log communication page from grant detail', () => {
    // Navigate to a grant detail page
    cy.visit('/grants');
    cy.get('table tbody tr').first().click();
    
    // Verify navigation to grant detail page
    cy.url().should('include', '/grants/');
    
    // Click the Log Communication button
    cy.contains('Log Communication').click();
    
    // Verify navigation to log communication page
    cy.url().should('include', '/log-communication');
    
    // Verify form elements are present
    cy.get('#type').should('exist');
    cy.get('#date').should('exist');
    cy.get('#notes').should('exist');
  });

  it('should successfully log a communication', () => {
    // Navigate to a specific grant detail page
    cy.visit('/grants');
    cy.get('table tbody tr').first().click();
    
    // Click the Log Communication button
    cy.contains('Log Communication').click();
    
    // Fill out the communication form
    cy.get('#type').select('PHONE_CALL');
    cy.get('#date').type(new Date().toISOString().split('T')[0]);
    cy.get('#notes').type('Test communication via automated test');
    
    // Submit the form
    cy.contains('button', 'Log Communication').click();
    
    // Verify success message
    cy.contains('Communication logged successfully').should('be.visible');
    
    // Verify redirection back to grant detail
    cy.url().should('include', '/grants/').and('not.include', '/log-communication');
    
    // Navigate to communication tab to verify log was recorded
    cy.contains('Communication').click();
    cy.contains('PHONE CALL').should('exist');
    cy.contains('Test communication via automated test').should('exist');
  });

  it('should log communication with grant status update', () => {
    // Navigate to log communication page for a grant
    cy.visit('/grants');
    cy.get('table tbody tr').first().click();
    cy.contains('Log Communication').click();
    
    // Fill out the communication form
    cy.get('#type').select('PHONE_CALL');
    cy.get('#date').type(new Date().toISOString().split('T')[0]);
    cy.get('#notes').type('Status update communication via automated test');
    
    // Check the update grant status option
    cy.get('#updateGrantStatus').check();
    
    // Select a new status
    cy.get('#newGrantStatus').select('CURRENT');
    
    // Submit the form
    cy.contains('button', 'Log Communication').click();
    
    // Verify success message
    cy.contains('Communication logged successfully').should('be.visible');
    
    // Verify redirection and updated status on grant detail page
    cy.url().should('include', '/grants/');
    cy.contains('Status: CURRENT').should('exist');
  });

  it('should show validation errors for invalid communication data', () => {
    // Navigate to log communication page for a grant
    cy.visit('/grants');
    cy.get('table tbody tr').first().click();
    cy.contains('Log Communication').click();
    
    // Try to submit with empty notes
    cy.get('#notes').clear();
    cy.contains('button', 'Log Communication').click();
    
    // Verify validation error
    cy.contains('Communication notes are required').should('be.visible');
    
    // Try with missing date
    cy.get('#date').clear();
    cy.contains('button', 'Log Communication').click();
    
    // Verify validation error
    cy.contains('Communication date is required').should('be.visible');
  });
});
