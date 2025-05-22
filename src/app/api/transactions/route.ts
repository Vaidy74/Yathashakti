import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { 
  TransactionCategory, 
  TransactionCreateInput, 
  TransactionStatus, 
  TransactionType 
} from '@/types/transaction';
import { validateTransactionCreate, formatValidationErrors } from '@/utils/validations/transactionValidation';
import { z } from 'zod';
import { withApiRateLimit } from '@/utils/apiRateLimit';
import { validateQuery, validateBody, createValidationErrorResponse } from '@/utils/validation';
import { paginationQuerySchema, calculateSkip, createPaginatedResponse } from '@/utils/pagination';

// Schema for transaction query parameters, extending the pagination schema
const transactionQuerySchema = paginationQuerySchema.extend({
  type: z.string().optional(),
  category: z.string().optional(),
  status: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.string().optional()
});

// GET /api/transactions - Get all transactions with filtering and pagination
export const GET = withApiRateLimit(async (request: NextRequest) => {
  try {
    // Validate query parameters
    const [isValid, queryParams, validationError] = validateQuery(request, transactionQuerySchema);
    
    if (!isValid) {
      // Return validation error if query parameters are invalid
      if (validationError) {
        return createValidationErrorResponse(validationError);
      }
      return NextResponse.json({ error: 'Invalid query parameters' }, { status: 400 });
    }

    // Extract validated parameters
    const {
      type = null,
      category = null,
      status = null,
      startDate = null,
      endDate = null,
      search = null,
      page = 1,
      limit = 10,
      sortBy = 'date',
      sortOrder = 'desc'
    } = queryParams || {};

    // Build filter conditions
    const where: any = {};

    if (type) {
      where.type = type;
    }

    if (category) {
      where.category = category;
    }

    if (status) {
      where.status = status;
    }

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    } else if (startDate) {
      where.date = {
        gte: new Date(startDate),
      };
    } else if (endDate) {
      where.date = {
        lte: new Date(endDate),
      };
    }

    if (search) {
      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { reference: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Calculate pagination using the standardized utility
    const skip = calculateSkip(page, limit);

    // Get total count for pagination
    const totalCount = await prisma.transaction.count({ where });

    // Get transactions with pagination and sorting
    const transactions = await prisma.transaction.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: {
        grant: {
          select: {
            id: true,
            grantIdentifier: true,
            grantee: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        donor: {
          select: {
            id: true,
            name: true,
          },
        },
        serviceProvider: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Return standardized paginated response
    return NextResponse.json(
      createPaginatedResponse(transactions, totalCount, page, limit)
    );
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

// POST /api/transactions - Create a new transaction
export const POST = withApiRateLimit(async (request: NextRequest) => {
  try {
    const data: TransactionCreateInput = await request.json();

    // Validate transaction data
    const validationErrors = validateTransactionCreate(data);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { 
          error: 'Validation error', 
          details: validationErrors,
          message: formatValidationErrors(validationErrors)
        },
        { status: 400 }
      );
    }

    // Create new transaction
    const transaction = await prisma.transaction.create({
      data: {
        date: new Date(data.date),
        description: data.description,
        type: data.type,
        category: data.category,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        reference: data.reference,
        status: data.status || 'PENDING',
        notes: data.notes,
        grantId: data.grantId,
        donorId: data.donorId,
        serviceProviderId: data.serviceProviderId,
      },
      include: {
        grant: {
          select: {
            id: true,
            grantIdentifier: true,
            grantee: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        donor: {
          select: {
            id: true,
            name: true,
          },
        },
        serviceProvider: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
});
