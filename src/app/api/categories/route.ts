import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { TransactionType } from '@/types/transaction';

type CategoryWithType = {
  category: string;
  type: string;
};

// GET /api/categories - Get all transaction categories
export async function GET(request: NextRequest) {
  try {
    // Fetch all unique categories from transactions
    const incomeCategories = await prisma.$queryRaw<CategoryWithType[]>`
      SELECT DISTINCT category, 'INCOME' as type 
      FROM "Transaction" 
      WHERE type = 'INCOME'
    `;

    const expenseCategories = await prisma.$queryRaw<CategoryWithType[]>`
      SELECT DISTINCT category, 'EXPENSE' as type 
      FROM "Transaction" 
      WHERE type = 'EXPENSE'
    `;
    
    // Format the results for the API response
    const formattedIncomeCategories = incomeCategories.map(item => ({
      name: item.category,
      type: TransactionType.INCOME
    }));

    const formattedExpenseCategories = expenseCategories.map(item => ({
      name: item.category,
      type: TransactionType.EXPENSE
    }));

    // Combine categories
    const allCategories = [...formattedIncomeCategories, ...formattedExpenseCategories];

    return NextResponse.json(allCategories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// POST /api/categories - Create a new category
export async function POST(request: NextRequest) {
  try {
    const { name, type } = await request.json();

    if (!name || !type) {
      return NextResponse.json(
        { error: 'Category name and type are required' },
        { status: 400 }
      );
    }

    // We don't actually store categories separately in the database
    // They are derived from the transactions
    // So we'll create a dummy transaction with the new category using raw SQL
    const currentDate = new Date().toISOString();
    await prisma.$executeRaw`
      INSERT INTO "Transaction" (
        "date", 
        "description", 
        "type", 
        "category", 
        "amount", 
        "paymentMethod", 
        "reference", 
        "status", 
        "notes"
      ) VALUES (
        ${currentDate}::timestamp, 
        ${'Category initialization: ' + name}, 
        ${type}, 
        ${name}, 
        0, 
        'OTHER', 
        'SYSTEM', 
        'COMPLETED', 
        'This transaction was created to initialize a new category'
      )
    `;

    return NextResponse.json({
      name,
      type
    });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
