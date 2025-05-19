import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// GET - Retrieve repayments for a grant
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { id } = params;
    
    // Check if grant exists
    const grant = await prisma.grant.findUnique({
      where: { id }
    });
    
    if (!grant) {
      return NextResponse.json({ error: "Grant not found" }, { status: 404 });
    }
    
    // Get repayments for this grant
    const repayments = await prisma.repayment.findMany({
      where: { grantId: id },
      orderBy: { date: 'desc' },
      include: {
        ledgerEntries: true
      }
    });
    
    return NextResponse.json(repayments);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST - Record a new repayment
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { id } = params;
    const data = await request.json();
    
    // Validate required fields
    if (!data.amount || !data.date || !data.method) {
      return NextResponse.json({ 
        error: "Missing required fields: amount, date, method" 
      }, { status: 400 });
    }
    
    // Check if grant exists
    const grant = await prisma.grant.findUnique({
      where: { id },
      include: {
        repaymentSchedule: {
          where: {
            status: { in: ['PENDING', 'PARTIALLY_PAID', 'OVERDUE'] }
          },
          orderBy: { dueDate: 'asc' }
        },
        repaymentHistory: true,
        grantee: true
      }
    });
    
    if (!grant) {
      return NextResponse.json({ error: "Grant not found" }, { status: 404 });
    }
    
    // Calculate current total repaid
    const currentTotalRepaid = grant.repaymentHistory.reduce(
      (sum, repayment) => sum + repayment.amount,
      0
    );
    
    // Check if amount exceeds remaining amount
    const remainingAmount = grant.amount - currentTotalRepaid;
    if (data.amount > remainingAmount) {
      return NextResponse.json({ 
        error: `Repayment amount (${data.amount}) exceeds remaining amount (${remainingAmount})` 
      }, { status: 400 });
    }
    
    // Start a transaction to ensure all related updates are atomic
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the repayment record
      const repayment = await tx.repayment.create({
        data: {
          amount: data.amount,
          date: new Date(data.date),
          method: data.method,
          notes: data.notes || null,
          grantId: id,
        }
      });
      
      // 2. Update installment status based on this payment
      if (grant.repaymentSchedule.length > 0) {
        let remainingPayment = data.amount;
        
        // Allocate payment to installments in order
        for (const installment of grant.repaymentSchedule) {
          if (remainingPayment <= 0) break;
          
          const installmentDue = installment.expectedAmount - (installment.paidAmount || 0);
          const amountToAllocate = Math.min(remainingPayment, installmentDue);
          
          // Update the installment
          if (amountToAllocate > 0) {
            const newPaidAmount = (installment.paidAmount || 0) + amountToAllocate;
            const newStatus = 
              newPaidAmount >= installment.expectedAmount
                ? 'PAID'
                : 'PARTIALLY_PAID';
                
            await tx.repaymentInstallment.update({
              where: { id: installment.id },
              data: {
                paidAmount: newPaidAmount,
                status: newStatus,
                paymentDate: newStatus === 'PAID' ? new Date() : null
              }
            });
            
            remainingPayment -= amountToAllocate;
          }
        }
      }
      
      // 3. Update grant status if fully repaid
      const newTotalRepaid = currentTotalRepaid + data.amount;
      if (newTotalRepaid >= grant.amount) {
        await tx.grant.update({
          where: { id },
          data: { status: 'COMPLETED' }
        });
      } else if (grant.status === 'PENDING' && newTotalRepaid > 0) {
        await tx.grant.update({
          where: { id },
          data: { status: 'CURRENT' }
        });
      }
      
      // 4. Create ledger entry if ledger system is being used
      const ledgerEntry = await tx.ledgerEntry.create({
        data: {
          amount: data.amount,
          type: 'CREDIT',
          description: `Repayment for grant ${grant.grantIdentifier} from ${grant.grantee.name}`,
          date: new Date(data.date),
          repaymentId: repayment.id,
          grantId: id
        }
      });
      
      return { repayment, ledgerEntry };
    });
    
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
