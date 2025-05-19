// Example Cypress test for the Record Repayment user journey

describe('Record Repayment Journey', () => {
  beforeEach(() => {
    // Log in before each test
    cy.visit('/api/auth/signin');
    cy.get('input[name="email"]').type(Cypress.env('testUserEmail'));
    cy.get('input[name="password"]').type(Cypress.env('testUserPassword'));
    cy.get('button[type="submit"]').click();
    
    // Verify login was successful
    cy.url().should('include', '/dashboard');
  });

  it('should navigate to record repayment page from grant detail', () => {
    // This test assumes a test grant exists
    // In production, you would create a test grant using a custom command or API call
    cy.visit('/grants');
    cy.get('table tbody tr').first().click();
    
    // Verify navigation to grant detail page
    cy.url().should('include', '/grants/');
    
    // Click the Record Repayment button
    cy.contains('Record Repayment').click();
    
    // Verify navigation to record repayment page
    cy.url().should('include', '/record-repayment');
    
    // Verify form elements are present
    cy.get('#amount').should('exist');
    cy.get('#method').should('exist');
    cy.get('#paymentDate').should('exist');
  });

  it('should successfully record a valid repayment', () => {
    // Navigate to a specific grant detail page
    // In production, you would use a known test grant ID
    cy.visit('/grants');
    cy.get('table tbody tr').first().click();
    
    // Click the Record Repayment button
    cy.contains('Record Repayment').click();
    
    // Fill out the repayment form
    cy.get('#amount').type('1000');
    cy.get('#method').select('BANK_TRANSFER');
    cy.get('#paymentDate').type(new Date().toISOString().split('T')[0]);
    cy.get('#notes').type('Test repayment via automated test');
    
    // Submit the form
    cy.contains('button', 'Record Payment').click();
    
    // Verify success message
    cy.contains('Payment recorded successfully').should('be.visible');
    
    // Verify redirection back to grant detail
    cy.url().should('include', '/grants/').and('not.include', '/record-repayment');
    
    // Navigate to repayment tab to verify payment was recorded
    cy.contains('Repayment').click();
    cy.contains('₹1,000').should('exist');
    cy.contains('Test repayment via automated test').should('exist');
  });

  it('should show validation errors for invalid repayment data', () => {
    // Navigate to record repayment page for a grant
    cy.visit('/grants');
    cy.get('table tbody tr').first().click();
    cy.contains('Record Repayment').click();
    
    // Try to submit with invalid data (empty amount)
    cy.get('#amount').clear();
    cy.contains('button', 'Record Payment').click();
    
    // Verify validation error
    cy.contains('Amount must be greater than zero').should('be.visible');
    
    // Try with amount exceeding remaining balance
    // This assumes the max amount would be displayed somewhere on the page
    cy.get('.remaining-amount').then(($element) => {
      const remainingText = $element.text();
      const remainingAmount = parseInt(remainingText.replace(/[^0-9]/g, '')) + 1000;
      
      cy.get('#amount').clear().type(remainingAmount);
      cy.contains('button', 'Record Payment').click();
      
      // Verify appropriate error
      cy.contains('Amount exceeds remaining balance').should('be.visible');
    });
  });
});
