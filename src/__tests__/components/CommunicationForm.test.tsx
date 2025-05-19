import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CommunicationForm from '@/components/grants/CommunicationForm';
import { Grant, GrantStatus, CommunicationType } from '@/types/grant';

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

describe('CommunicationForm Component', () => {
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
    }
  };

  const mockOnSuccess = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the form correctly', () => {
    render(<CommunicationForm grant={mockGrant} onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);
    
    // Check if key form elements are present
    expect(screen.getByText(/Log Communication/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Communication Type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Communication Date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Communication Notes/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Evidence/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Follow-up Date/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Log Communication/i })).toBeInTheDocument();
    
    // Check that grant information is displayed
    expect(screen.getByText(mockGrant.grantIdentifier)).toBeInTheDocument();
    expect(screen.getByText(mockGrant.grantee.name)).toBeInTheDocument();
    expect(screen.getByText(mockGrant.status)).toBeInTheDocument();
  });

  it('handles form submission with valid data', async () => {
    render(<CommunicationForm grant={mockGrant} onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText(/Communication Type/i), { target: { value: CommunicationType.PHONE_CALL } });
    fireEvent.change(screen.getByLabelText(/Communication Notes/i), { target: { value: 'Test communication notes' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Log Communication/i }));
    
    // Wait for fetch to be called
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `/api/grants/${mockGrant.id}/communications`,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('Test communication notes'),
        })
      );
    });
    
    // Check that success callback was called
    expect(mockOnSuccess).toHaveBeenCalled();
  });

  it('validates form before submission', async () => {
    render(<CommunicationForm grant={mockGrant} onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);
    
    // Set invalid notes (empty)
    fireEvent.change(screen.getByLabelText(/Communication Notes/i), { target: { value: '' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Log Communication/i }));
    
    // Check that error message is displayed
    expect(screen.getByText(/Communication notes are required/i)).toBeInTheDocument();
    
    // Check that fetch was not called
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('handles grant status updates correctly', async () => {
    render(<CommunicationForm grant={mockGrant} onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText(/Communication Type/i), { target: { value: CommunicationType.PHONE_CALL } });
    fireEvent.change(screen.getByLabelText(/Communication Notes/i), { target: { value: 'Status update test' } });
    
    // Check the update grant status checkbox
    fireEvent.click(screen.getByLabelText(/Update grant status/i));
    
    // Select a new status
    fireEvent.change(screen.getByLabelText(/New Grant Status/i), { target: { value: GrantStatus.COMPLETED } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Log Communication/i }));
    
    // Wait for fetch to be called
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `/api/grants/${mockGrant.id}/communications`,
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"updateGrantStatus":true'),
        })
      );
      expect(global.fetch).toHaveBeenCalledWith(
        `/api/grants/${mockGrant.id}/communications`,
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining(`"newGrantStatus":"${GrantStatus.COMPLETED}"`),
        })
      );
    });
  });

  it('handles cancel button correctly', () => {
    render(<CommunicationForm grant={mockGrant} onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);
    
    // Click cancel button
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    
    // Check that cancel callback was called
    expect(mockOnCancel).toHaveBeenCalled();
  });
});
