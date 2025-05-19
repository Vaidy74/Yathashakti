import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RepaymentForm from '@/components/grants/RepaymentForm';
import { Grant, GrantStatus, RepaymentMethod } from '@/types/grant';

// Mock toast
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn()
}));

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ success: true }),
  })
) as jest.Mock;

describe('RepaymentForm Component', () => {
  const mockGrant: Grant = {
    id: 'grant-123',
    grantIdentifier: 'G-123',
    amount: 10000,
    disbursementDate: '2025-01-01',
    status: GrantStatus.CURRENT,
    repaymentRate: 0,
    programId: 'program-1',
    granteeId: 'grantee-1',
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
    grantee: {
      id: 'grantee-1',
      name: 'Test Grantee',
      contactPerson: 'John Doe',
      email: 'test@example.com',
      phone: '1234567890',
      address: 'Test Address',
      createdAt: '2025-01-01',
      updatedAt: '2025-01-01'
    },
    repaymentHistory: []
  };

  const mockOnSuccess = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the form correctly', () => {
    render(<RepaymentForm grant={mockGrant} onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);
    
    // Check if key form elements are present
    expect(screen.getByText(/Record Repayment/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Payment Amount/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Payment Method/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Payment Date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Notes/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Record Payment/i })).toBeInTheDocument();
    
    // Check that grant information is displayed
    expect(screen.getByText(mockGrant.grantIdentifier)).toBeInTheDocument();
    expect(screen.getByText(mockGrant.grantee.name)).toBeInTheDocument();
  });

  it('handles form submission with valid data', async () => {
    render(<RepaymentForm grant={mockGrant} onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText(/Payment Amount/i), { target: { value: '1000' } });
    fireEvent.change(screen.getByLabelText(/Payment Method/i), { target: { value: RepaymentMethod.BANK_TRANSFER } });
    fireEvent.change(screen.getByLabelText(/Notes/i), { target: { value: 'Test repayment notes' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Record Payment/i }));
    
    // Wait for fetch to be called
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `/api/grants/${mockGrant.id}/repayments`,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('Test repayment notes'),
        })
      );
    });
    
    // Check that success callback was called
    expect(mockOnSuccess).toHaveBeenCalled();
  });

  it('validates form before submission', async () => {
    render(<RepaymentForm grant={mockGrant} onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);
    
    // Set invalid amount (empty)
    fireEvent.change(screen.getByLabelText(/Payment Amount/i), { target: { value: '' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Record Payment/i }));
    
    // Check that error message is displayed
    expect(screen.getByText(/Amount must be greater than zero/i)).toBeInTheDocument();
    
    // Check that fetch was not called
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('handles cancel button correctly', () => {
    render(<RepaymentForm grant={mockGrant} onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);
    
    // Click cancel button
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    
    // Check that cancel callback was called
    expect(mockOnCancel).toHaveBeenCalled();
  });
});
