import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { z } from 'zod';
import { withApiRateLimit } from '@/utils/apiRateLimit';
import { validateQuery, validateBody, createValidationErrorResponse } from '@/utils/validation';
import { paginationQuerySchema, calculateSkip, createPaginatedResponse } from '@/utils/pagination';

// Schema for grant query parameters, extending the pagination schema
const grantQuerySchema = paginationQuerySchema.extend({
  search: z.string().optional(),
  status: z.string().optional(),
  programId: z.string().optional(),
  granteeId: z.string().optional(),
});

// GET - Retrieve all grants with pagination and filtering
export const GET = withApiRateLimit(async (request: NextRequest) => {
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
      limit = 10
    } = queryParams || {};
    
    const skip = calculateSkip(page, limit);
    
    // Build filters
    const filters: any = {};
    
    if (search) {
      filters.OR = [
        { grantIdentifier: { contains: search, mode: 'insensitive' } },
        { grantee: { name: { contains: search, mode: 'insensitive' } } },
        { program: { name: { contains: search, mode: 'insensitive' } } }
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
    
    // Execute query with pagination
    const grants = await prisma.grant.findMany({
        where: filters,
        include: {
          grantee: {
            select: {
              id: true,
              name: true,
              sector: true,
              village: true,
              district: true,
              state: true
            }
          },
          program: {
            select: {
              id: true,
              name: true
            }
          },
          repaymentSchedule: {
            take: 1,
            where: {
              status: { in: ['PENDING', 'OVERDUE'] }
            },
            orderBy: {
              dueDate: 'asc'
            }
          }
        },
        orderBy: [
          { status: 'asc' },
          { updatedAt: 'desc' }
        ],
        take: limit,
        skip: skip
      });
    
    // Process data to include next payment information
    const grantsWithNextPayment = grants.map(grant => {
      // Calculate total repaid amount
      const repaidAmount = 0; // In a real implementation, sum repayments
      
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
}

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

// POST - Create a new grant
export const POST = withApiRateLimit(async (request: NextRequest) => {
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
        startDate: startDate || new Date(),
        endDate: endDate || new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        status: status as any, // Cast to any to handle enum type
        description: description || '',
        programId,
        granteeId,
        serviceProviderId: null
      },
      include: {
        grantee: true,
        program: true
      }
    });
    
    // Create repayment schedule if provided in the request
    // Note: This is handling a potential extension to the schema where repaymentSchedule could be added
    const repaymentSchedule = (validatedData as any).repaymentSchedule;
    if (repaymentSchedule && Array.isArray(repaymentSchedule)) {
      const schedule = repaymentSchedule.map((item: any) => ({
        dueDate: new Date(item.dueDate),
        expectedAmount: item.amount,
        status: 'PENDING',
        grantId: grant.id
      }));
      
      if (schedule.length > 0) {
        await prisma.repaymentInstallment.createMany({
          data: schedule
        });
      }
    }
    
    // Return the created grant with data from the include query
    return NextResponse.json({
      message: 'Grant created successfully',
      grant: {
        id: grant.id,
        grantIdentifier: grant.grantIdentifier,
        amount: grant.amount, // Using the field that exists in the model
        status: grant.status,
        grantee: {
          id: (grant as any).grantee?.id || '',
          name: (grant as any).grantee?.name || ''
        },
        program: {
          id: (grant as any).program?.id || '',
          name: (grant as any).program?.name || ''
        }
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating grant:', error);
    return NextResponse.json({ error: 'Failed to create grant' }, { status: 500 });
  }
});
