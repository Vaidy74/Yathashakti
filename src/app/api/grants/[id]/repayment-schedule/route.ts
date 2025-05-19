import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { InstallmentStatus } from '@/types/grant';

// GET /api/grants/[id]/repayment-schedule
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const grantId = params.id;

    // Check if grant exists
    const grant = await prisma.grant.findUnique({
      where: { id: grantId },
    });

    if (!grant) {
      return NextResponse.json({ error: 'Grant not found' }, { status: 404 });
    }

    // Get all repayment installments for this grant
    const installments = await prisma.repaymentInstallment.findMany({
      where: {
        grantId: grantId,
      },
      orderBy: {
        dueDate: 'asc',
      },
    });

    // Update status of installments based on due dates
    const today = new Date();
    const updatedInstallments = installments.map(installment => {
      const dueDate = new Date(installment.dueDate);
      
      // If it's pending and past due date, mark as overdue
      if (installment.status === InstallmentStatus.PENDING && dueDate < today) {
        return {
          ...installment,
          status: InstallmentStatus.OVERDUE
        };
      }
      
      return installment;
    });

    return NextResponse.json({
      installments: updatedInstallments,
      count: updatedInstallments.length
    });
    
  } catch (error) {
    console.error('Error fetching repayment schedule:', error);
    return NextResponse.json(
      { error: 'Failed to fetch repayment schedule' },
      { status: 500 }
    );
  }
}

// POST /api/grants/[id]/repayment-schedule
// Creates a new repayment schedule for a grant
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const grantId = params.id;
    const data = await request.json();
    const { installments } = data;

    // Check if grant exists
    const grant = await prisma.grant.findUnique({
      where: { id: grantId },
    });

    if (!grant) {
      return NextResponse.json({ error: 'Grant not found' }, { status: 404 });
    }

    // Delete existing schedule if any
    await prisma.repaymentInstallment.deleteMany({
      where: {
        grantId: grantId,
      },
    });

    // Create new installments
    if (installments && Array.isArray(installments) && installments.length > 0) {
      const createdInstallments = await prisma.repaymentInstallment.createMany({
        data: installments.map((item: any, index: number) => ({
          grantId,
          dueDate: new Date(item.dueDate),
          expectedAmount: parseFloat(item.amount),
          status: InstallmentStatus.PENDING,
        })),
      });

      return NextResponse.json({
        message: 'Repayment schedule created',
        count: createdInstallments.count
      });
    }

    return NextResponse.json({
      message: 'No installments provided',
      count: 0
    });
    
  } catch (error) {
    console.error('Error creating repayment schedule:', error);
    return NextResponse.json(
      { error: 'Failed to create repayment schedule' },
      { status: 500 }
    );
  }
}
