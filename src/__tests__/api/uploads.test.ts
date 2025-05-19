import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { NextRequest, NextResponse } from 'next/server';
import { POST } from '@/app/api/uploads/route';
import { writeFile } from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

// Mock fs/promises
jest.mock('fs/promises', () => ({
  writeFile: jest.fn()
}));

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn()
}));

// Mock NextAuth
jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(() => Promise.resolve({
    user: { name: 'Test User', email: 'test@example.com', id: 'user123' }
  }))
}));

// Mock process.cwd
jest.mock('process', () => ({
  ...jest.requireActual('process'),
  cwd: jest.fn(() => '/mock/directory')
}));

describe('File Upload API', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Set mock return value for uuid
    (uuidv4 as jest.Mock).mockReturnValue('mock-uuid-123');
  });
  
  it('should upload a file successfully', async () => {
    // Mock file data
    const fileBuffer = Buffer.from('mock file content');
    const file = {
      name: 'test.pdf',
      type: 'application/pdf',
      size: 1024,
      arrayBuffer: jest.fn().mockResolvedValue(fileBuffer)
    };
    
    // Mock FormData
    const formData = {
      get: jest.fn((key) => {
        if (key === 'file') return file;
        if (key === 'entityType') return 'grantee';
        if (key === 'entityId') return '123';
        if (key === 'documentType') return 'ID Proof';
        return null;
      })
    };
    
    // Mock request
    const request = {
      formData: jest.fn().mockResolvedValue(formData)
    } as unknown as NextRequest;
    
    // Call the API endpoint
    const response = await POST(request);
    const responseData = await response.json();
    
    // Expectations
    expect(writeFile).toHaveBeenCalledWith(
      '/mock/directory/public/uploads/mock-uuid-123.pdf', 
      fileBuffer
    );
    
    expect(responseData).toEqual({
      success: true,
      file: {
        name: 'test.pdf',
        type: 'application/pdf',
        size: 1024,
        url: '/uploads/mock-uuid-123.pdf',
        documentType: 'ID Proof',
        entityType: 'grantee',
        entityId: '123'
      }
    });
  });
  
  it('should return 400 if no file provided', async () => {
    // Mock FormData without a file
    const formData = {
      get: jest.fn((key) => {
        if (key === 'file') return null;
        if (key === 'entityType') return 'grantee';
        if (key === 'entityId') return '123';
        return null;
      })
    };
    
    // Mock request
    const request = {
      formData: jest.fn().mockResolvedValue(formData)
    } as unknown as NextRequest;
    
    // Call the API endpoint
    const response = await POST(request);
    const responseData = await response.json();
    
    // Expectations
    expect(writeFile).not.toHaveBeenCalled();
    expect(response.status).toBe(400);
    expect(responseData).toEqual({ error: "No file provided" });
  });
  
  it('should return 400 if entity information is missing', async () => {
    // Mock file data
    const fileBuffer = Buffer.from('mock file content');
    const file = {
      name: 'test.pdf',
      type: 'application/pdf',
      size: 1024,
      arrayBuffer: jest.fn().mockResolvedValue(fileBuffer)
    };
    
    // Mock FormData without entity information
    const formData = {
      get: jest.fn((key) => {
        if (key === 'file') return file;
        return null;
      })
    };
    
    // Mock request
    const request = {
      formData: jest.fn().mockResolvedValue(formData)
    } as unknown as NextRequest;
    
    // Call the API endpoint
    const response = await POST(request);
    const responseData = await response.json();
    
    // Expectations
    expect(writeFile).not.toHaveBeenCalled();
    expect(response.status).toBe(400);
    expect(responseData).toEqual({ error: "Entity information required" });
  });
  
  it('should return 400 if file size exceeds limit', async () => {
    // Mock large file
    const file = {
      name: 'large.pdf',
      type: 'application/pdf',
      size: 10 * 1024 * 1024, // 10MB
      arrayBuffer: jest.fn()
    };
    
    // Mock FormData
    const formData = {
      get: jest.fn((key) => {
        if (key === 'file') return file;
        if (key === 'entityType') return 'grantee';
        if (key === 'entityId') return '123';
        return null;
      })
    };
    
    // Mock request
    const request = {
      formData: jest.fn().mockResolvedValue(formData)
    } as unknown as NextRequest;
    
    // Call the API endpoint
    const response = await POST(request);
    const responseData = await response.json();
    
    // Expectations
    expect(writeFile).not.toHaveBeenCalled();
    expect(response.status).toBe(400);
    expect(responseData).toEqual({ error: "File size exceeds 5MB limit" });
  });
  
  it('should handle errors during file write', async () => {
    // Mock file data
    const fileBuffer = Buffer.from('mock file content');
    const file = {
      name: 'test.pdf',
      type: 'application/pdf',
      size: 1024,
      arrayBuffer: jest.fn().mockResolvedValue(fileBuffer)
    };
    
    // Mock FormData
    const formData = {
      get: jest.fn((key) => {
        if (key === 'file') return file;
        if (key === 'entityType') return 'grantee';
        if (key === 'entityId') return '123';
        return null;
      })
    };
    
    // Mock writeFile to throw error
    (writeFile as jest.Mock).mockRejectedValue(new Error('Mock filesystem error'));
    
    // Mock request
    const request = {
      formData: jest.fn().mockResolvedValue(formData)
    } as unknown as NextRequest;
    
    // Call the API endpoint
    const response = await POST(request);
    const responseData = await response.json();
    
    // Expectations
    expect(writeFile).toHaveBeenCalled();
    expect(response.status).toBe(500);
    expect(responseData).toHaveProperty('error', 'Error uploading file');
    expect(responseData).toHaveProperty('message', 'Mock filesystem error');
  });
});
