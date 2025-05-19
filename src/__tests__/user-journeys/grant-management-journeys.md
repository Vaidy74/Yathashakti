# Grant Management Feature - User Journey Test Cases

This document outlines comprehensive user journey test cases for the Grant Management features, focusing on the repayment recording and communication logging functionalities.

## 1. Grant Detail View Journeys

### 1.1 View Grant Details
- **Precondition**: User is authenticated and has access to grants
- **Test Steps**:
  1. Navigate to the Grants List page
  2. Click on a specific grant from the list
  3. Verify grant details are displayed correctly
  4. Verify tabs for different sections (Overview, Repayment, Communication, etc.) are present
- **Expected Result**: Grant details page loads correctly with all information

### 1.2 Tab Navigation
- **Precondition**: User is on the Grant Detail page
- **Test Steps**:
  1. Click on each tab (Overview, Repayment, Communication, etc.)
  2. Verify appropriate content is loaded for each tab
- **Expected Result**: Each tab shows the correct content when clicked

## 2. Repayment Management Journeys

### 2.1 View Repayment Schedule
- **Precondition**: User is on the Grant Detail page
- **Test Steps**:
  1. Click on the Repayment tab
  2. Verify repayment schedule is displayed
  3. Verify repayment status indicators are correct
  4. Check that repayment statistics show accurate values
- **Expected Result**: Repayment schedule and statistics are displayed correctly

### 2.2 Record Repayment from Grant Detail
- **Precondition**: User is on the Grant Detail page with a grant that has pending repayments
- **Test Steps**:
  1. Click on the "Record Repayment" button on the Grant Detail page
  2. Verify navigation to the Record Repayment page
  3. Fill out the repayment form with valid data
  4. Submit the form
  5. Verify successful submission message
  6. Verify redirect back to Grant Detail page
  7. Check the Repayment tab to confirm the payment was recorded
- **Expected Result**: Repayment is successfully recorded and appears in the history

### 2.3 Record Repayment for Specific Installment
- **Precondition**: User is on the Repayment tab of a grant with scheduled installments
- **Test Steps**:
  1. Find a specific installment in the schedule
  2. Click on the "Record Payment" option for that installment
  3. Verify form is pre-populated with the correct installment details
  4. Complete the form with valid payment data
  5. Submit the form
  6. Verify successful submission message
  7. Check that the installment status is updated correctly
- **Expected Result**: Payment is recorded against the specific installment and status is updated

### 2.4 Attempt Invalid Repayment
- **Precondition**: User is on the Record Repayment page
- **Test Steps**:
  1. Fill out the form with invalid data (e.g., amount exceeding balance, missing fields)
  2. Attempt to submit the form
  3. Verify appropriate validation errors are displayed
- **Expected Result**: Form submission is prevented and validation errors are displayed

### 2.5 View Repayment History
- **Precondition**: User is on the Repayment tab of a grant with recorded payments
- **Test Steps**:
  1. Scroll to the repayment history section
  2. Verify all recorded payments are displayed in chronological order
  3. Check that payment details (amount, date, method) are displayed correctly
- **Expected Result**: Complete repayment history is displayed accurately

## 3. Communication Logging Journeys

### 3.1 View Communication History
- **Precondition**: User is on the Grant Detail page
- **Test Steps**:
  1. Click on the Communication tab
  2. Verify communication history is displayed
  3. Check that each communication entry shows correct details (type, date, notes)
- **Expected Result**: Communication history is displayed correctly

### 3.2 Log New Communication from Grant Detail
- **Precondition**: User is on the Grant Detail page
- **Test Steps**:
  1. Click on the "Log Communication" button
  2. Verify navigation to the Log Communication page
  3. Fill out the communication form with valid data
  4. Submit the form
  5. Verify successful submission message
  6. Verify redirect back to Grant Detail page
  7. Check the Communication tab to confirm the log was recorded
- **Expected Result**: Communication is successfully logged and appears in the history

### 3.3 Log Communication with Evidence Upload
- **Precondition**: User is on the Log Communication page
- **Test Steps**:
  1. Fill out the communication form with valid data
  2. Upload a valid evidence file (document, image, etc.)
  3. Verify the file is uploaded successfully
  4. Submit the form
  5. Verify successful submission
  6. Check the Communication tab to confirm the log was recorded with evidence
- **Expected Result**: Communication with evidence is logged successfully

### 3.4 Log Communication with Grant Status Update
- **Precondition**: User is on the Log Communication page
- **Test Steps**:
  1. Fill out the communication form with valid data
  2. Check the option to update grant status
  3. Select a new status from the dropdown
  4. Submit the form
  5. Verify successful submission
  6. Check that the grant status has been updated on the Grant Detail page
- **Expected Result**: Communication is logged and grant status is updated successfully

### 3.5 Attempt Invalid Communication Log
- **Precondition**: User is on the Log Communication page
- **Test Steps**:
  1. Fill out the form with invalid data (missing required fields)
  2. Attempt to submit the form
  3. Verify appropriate validation errors are displayed
- **Expected Result**: Form submission is prevented and validation errors are displayed

## 4. End-to-End Journeys

### 4.1 Complete Grant Lifecycle
- **Precondition**: User has created a new grant with a repayment schedule
- **Test Steps**:
  1. Navigate to the Grant Detail page
  2. Record multiple repayments over time
  3. Log communication interactions after each repayment
  4. Verify repayment progress and completion percentage updates
  5. Make the final repayment
  6. Verify grant status changes to COMPLETED
- **Expected Result**: Grant progresses through its lifecycle correctly with all statistics updated accurately

### 4.2 Handle Defaulted Repayment
- **Precondition**: User has a grant with an overdue installment
- **Test Steps**:
  1. Navigate to the Grant Detail page
  2. Verify the overdue installment is marked appropriately
  3. Log a communication about the default
  4. Update the grant status to DEFAULTED
  5. Later record a late repayment
  6. Log a follow-up communication
  7. Update the grant status back to CURRENT
- **Expected Result**: System correctly handles the default situation and recovery

## 5. Cross-cutting Journeys

### 5.1 Filter and Search Grants
- **Precondition**: User has access to multiple grants in different states
- **Test Steps**:
  1. Navigate to the Grants List page
  2. Use filters to show only grants with specific status
  3. Use search to find grants by identifier or grantee name
  4. Select a filtered grant to view details
- **Expected Result**: Filters and search work correctly to help find specific grants

### 5.2 Dashboard Statistics Accuracy
- **Precondition**: User has recorded various grant activities
- **Test Steps**:
  1. Navigate to the Dashboard
  2. Check repayment statistics (due, collected, overdue)
  3. Record a new repayment
  4. Verify dashboard statistics update accordingly
- **Expected Result**: Dashboard statistics accurately reflect grant activity

## Implementation Notes

Each of these test cases should be implemented as automated tests using a combination of:

1. **Unit Tests** - For testing individual components
2. **API Tests** - For testing backend endpoints
3. **End-to-End Tests** - For testing complete user journeys using tools like Cypress or Playwright

For E2E tests, consider implementing these using a framework like Cypress or Playwright, which can simulate user interactions and verify the state of the application after each action.

Example Cypress test structure for recording a repayment:

```javascript
describe('Record Repayment Journey', () => {
  beforeEach(() => {
    // Login and setup test data
    cy.login('test@example.com', 'password');
    cy.createTestGrant();
  });

  it('should successfully record a repayment', () => {
    // Navigate to grant detail
    cy.visit('/grants/[test-grant-id]');
    
    // Click record repayment button
    cy.contains('Record Repayment').click();
    
    // Fill out form
    cy.get('#amount').type('1000');
    cy.get('#method').select('BANK_TRANSFER');
    cy.get('#paymentDate').type('2025-05-15');
    cy.get('#notes').type('Test repayment');
    
    // Submit form
    cy.contains('button', 'Record Payment').click();
    
    // Verify success and redirection
    cy.contains('Payment recorded successfully');
    cy.url().should('include', '/grants/[test-grant-id]');
    
    // Verify repayment appears in history
    cy.contains('Repayment').click();
    cy.contains('tr', '₹1,000').should('exist');
  });
});
```

These test journeys serve as a foundation for building a comprehensive test suite that can be expanded as new features are added.
