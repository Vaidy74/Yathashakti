import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { NextRequest, NextResponse } from 'next/server';
import { GET, POST } from '@/app/api/grantees/[id]/documents/route';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    granteeDocument: {
      findMany: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    },
    grantee: {
      findUnique: jest.fn()
    }
  }
}));

// Mock NextAuth
jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(() => Promise.resolve({
    user: { name: 'Test User', email: 'test@example.com', id: 'user123' }
  }))
}));

// Mock Request and Response
function createMockRequest(method = 'GET', body = null, params = {}) {
  const request = {
    method,
    nextUrl: { searchParams: new URLSearchParams() },
    json: jest.fn().mockResolvedValue(body)
  } as unknown as NextRequest;
  
  return { request, params };
}

describe('Grantee Documents API', () => {
  const mockPrisma = require('@/lib/prisma').prisma;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
  });
  
  describe('GET /api/grantees/[id]/documents', () => {
    it('should return all documents for a grantee', async () => {
      // Mock data
      const mockDocuments = [
        { id: '1', type: 'ID Proof', fileUrl: '/uploads/id.pdf', description: 'Aadhar Card', uploadedAt: new Date() },
        { id: '2', type: 'Address Proof', fileUrl: '/uploads/address.pdf', description: 'Electricity Bill', uploadedAt: new Date() }
      ];
      
      // Mock Prisma responses
      mockPrisma.grantee.findUnique.mockResolvedValue({ id: '123', name: 'Test Grantee' });
      mockPrisma.granteeDocument.findMany.mockResolvedValue(mockDocuments);
      
      // Create mock request
      const { request, params } = createMockRequest('GET', null, { id: '123' });
      
      // Call the API endpoint
      const response = await GET(request, { params: { id: '123' } });
      const responseData = await response.json();
      
      // Expectations
      expect(mockPrisma.grantee.findUnique).toHaveBeenCalledWith({ where: { id: '123' } });
      expect(mockPrisma.granteeDocument.findMany).toHaveBeenCalledWith({ where: { granteeId: '123' } });
      expect(response.status).toBe(200);
      expect(responseData).toEqual(mockDocuments);
    });
    
    it('should return 404 if grantee not found', async () => {
      // Mock Prisma responses
      mockPrisma.grantee.findUnique.mockResolvedValue(null);
      
      // Create mock request
      const { request, params } = createMockRequest('GET', null, { id: '456' });
      
      // Call the API endpoint
      const response = await GET(request, { params: { id: '456' } });
      const responseData = await response.json();
      
      // Expectations
      expect(mockPrisma.grantee.findUnique).toHaveBeenCalledWith({ where: { id: '456' } });
      expect(response.status).toBe(404);
      expect(responseData).toHaveProperty('error', 'Grantee not found');
    });
  });
  
  describe('POST /api/grantees/[id]/documents', () => {
    it('should add a new document to a grantee', async () => {
      // Mock data
      const docData = {
        name: 'Aadhar Card',
        type: 'ID Proof',
        fileUrl: '/uploads/id.pdf'
      };
      
      const mockCreatedDocument = {
        id: '1',
        granteeId: '123',
        ...docData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Mock Prisma responses
      mockPrisma.grantee.findUnique.mockResolvedValue({ id: '123', name: 'Test Grantee' });
      mockPrisma.granteeDocument.create.mockResolvedValue(mockCreatedDocument);
      
      // Create mock request
      const { request, params } = createMockRequest('POST', docData, { id: '123' });
      
      // Call the API endpoint
      const response = await POST(request, { params: { id: '123' } });
      const responseData = await response.json();
      
      // Expectations
      expect(mockPrisma.grantee.findUnique).toHaveBeenCalledWith({ where: { id: '123' } });
      expect(mockPrisma.granteeDocument.create).toHaveBeenCalledWith({
        data: {
          name: docData.name,
          type: docData.type,
          fileUrl: docData.fileUrl,
          granteeId: '123'
        }
      });
      expect(response.status).toBe(201);
      expect(responseData).toEqual(mockCreatedDocument);
    });
    
    it('should return 404 if grantee not found', async () => {
      // Mock data
      const docData = {
        name: 'Aadhar Card',
        type: 'ID Proof',
        fileUrl: '/uploads/id.pdf'
      };
      
      // Mock Prisma responses
      mockPrisma.grantee.findUnique.mockResolvedValue(null);
      
      // Create mock request
      const { request, params } = createMockRequest('POST', docData, { id: '456' });
      
      // Call the API endpoint
      const response = await POST(request, { params: { id: '456' } });
      const responseData = await response.json();
      
      // Expectations
      expect(mockPrisma.grantee.findUnique).toHaveBeenCalledWith({ where: { id: '456' } });
      expect(mockPrisma.granteeDocument.create).not.toHaveBeenCalled();
      expect(response.status).toBe(404);
      expect(responseData).toHaveProperty('error', 'Grantee not found');
    });
    
    it('should return 400 if required fields are missing', async () => {
      // Mock data with missing required fields
      const docData = {
        name: 'Aadhar Card'
        // Missing type and fileUrl
      };
      
      // Mock Prisma responses
      mockPrisma.grantee.findUnique.mockResolvedValue({ id: '123', name: 'Test Grantee' });
      
      // Create mock request
      const { request, params } = createMockRequest('POST', docData, { id: '123' });
      
      // Call the API endpoint
      const response = await POST(request, { params: { id: '123' } });
      const responseData = await response.json();
      
      // Expectations
      expect(mockPrisma.grantee.findUnique).toHaveBeenCalledWith({ where: { id: '123' } });
      expect(mockPrisma.granteeDocument.create).not.toHaveBeenCalled();
      expect(response.status).toBe(400);
      expect(responseData).toHaveProperty('error');
    });
  });
});
