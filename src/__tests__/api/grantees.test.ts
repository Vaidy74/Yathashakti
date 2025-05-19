import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { NextRequest, NextResponse } from 'next/server';
import { GET, POST } from '@/app/api/grantees/route';
import { GET as GetGranteeById, PATCH, DELETE } from '@/app/api/grantees/[id]/route';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    grantee: {
      findMany: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn()
    }
  }
}));

// Mock NextAuth
jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(() => Promise.resolve({ user: { name: 'Test User' } }))
}));

describe('Grantees API', () => {
  const mockPrisma = require('@/lib/prisma').prisma;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
  });

  describe('GET /api/grantees', () => {
    it('should return a list of grantees', async () => {
      // Mock data
      const mockGrantees = [
        { id: '1', name: 'John Doe', sector: 'Agriculture' },
        { id: '2', name: 'Jane Smith', sector: 'Handicrafts' }
      ];
      
      mockPrisma.grantee.findMany.mockResolvedValue(mockGrantees);
      mockPrisma.grantee.count.mockResolvedValue(2);
      
      // Create mock request
      const mockRequest = {
        nextUrl: { searchParams: new URLSearchParams() }
      } as unknown as NextRequest;
      
      // Call API handler
      const response = await GET(mockRequest);
      
      // Assertions
      expect(response).toBeInstanceOf(NextResponse);
      
      const responseData = await response.json();
      expect(responseData.grantees).toEqual(mockGrantees);
      expect(responseData.total).toBe(2);
    });
    
    it('should handle pagination and filters', async () => {
      // Mock data
      const mockGrantees = [{ id: '1', name: 'John Doe', sector: 'Agriculture' }];
      
      mockPrisma.grantee.findMany.mockResolvedValue(mockGrantees);
      mockPrisma.grantee.count.mockResolvedValue(1);
      
      // Create mock request with search params
      const searchParams = new URLSearchParams();
      searchParams.append('limit', '10');
      searchParams.append('offset', '0');
      searchParams.append('search', 'John');
      
      const mockRequest = {
        nextUrl: { searchParams }
      } as unknown as NextRequest;
      
      // Call API handler
      const response = await GET(mockRequest);
      
      // Assertions
      expect(mockPrisma.grantee.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { name: expect.objectContaining({ contains: 'John', mode: 'insensitive' }) }
            ])
          }),
          take: 10,
          skip: 0
        })
      );
    });
  });
  
  describe('POST /api/grantees', () => {
    it('should create a new grantee', async () => {
      // Mock data
      const granteeData = {
        name: 'New Grantee',
        sector: 'Technology',
        phone: '1234567890',
        village: 'Test Village',
        district: 'Test District',
        state: 'Test State'
      };
      
      const createdGrantee = { id: '1', ...granteeData };
      mockPrisma.grantee.create.mockResolvedValue(createdGrantee);
      
      // Create mock request
      const mockRequest = {
        json: jest.fn(() => Promise.resolve(granteeData))
      } as unknown as NextRequest;
      
      // Call API handler
      const response = await POST(mockRequest);
      
      // Assertions
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(201);
      
      const responseData = await response.json();
      expect(responseData).toEqual(createdGrantee);
      expect(mockPrisma.grantee.create).toHaveBeenCalledWith({
        data: granteeData
      });
    });
  });
  
  describe('GET /api/grantees/[id]', () => {
    it('should return a specific grantee by ID', async () => {
      // Mock data
      const mockGrantee = { 
        id: '1', 
        name: 'John Doe', 
        sector: 'Agriculture',
        grants: []
      };
      
      mockPrisma.grantee.findUnique.mockResolvedValue(mockGrantee);
      
      // Create mock request params
      const mockParams = { id: '1' };
      
      // Call API handler
      const response = await GetGranteeById({} as NextRequest, { params: mockParams });
      
      // Assertions
      expect(response).toBeInstanceOf(NextResponse);
      
      const responseData = await response.json();
      expect(responseData).toEqual(mockGrantee);
      expect(mockPrisma.grantee.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: expect.objectContaining({
          grants: true
        })
      });
    });
    
    it('should return 404 for non-existent grantee', async () => {
      // Mock no data found
      mockPrisma.grantee.findUnique.mockResolvedValue(null);
      
      // Create mock request params
      const mockParams = { id: 'non-existent-id' };
      
      // Call API handler
      const response = await GetGranteeById({} as NextRequest, { params: mockParams });
      
      // Assertions
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(404);
      
      const responseData = await response.json();
      expect(responseData.error).toBe('Grantee not found');
    });
  });
  
  describe('PATCH /api/grantees/[id]', () => {
    it('should update a grantee', async () => {
      // Mock data
      const updateData = { name: 'Updated Name' };
      const updatedGrantee = { id: '1', name: 'Updated Name', sector: 'Agriculture' };
      
      mockPrisma.grantee.findUnique.mockResolvedValue({ id: '1', name: 'John Doe', sector: 'Agriculture' });
      mockPrisma.grantee.update.mockResolvedValue(updatedGrantee);
      
      // Create mock request
      const mockRequest = {
        json: jest.fn(() => Promise.resolve(updateData))
      } as unknown as NextRequest;
      
      // Create mock params
      const mockParams = { id: '1' };
      
      // Call API handler
      const response = await PATCH(mockRequest, { params: mockParams });
      
      // Assertions
      expect(response).toBeInstanceOf(NextResponse);
      
      const responseData = await response.json();
      expect(responseData).toEqual(updatedGrantee);
      expect(mockPrisma.grantee.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateData
      });
    });
  });
  
  describe('DELETE /api/grantees/[id]', () => {
    it('should delete a grantee', async () => {
      // Mock existing grantee
      mockPrisma.grantee.findUnique.mockResolvedValue({ id: '1', name: 'John Doe' });
      mockPrisma.grantee.delete.mockResolvedValue({ id: '1', name: 'John Doe' });
      
      // Create mock params
      const mockParams = { id: '1' };
      
      // Call API handler
      const response = await DELETE({} as NextRequest, { params: mockParams });
      
      // Assertions
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(200);
      
      const responseData = await response.json();
      expect(responseData.success).toBe(true);
      expect(mockPrisma.grantee.delete).toHaveBeenCalledWith({
        where: { id: '1' }
      });
    });
  });
});
