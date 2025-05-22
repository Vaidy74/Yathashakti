import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { 
  TransactionCategory, 
  TransactionCreateInput, 
  TransactionStatus, 
  TransactionType 
} from '@/types/transaction';
import { validateTransactionCreate, formatValidationErrors } from '@/utils/validations/transactionValidation';

// GET /api/transactions - Get all transactions with filtering and pagination
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract filter parameters
    const type = searchParams.get('type') as TransactionType | null;
    const category = searchParams.get('category') as TransactionCategory | null;
    const status = searchParams.get('status') as TransactionStatus | null;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'date';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

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

    // Calculate pagination
    const skip = (page - 1) * limit;

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

    // Return transactions with pagination metadata
    return NextResponse.json({
      data: transactions,
      meta: {
        totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

// POST /api/transactions - Create a new transaction
export async function POST(request: Request) {
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
}
