import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PATCH /api/categories/[name] - Update a category
export async function PATCH(
  request: NextRequest,
  { params }: { params: { name: string } }
) {
  try {
    const categoryName = decodeURIComponent(params.name);
    const { name: newName, type } = await request.json();

    if (!newName || !type) {
      return NextResponse.json(
        { error: 'New category name and type are required' },
        { status: 400 }
      );
    }

    // Update all transactions with this category using raw SQL
    const updatedResult = await prisma.$executeRaw`
      UPDATE "Transaction"
      SET "category" = ${newName}
      WHERE "category" = ${categoryName} AND "type" = ${type}
    `;

    return NextResponse.json({
      name: newName,
      type,
      updatedCount: updatedResult
    });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

// DELETE /api/categories/[name] - Delete a category
export async function DELETE(
  request: NextRequest,
  { params }: { params: { name: string } }
) {
  try {
    const categoryName = decodeURIComponent(params.name);
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (!type) {
      return NextResponse.json(
        { error: 'Transaction type is required' },
        { status: 400 }
      );
    }

    // Deleting a category means updating all transactions with this category
    // to a default "Uncategorized" category using raw SQL
    const updatedResult = await prisma.$executeRaw`
      UPDATE "Transaction"
      SET "category" = 'Uncategorized'
      WHERE "category" = ${categoryName} AND "type" = ${type}
    `;

    return NextResponse.json({
      success: true,
      updatedCount: updatedResult
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}
