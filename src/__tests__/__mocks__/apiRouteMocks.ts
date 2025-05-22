/**
 * Mocks for API routes in tests
 * 
 * This file provides mocks for all API route handlers that use security features,
 * ensuring tests can run properly without being affected by rate limiting,
 * CSRF protection, or validation.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// Instead of importing and wrapping actual handlers which may cause circular dependencies,
// we'll create simplified mock implementations that match the expected behavior

// Mock Tasks API handlers
export const mockTasksAPI = {
  GET: async (request: NextRequest) => {
    // Simplified mock implementation for GET /api/tasks
    return NextResponse.json({
      tasks: [],
      total: 0,
      page: 1,
      totalPages: 0
    });
  },
  POST: async (request: NextRequest) => {
    // Simplified mock implementation for POST /api/tasks
    try {
      // Just return a success response for testing
      return NextResponse.json({ id: 'mock-task-id' }, { status: 201 });
    } catch (error) {
      console.error('Error in mock task POST:', error);
      return NextResponse.json({ error: 'Test error' }, { status: 500 });
    }
  }
};

// Mock Uploads API handlers
export const mockUploadsAPI = {
  POST: async (request: NextRequest) => {
    // Simplified mock implementation for POST /api/uploads
    try {
      // Just return a success response for testing
      return NextResponse.json({
        id: 'mock-file-id',
        url: '/uploads/test-uuid-1234.pdf',
        fileName: 'test-uuid-1234.pdf',
        originalName: 'test.pdf',
        entityType: 'grantee',
        entityId: 'test-grantee-123',
        documentType: 'ID Proof',
        uploadedBy: 'Test User',
      }, { status: 201 });
    } catch (error) {
      console.error('Error in mock upload POST:', error);
      return NextResponse.json({ error: 'Test error' }, { status: 500 });
    }
  }
};

// Mock Grantees API handlers
export const mockGranteesAPI = {
  GET: async (request: NextRequest) => {
    // Simplified mock implementation for GET /api/grantees
    return NextResponse.json({
      grantees: [],
      total: 0,
      page: 1,
      totalPages: 0
    });
  },
  POST: async (request: NextRequest) => {
    // Simplified mock implementation for POST /api/grantees
    try {
      return NextResponse.json({ id: 'mock-grantee-id' }, { status: 201 });
    } catch (error) {
      console.error('Error in mock grantee POST:', error);
      return NextResponse.json({ error: 'Test error' }, { status: 500 });
    }
  }
};

// Mock Grantee By ID API handlers
export const mockGranteeByIdAPI = {
  GET: async (request: NextRequest, { params }: { params: { id: string } }) => {
    // Simplified mock implementation for GET /api/grantees/[id]
    return NextResponse.json({
      id: params.id,
      name: 'Mock Grantee',
      sector: 'Technology'
    });
  },
  PATCH: async (request: NextRequest, { params }: { params: { id: string } }) => {
    // Simplified mock implementation for PATCH /api/grantees/[id]
    try {
      return NextResponse.json({
        id: params.id,
        name: 'Updated Grantee',
        sector: 'Healthcare'
      });
    } catch (error) {
      console.error('Error in mock grantee PATCH:', error);
      return NextResponse.json({ error: 'Test error' }, { status: 500 });
    }
  },
  DELETE: async (request: NextRequest, { params }: { params: { id: string } }) => {
    // Simplified mock implementation for DELETE /api/grantees/[id]
    try {
      return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
      console.error('Error in mock grantee DELETE:', error);
      return NextResponse.json({ error: 'Test error' }, { status: 500 });
    }
  }
};

// Add other API route mocks as needed for future tests
