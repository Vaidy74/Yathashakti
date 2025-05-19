import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// GET /api/grantees - Get all grantees
export async function GET(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const programId = searchParams.get('programId');
    const sector = searchParams.get('sector');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build filter conditions
    const whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { village: { contains: search, mode: 'insensitive' } },
        { district: { contains: search, mode: 'insensitive' } },
        { state: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (programId) {
      whereClause.grants = {
        some: {
          programId
        }
      };
    }

    if (sector) {
      whereClause.sector = sector;
    }

    // Get grantees with pagination and filtering
    const grantees = await prisma.grantee.findMany({
      where: whereClause,
      include: {
        grants: {
          include: {
            program: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        documents: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: offset,
      take: limit
    });

    // Count total for pagination
    const total = await prisma.grantee.count({
      where: whereClause
    });

    // Transform data to include program names
    const formattedGrantees = grantees.map(grantee => {
      const programs = [...new Set(grantee.grants.map(grant => grant.program.name))];
      
      return {
        id: grantee.id,
        name: grantee.name,
        sector: grantee.sector,
        location: `${grantee.village || ''}, ${grantee.district || ''}, ${grantee.state || ''}`.replace(/^, |, $/g, ''),
        programs,
        phone: grantee.phone,
        email: grantee.email || '',
        createdAt: grantee.createdAt
      };
    });

    return NextResponse.json({
      grantees: formattedGrantees,
      pagination: {
        total,
        offset,
        limit
      }
    });
    
  } catch (error) {
    console.error('Error fetching grantees:', error);
    return NextResponse.json({ error: 'Failed to fetch grantees' }, { status: 500 });
  }
}

// POST /api/grantees - Create a new grantee
export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get request body
    const body = await request.json();
    
    // Validate required fields
    const { 
      name, gender, phone, address, village, district, state, pincode,
      dateOfBirth, idType, idNumber, sector, programId, activities, notes 
    } = body;

    if (!name || !phone || !village || !district || !state) {
      return NextResponse.json({ 
        error: 'Missing required fields', 
        requiredFields: ['name', 'phone', 'village', 'district', 'state']
      }, { status: 400 });
    }

    // Create new grantee
    const grantee = await prisma.grantee.create({
      data: {
        name,
        gender,
        phone,
        email: body.email || null,
        address,
        village,
        district,
        state,
        pincode,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        idType,
        idNumber,
        sector,
        activities,
        notes
      }
    });

    // If programId is provided, create an association with the program
    if (programId) {
      await prisma.grant.create({
        data: {
          granteeId: grantee.id,
          programId,
          status: 'PENDING_APPROVAL',
        }
      });
    }

    // Log the creation
    await prisma.auditLog.create({
      data: {
        entityType: 'Grantee',
        entityId: grantee.id,
        action: 'create',
        newData: body,
        userId: session.user.id
      }
    });

    return NextResponse.json({
      message: 'Grantee created successfully',
      grantee: {
        id: grantee.id,
        name: grantee.name
      }
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating grantee:', error);
    return NextResponse.json({ error: 'Failed to create grantee' }, { status: 500 });
  }
}
