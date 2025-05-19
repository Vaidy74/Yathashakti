import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// GET - Retrieve all grants with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0'); 
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const programId = searchParams.get('programId') || '';
    const granteeId = searchParams.get('granteeId') || '';
    
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
    const [grants, total] = await Promise.all([
      prisma.grant.findMany({
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
        skip: offset
      }),
      prisma.grant.count({ where: filters })
    ]);
    
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
    
    return NextResponse.json({
      grants: grantsWithNextPayment,
      total,
      limit,
      offset
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST - Create a new grant
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Get request body
    const data = await request.json();
    
    // Validate required fields
    if (!data.granteeId || !data.programId || !data.amount) {
      return NextResponse.json({ 
        error: "Missing required fields: granteeId, programId, amount" 
      }, { status: 400 });
    }
    
    // Generate grant identifier (e.g., GRT-2025-0001)
    const grantCount = await prisma.grant.count();
    const grantIdentifier = `GRT-${new Date().getFullYear()}-${(grantCount + 1).toString().padStart(4, '0')}`;
    
    // Create the grant
    const grant = await prisma.grant.create({
      data: {
        grantIdentifier,
        amount: data.amount,
        disbursementDate: data.disbursementDate || new Date(),
        status: data.status || 'PENDING',
        repaymentRate: data.repaymentRate || 100,
        notes: data.notes,
        programId: data.programId,
        granteeId: data.granteeId,
        serviceProviderId: data.serviceProviderId
      },
      include: {
        grantee: true,
        program: true
      }
    });
    
    // Create repayment schedule if provided
    if (data.repaymentSchedule && Array.isArray(data.repaymentSchedule)) {
      const schedule = data.repaymentSchedule.map((item: any) => ({
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
    
    return NextResponse.json(grant, { status: 201 });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
