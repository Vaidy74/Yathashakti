import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { TransactionUpdateInput } from '@/types/transaction';
import { validateTransactionUpdate, formatValidationErrors } from '@/utils/validations/transactionValidation';

// GET /api/transactions/[id] - Get a single transaction by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    const transaction = await prisma.transaction.findUnique({
      where: { id },
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

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(transaction);
  } catch (error) {
    console.error('Error fetching transaction:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transaction' },
      { status: 500 }
    );
  }
}

// PATCH /api/transactions/[id] - Update a transaction
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const data: TransactionUpdateInput = await request.json();
    
    // Validate transaction data
    const validationErrors = validateTransactionUpdate(data);
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

    // Check if transaction exists
    const existingTransaction = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!existingTransaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Process date if provided
    const updateData: any = { ...data };
    if (data.date) {
      updateData.date = new Date(data.date);
    }

    // Update transaction
    const updatedTransaction = await prisma.transaction.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json(updatedTransaction);
  } catch (error) {
    console.error('Error updating transaction:', error);
    return NextResponse.json(
      { error: 'Failed to update transaction' },
      { status: 500 }
    );
  }
}

// DELETE /api/transactions/[id] - Delete a transaction
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // Check if transaction exists
    const existingTransaction = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!existingTransaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Delete transaction
    await prisma.transaction.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json(
      { error: 'Failed to delete transaction' },
      { status: 500 }
    );
  }
}
