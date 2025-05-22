import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { TransactionCategory, TransactionType, TransactionWithRelations } from '@/types/transaction';

// GET /api/transactions/summary - Get summary statistics for transactions
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract filter parameters
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    // Build filter conditions
    const where: any = {};

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

    // Get all transactions based on filter
    const transactions = await prisma.transaction.findMany({
      where,
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
      orderBy: {
        date: 'desc',
      },
    }) as unknown as TransactionWithRelations[];

    // Calculate income and expenses
    const income = transactions
      .filter((tx: TransactionWithRelations) => tx.type === TransactionType.INCOME)
      .reduce((sum: number, tx: TransactionWithRelations) => sum + tx.amount, 0);
    
    const expenses = transactions
      .filter((tx: TransactionWithRelations) => tx.type === TransactionType.EXPENSE)
      .reduce((sum: number, tx: TransactionWithRelations) => sum + tx.amount, 0);

    // Calculate category breakdown
    const categorySummary: Record<string, { income: number; expenses: number }> = {};
    
    // Initialize all categories
    Object.values(TransactionCategory).forEach(category => {
      categorySummary[category] = {
        income: 0,
        expenses: 0
      };
    });
    
    // Add transaction amounts to appropriate categories
    transactions.forEach((tx: TransactionWithRelations) => {
      if (tx.type === TransactionType.INCOME) {
        categorySummary[tx.category].income += tx.amount;
      } else {
        categorySummary[tx.category].expenses += tx.amount;
      }
    });

    // Get recent transactions (last 5)
    const recentTransactions = transactions.slice(0, 5);

    // Return summary data
    return NextResponse.json({
      income,
      expenses,
      balance: income - expenses,
      categorySummary,
      recentTransactions
    });
  } catch (error) {
    console.error('Error generating transaction summary:', error);
    return NextResponse.json(
      { error: 'Failed to generate transaction summary' },
      { status: 500 }
    );
  }
}
