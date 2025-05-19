import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { NextRequest, NextResponse } from 'next/server';
import { POST } from '@/app/api/uploads/route';

// Mock dependencies
jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(() => Promise.resolve({ user: { name: 'Test User' } }))
}));

jest.mock('fs/promises', () => ({
  writeFile: jest.fn(() => Promise.resolve())
}));

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid-1234')
}));

describe('Upload API', () => {
  let mockFormData: FormData;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create mock FormData
    mockFormData = new FormData();
    const mockFile = new File(['test file content'], 'test.pdf', { type: 'application/pdf' });
    mockFormData.append('file', mockFile);
    mockFormData.append('entityType', 'grantee');
    mockFormData.append('entityId', 'test-grantee-123');
    mockFormData.append('documentType', 'ID Proof');
  });

  it('should handle file uploads correctly', async () => {
    // Create mock request
    const mockRequest = {
      formData: jest.fn(() => Promise.resolve(mockFormData))
    } as unknown as NextRequest;

    // Call API handler
    const response = await POST(mockRequest);
    
    // Assertions
    expect(response).toBeInstanceOf(NextResponse);
    
    const responseData = await response.json();
    expect(responseData.success).toBe(true);
    expect(responseData.file.name).toBe('test.pdf');
    expect(responseData.file.url).toContain('/uploads/test-uuid-1234.pdf');
  });

  it('should reject unauthorized requests', async () => {
    // Mock unauthorized session
    require('next-auth/next').getServerSession.mockResolvedValueOnce(null);
    
    // Create mock request
    const mockRequest = {
      formData: jest.fn(() => Promise.resolve(mockFormData))
    } as unknown as NextRequest;

    // Call API handler
    const response = await POST(mockRequest);
    
    // Assertions
    expect(response).toBeInstanceOf(NextResponse);
    expect(response.status).toBe(401);
    
    const responseData = await response.json();
    expect(responseData.error).toBe('Unauthorized');
  });

  it('should validate required file data', async () => {
    // Create mock request with missing file
    const incompleteFormData = new FormData();
    incompleteFormData.append('entityType', 'grantee');
    incompleteFormData.append('entityId', 'test-grantee-123');
    
    const mockRequest = {
      formData: jest.fn(() => Promise.resolve(incompleteFormData))
    } as unknown as NextRequest;

    // Call API handler
    const response = await POST(mockRequest);
    
    // Assertions
    expect(response).toBeInstanceOf(NextResponse);
    expect(response.status).toBe(400);
    
    const responseData = await response.json();
    expect(responseData.error).toBe('No file provided');
  });
});
