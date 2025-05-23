import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { z } from 'zod';
import { withApiRateLimit } from '@/utils/apiRateLimit';
import { validateQuery, validateBody, createValidationErrorResponse } from '@/utils/validation';
import { paginationQuerySchema, calculateSkip, createPaginatedResponse } from '@/utils/pagination';

// Schema for creating a new grant
const grantCreateSchema = z.object({
  granteeId: z.string().min(1, { message: "Grantee ID is required" }),
  programId: z.string().min(1, { message: "Program ID is required" }),
  approvedAmount: z.number().nonnegative().default(0),
  disbursedAmount: z.number().nonnegative().default(0),
  remainingAmount: z.number().nonnegative().optional(),
  status: z.string().default('PENDING_APPROVAL'),
  startDate: z.string().transform(val => new Date(val)),
  endDate: z.string().transform(val => new Date(val)),
  description: z.string().optional(),
  grantIdentifier: z.string().optional()
});

// Schema for grant query parameters, extending the pagination schema
const grantQuerySchema = paginationQuerySchema.extend({
  search: z.string().optional(),
  status: z.string().optional(),
  programId: z.string().optional(),
  granteeId: z.string().optional(),
});

// GET - Retrieve all grants with pagination and filtering
export async function GET(request: NextRequest) {
  return withApiRateLimit(async (req: NextRequest) => {
    try {
      // Check authentication
      const session = await getServerSession(authOptions);
      if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      
      // Validate query parameters
      const [isValid, queryParams, validationError] = validateQuery(request, grantQuerySchema);
      
      if (!isValid) {
        // Return validation error if query parameters are invalid
        if (validationError) {
          return createValidationErrorResponse(validationError);
        }
        return NextResponse.json({ error: 'Invalid query parameters' }, { status: 400 });
      }

      // Extract validated parameters
      const {
        search = '',
        status = '',
        programId = '',
        granteeId = '',
        page = 1,
        limit = 10,
      } = queryParams || {};
      
      // Build filter conditions
      const filters: any = {};
      
      if (search) {
        filters.OR = [
          { description: { contains: search, mode: 'insensitive' } },
          { grantIdentifier: { contains: search, mode: 'insensitive' } },
          { grantee: { name: { contains: search, mode: 'insensitive' } } },
          { program: { name: { contains: search, mode: 'insensitive' } } },
        ];
      }
      
      if (status) {
        filters.status = status;
      }
      
      if (programId) {
        filters.programId = programId;
      }
      
      if (granteeId) {
        filters.granteeId = granteeId;
      }
      
      // Calculate pagination parameters
      const skip = calculateSkip(page, limit);
      
      // Fetch grants with pagination
      const grants = await prisma.grant.findMany({
        where: filters,
        skip,
        take: limit,
        include: {
          grantee: {
            select: {
              id: true,
              name: true,
            },
          },
          program: {
            select: {
              id: true,
              name: true,
            },
          },
          transactions: {
            select: {
              id: true,
              amount: true,
              type: true,
              date: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      
      // Process grants to calculate repaid amount and next payment due
      const grantsWithNextPayment = grants.map(grant => {
        // Calculate total repaid amount
        const repaidAmount = grant.transactions
          .filter(tx => tx.type === 'REPAYMENT')
          .reduce((sum, tx) => sum + tx.amount, 0);
        
        // Get next installment information
        const nextPayment = grant.repaymentSchedule[0];
        
        return {
          ...grant,
          repaid: repaidAmount,
          nextPaymentDue: nextPayment?.dueDate || null,
          nextPaymentAmount: nextPayment?.expectedAmount || null
        };
      });
      
      // Get total count for pagination
      const total = await prisma.grant.count({ where: filters });
      
      // Use standardized pagination response format
      return NextResponse.json(
        createPaginatedResponse(grantsWithNextPayment, total, page, limit)
      );
    } catch (error) {
      console.error("API error:", error);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
  });
}

// POST - Create a new grant
export async function POST(request: NextRequest) {
  return withApiRateLimit(async (req: NextRequest) => {
    try {
      // Check authentication
      const session = await getServerSession(authOptions);
      if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      
      // Validate request body
      const [isValid, validatedData, validationError] = await validateBody(request, grantCreateSchema);
      
      if (!isValid) {
        // Return validation error if body is invalid
        if (validationError) {
          return createValidationErrorResponse(validationError);
        }
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
      }
      
      // Extract validated data with null checks
      if (!validatedData) {
        return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
      }
      
      const { 
        granteeId, 
        programId, 
        approvedAmount = 0, 
        disbursedAmount = 0, 
        status = 'PENDING_APPROVAL',
        startDate,
        endDate,
        description,
        grantIdentifier 
      } = validatedData;
      
      // Generate grant identifier if not provided
      let finalGrantIdentifier = grantIdentifier;
      if (!finalGrantIdentifier) {
        const grantCount = await prisma.grant.count();
        finalGrantIdentifier = `GRT-${new Date().getFullYear()}-${(grantCount + 1).toString().padStart(4, '0')}`;
      }
      
      // Create the grant
      const grant = await prisma.grant.create({
        data: {
          grantIdentifier: finalGrantIdentifier,
          approvedAmount,
          disbursedAmount,
          remainingAmount: approvedAmount - disbursedAmount,
          status,
          startDate,
          endDate,
          description,
          grantee: {
            connect: { id: granteeId }
          },
          program: {
            connect: { id: programId }
          }
        },
        include: {
          grantee: {
            select: {
              id: true,
              name: true,
              contactEmail: true
            }
          },
          program: true
        }
      });
      
      // Return the newly created grant
      return NextResponse.json({
        id: grant.id,
        grantIdentifier: grant.grantIdentifier,
        approvedAmount: grant.approvedAmount,
        disbursedAmount: grant.disbursedAmount,
        remainingAmount: grant.remainingAmount,
        status: grant.status,
        startDate: grant.startDate,
        endDate: grant.endDate,
        description: grant.description,
        createdAt: grant.createdAt,
        updatedAt: grant.updatedAt,
        grantee: {
          id: (grant as any).grantee?.id || '',
          name: (grant as any).grantee?.name || '',
          email: (grant as any).grantee?.contactEmail || ''
        },
        program: {
          id: grant.program?.id || '',
          name: grant.program?.name || ''
        }
      }, { status: 201 });
    } catch (error) {
      console.error('Error creating grant:', error);
      return NextResponse.json({ error: 'Failed to create grant' }, { status: 500 });
    }
  });
}
