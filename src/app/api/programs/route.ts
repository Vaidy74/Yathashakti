import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// GET - Retrieve all programs with pagination and filtering
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
    const categoryId = searchParams.get('categoryId') || '';
    
    // Build filters
    const filters: any = {};
    
    if (search) {
      filters.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (status) {
      filters.status = status;
    }
    
    if (categoryId) {
      filters.categoryId = categoryId;
    }
    
    // Get total count for pagination
    const totalCount = await prisma.program.count({
      where: filters
    });
    
    // Get programs
    const programs = await prisma.program.findMany({
      where: filters,
      include: {
        category: true,
        teamMembers: {
          include: {
            user: true
          }
        },
        milestones: true,
        sdgGoals: true,
        grants: true,
        serviceProviders: {
          include: {
            serviceProvider: true
          }
        }
      },
      skip: offset,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Return response
    return NextResponse.json({
      programs,
      pagination: {
        total: totalCount,
        offset,
        limit,
        hasMore: offset + limit < totalCount
      }
    });
    
  } catch (error) {
    console.error('Error fetching programs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch programs' },
      { status: 500 }
    );
  }
}

// POST - Create a new program
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Get request body
    const body = await request.json();
    
    // Create program
    const program = await prisma.program.create({
      data: {
        name: body.name,
        description: body.description,
        startDate: new Date(body.startDate),
        endDate: body.endDate ? new Date(body.endDate) : null,
        budget: parseFloat(body.budget),
        status: body.status,
        category: body.categoryId ? {
          connect: { id: body.categoryId }
        } : undefined,
        teamMembers: {
          create: body.teamMembers?.map((memberId: string) => ({
            user: { connect: { id: memberId } }
          })) || []
        },
        sdgGoals: {
          create: body.sdgGoals?.map((goalId: string) => ({
            sdgGoal: { connect: { id: goalId } }
          })) || []
        }
      }
    });
    
    return NextResponse.json(program);
    
  } catch (error) {
    console.error('Error creating program:', error);
    return NextResponse.json(
      { error: 'Failed to create program' },
      { status: 500 }
    );
  }
}
