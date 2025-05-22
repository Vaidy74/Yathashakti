import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

type GrantStatus = 'ACTIVE' | 'PENDING' | 'COMPLETED' | 'CANCELLED';
type ProgramStatus = 'PLANNING' | 'LIVE' | 'ON_HOLD' | 'CLOSED';

// GET /api/service-providers/[id]/performance - Get performance metrics for a service provider
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const serviceProviderId = params.id;

    // Check if service provider exists
    const serviceProvider = await prisma.serviceProvider.findUnique({
      where: {
        id: serviceProviderId,
      },
    });

    if (!serviceProvider) {
      return NextResponse.json(
        { error: 'Service provider not found' },
        { status: 404 }
      );
    }

    // Get grants associated with the service provider
    const grants = await prisma.grant.findMany({
      where: {
        serviceProviderId,
      },
      include: {
        repaymentHistory: true,
        repaymentSchedule: true,
        program: {
          select: {
            id: true,
            name: true,
            startDate: true,
            endDate: true,
            status: true,
          },
        },
      },
    });

    // Get communications related to this service provider's grants
    const communications = await prisma.communication.findMany({
      where: {
        grant: {
          serviceProviderId,
        },
      },
      orderBy: {
        date: 'desc',
      },
      take: 10,
    });

    // Calculate metrics
    const totalGrantAmount = grants.reduce((sum, grant) => sum + grant.amount, 0);
    const activeGrants = grants.filter(grant => grant.status as GrantStatus === 'ACTIVE').length;
    const completedGrants = grants.filter(grant => grant.status as GrantStatus === 'COMPLETED').length;
    
    // Calculate repayment performance
    let totalRepaymentExpected = 0;
    let totalRepaymentReceived = 0;
    let overdueInstallments = 0;
    
    grants.forEach(grant => {
      // Sum up completed repayments
      const repaidAmount = grant.repaymentHistory.reduce((sum, repayment) => sum + repayment.amount, 0);
      totalRepaymentReceived += repaidAmount;
      
      // Calculate expected repayments to date
      const today = new Date();
      const dueInstallments = grant.repaymentSchedule.filter(
        installment => new Date(installment.dueDate) <= today
      );
      
      const expectedAmount = dueInstallments.reduce((sum, installment) => sum + installment.expectedAmount, 0);
      totalRepaymentExpected += expectedAmount;
      
      // Count overdue installments
      overdueInstallments += grant.repaymentSchedule.filter(
        installment => 
          new Date(installment.dueDate) <= today && 
          installment.status === 'PENDING'
      ).length;
    });
    
    // Calculate repayment rate
    const repaymentRate = totalRepaymentExpected > 0 
      ? (totalRepaymentReceived / totalRepaymentExpected) * 100 
      : 100;

    // Calculate time-based metrics
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentGrants = grants.filter(
      grant => new Date(grant.createdAt) >= thirtyDaysAgo
    ).length;
    
    const recentCommunications = communications.filter(
      comm => new Date(comm.date) >= thirtyDaysAgo
    ).length;

    // Calculate program participation metrics
    const uniquePrograms = new Set(grants.map(grant => grant.program.id));
    const activeProgramsCount = new Set(
      grants
        .filter(grant => grant.program.status as ProgramStatus === 'LIVE')
        .map(grant => grant.program.id)
    ).size;

    // Organize by program for program-specific performance
    const programPerformance: Record<string, {
      programId: string;
      programName: string;
      grantsCount: number;
      totalAmount: number;
      activeGrants: number;
      completedGrants: number;
    }> = {};
    grants.forEach(grant => {
      const programId = grant.program.id;
      if (!programPerformance[programId]) {
        programPerformance[programId] = {
          programId,
          programName: grant.program.name,
          grantsCount: 0,
          totalAmount: 0,
          activeGrants: 0,
          completedGrants: 0,
        };
      }
      
      programPerformance[programId].grantsCount++;
      programPerformance[programId].totalAmount += grant.amount;
      
      if (grant.status as GrantStatus === 'ACTIVE') {
        programPerformance[programId].activeGrants++;
      } else if (grant.status as GrantStatus === 'COMPLETED') {
        programPerformance[programId].completedGrants++;
      }
    });

    const responseData = {
      overview: {
        totalGrants: grants.length,
        activeGrants,
        completedGrants,
        totalGrantAmount,
        uniqueProgramsCount: uniquePrograms.size,
        activeProgramsCount,
      },
      repaymentPerformance: {
        totalRepaymentExpected,
        totalRepaymentReceived,
        repaymentRate,
        overdueInstallments,
      },
      recentActivity: {
        recentGrants,
        recentCommunications,
        lastActive: communications.length > 0 ? communications[0].date : null,
      },
      programPerformance: Object.values(programPerformance),
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error fetching service provider performance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch performance metrics' },
      { status: 500 }
    );
  }
}
