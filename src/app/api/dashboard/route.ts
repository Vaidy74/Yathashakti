import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// GET - Retrieve dashboard statistics and overview data
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Get query parameters for date range filtering
    const searchParams = request.nextUrl.searchParams;
    const dateRange = searchParams.get('dateRange') || 'last30days';
    
    // Calculate date range
    let startDate = new Date();
    const endDate = new Date();
    
    switch (dateRange) {
      case 'today':
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'yesterday':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'last7days':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'thisMonth':
        startDate = new Date();
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'last30days':
      default:
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        break;
    }
    
    // Get total grants count and active grants
    const totalGrants = await prisma.grant.count();
    const activeGrants = await prisma.grant.count({
      where: { status: 'ACTIVE' }
    });
    
    // Get disbursed amount (total of all grant disbursements)
    const disbursements = await prisma.grantDisbursement.aggregate({
      _sum: {
        amount: true
      }
    });
    const disbursedAmount = disbursements._sum.amount || 0;
    
    // Get total active programs
    const activePrograms = await prisma.program.count({
      where: { status: 'ACTIVE' }
    });
    
    // Get total service providers
    const serviceProviders = await prisma.serviceProvider.count();
    
    // Get recent grants (last 5)
    const recentGrants = await prisma.grant.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        grantee: true,
        program: true
      }
    });
    
    // Get grant distribution by status
    const grantsByStatus = await prisma.grant.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    });
    
    // Get grants by program (top 5 programs)
    const grantsByProgram = await prisma.$queryRaw`
      SELECT p.name, COUNT(g.id) as count
      FROM "Program" p
      LEFT JOIN "Grant" g ON p.id = g."programId"
      GROUP BY p.id, p.name
      ORDER BY count DESC
      LIMIT 5
    `;
    
    // Get service providers by category
    const serviceProvidersByCategory = await prisma.serviceProvider.groupBy({
      by: ['category'],
      _count: {
        id: true
      }
    });
    
    // Recent activities (combining recent grants and programs)
    const recentPrograms = await prisma.program.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' }
    });
    
    const recentActivities = [
      ...recentGrants.map(grant => ({
        type: 'grant',
        id: grant.id,
        title: `Grant ${grant.grantIdentifier || 'New'} created`,
        subtitle: `Awarded to ${grant.grantee?.name || 'Unknown'}`,
        date: grant.createdAt,
        amount: grant.amount
      })),
      ...recentPrograms.map(program => ({
        type: 'program',
        id: program.id,
        title: `Program ${program.name} created`,
        subtitle: program.description ? (program.description.substring(0, 50) + '...') : '',
        date: program.createdAt,
        amount: program.budget
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
     .slice(0, 10);
    
    // For empty database detection - if we have no grants and no programs, it's likely a fresh DB
    const isEmpty = totalGrants === 0 && activePrograms === 0;
    
    // Return dashboard data - all zeros if empty database
    return NextResponse.json({
      stats: {
        totalGrants,
        activeGrants,
        activePrograms,
        disbursedAmount,
        serviceProviders
      },
      isEmpty,
      recentActivities
    });
    
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
