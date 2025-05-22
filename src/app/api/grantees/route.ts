import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import { withApiRateLimit } from '@/utils/apiRateLimit';
import { validateQuery, validateBody, createValidationErrorResponse } from '@/utils/validation';
import { paginationQuerySchema, calculateSkip, createPaginatedResponse } from '@/utils/pagination';

// Schema for grantee query parameters, extending the pagination schema
const granteeQuerySchema = paginationQuerySchema.extend({
  search: z.string().optional(),
  programId: z.string().optional(),
  sector: z.string().optional(),
});

// GET /api/grantees - Get all grantees with pagination and filters
export const GET = withApiRateLimit(async (request: NextRequest) => {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate query parameters
    const [isValid, queryParams, validationError] = validateQuery(request, granteeQuerySchema);
    
    if (!isValid) {
      // Return validation error if query parameters are invalid
      if (validationError) {
        return createValidationErrorResponse(validationError);
      }
      return NextResponse.json({ error: 'Invalid query parameters' }, { status: 400 });
    }

    // Extract validated parameters
    const {
      search = '',
      programId,
      sector,
      page = 1,
      limit = 10
    } = queryParams || {};
    
    const skip = calculateSkip(page, limit);

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
      skip,
      take: limit
    });

    // Count total for pagination
    const total = await prisma.grantee.count({
      where: whereClause
    });

    // Transform data to include program names
    const formattedGrantees = grantees.map(grantee => {
      // Use Array.from to avoid issues with Set iteration
      const programNames = grantee.grants.map(grant => grant.program.name);
      const programs = Array.from(new Set(programNames));
      
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

    // Use standardized pagination response format
    return NextResponse.json(
      createPaginatedResponse(formattedGrantees, total, page, limit)
    );
    
  } catch (error) {
    console.error('Error fetching grantees:', error);
    return NextResponse.json({ error: 'Failed to fetch grantees' }, { status: 500 });
  }
});

// Schema for creating a new grantee
const granteeCreateSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters long" }),
  gender: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().nullable(),
  address: z.string().optional(),
  village: z.string().optional(),
  district: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  dateOfBirth: z.string().optional().nullable(),
  idType: z.string().optional(),
  idNumber: z.string().optional(),
  sector: z.string().optional(),
  programId: z.string().optional(),
  activities: z.string().optional(),
  notes: z.string().optional()
});

// POST /api/grantees - Create a new grantee
export const POST = withApiRateLimit(async (request: NextRequest) => {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate request body
    const [isValid, validatedData, validationError] = await validateBody(request, granteeCreateSchema);
    
    if (!isValid) {
      // Return validation error if body is invalid
      if (validationError) {
        return createValidationErrorResponse(validationError);
      }
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
    
    const { 
      name, gender, phone, address, village, district, state, pincode,
      dateOfBirth, idType, idNumber, sector, programId, activities, notes 
    } = validatedData || {};

    // Additional validation checks if needed
    if (!name) {
      return NextResponse.json({ 
        error: 'Missing required fields', 
        details: 'Name is required' 
      }, { status: 400 });
    }

    // Create the grantee in the database
    const grantee = await prisma.grantee.create({
      data: {
        name,
        gender: gender as any, // Cast to any to avoid type issues
        phone: phone || '',
        email: validatedData.email || null,
        address: address || '',
        village: village || '',
        district: district || '',
        state: state || '',
        pincode: pincode || '',
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        idType: idType || '',
        idNumber: idNumber || '',
        sector: sector || '',
        activities: activities || '',
        notes: notes || ''
      }
    });

    // If programId is provided, create a grant linking the grantee to the program
    if (programId) {
      await prisma.grant.create({
        data: {
          granteeId: grantee.id,
          programId,
          status: 'PENDING_APPROVAL' as any, // Cast to any to avoid type issues
          approvedAmount: 0,
          disbursedAmount: 0,
          remainingAmount: 0,
          startDate: new Date(),
          endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // Default 1 year
          description: `Initial grant for ${grantee.name}`,
          createdById: session?.user?.id || 'system'
        }
      });
    }

    // Log the creation
    await prisma.auditLog.create({
      data: {
        entityType: 'Grantee',
        entityId: grantee.id,
        action: 'create',
        newData: validatedData as any,
        userId: session?.user?.id || 'system'
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
});
