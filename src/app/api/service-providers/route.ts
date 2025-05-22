import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { ServiceProvider } from '@/types/service-provider';
import { z } from 'zod';
import { withApiRateLimit } from '@/utils/apiRateLimit';
import { validateQuery, validateBody, createValidationErrorResponse } from '@/utils/validation';
import { paginationQuerySchema, calculateSkip, createPaginatedResponse } from '@/utils/pagination';

// Schema for service provider query parameters, extending the pagination schema
const serviceProviderQuerySchema = paginationQuerySchema.extend({
  category: z.string().optional(),
  search: z.string().optional(),
});

// GET /api/service-providers - List all service providers with optional filtering
export const GET = withApiRateLimit(async (request: NextRequest) => {
  try {
    // Validate query parameters
    const [isValid, queryParams, validationError] = validateQuery(request, serviceProviderQuerySchema);
    
    if (!isValid) {
      // Return validation error if query parameters are invalid
      if (validationError) {
        return createValidationErrorResponse(validationError);
      }
      return NextResponse.json({ error: 'Invalid query parameters' }, { status: 400 });
    }

    // Extract validated parameters
    const {
      category = '',
      search = '',
      page = 1,
      limit = 10
    } = queryParams || {};
    
    // Calculate pagination using the standardized utility
    const skip = calculateSkip(page, limit);

    // Build filter criteria
    const where: any = {};
    
    if (category) {
      where.category = category;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { contactPerson: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get total count for pagination
    const total = await prisma.serviceProvider.count({ where });
    
    // Get paginated service providers
    const serviceProviders = await prisma.serviceProvider.findMany({
      where,
      take: limit,
      skip,
      orderBy: { name: 'asc' },
      include: {
        programs: {
          include: {
            program: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            grants: true,
          },
        },
      },
    });

    // Transform the data to match our TypeScript interface
    const formattedServiceProviders = serviceProviders.map(sp => ({
      ...sp,
      programs: sp.programs.map(p => ({
        id: p.program.id,
        name: p.program.name,
      })),
      activeEngagements: sp._count.grants,
      _count: undefined,
    }));

    // Return standardized paginated response
    return NextResponse.json(
      createPaginatedResponse(formattedServiceProviders, total, page, limit)
    );
  } catch (error) {
    console.error('Error fetching service providers:', error);
    return NextResponse.json({ error: 'Failed to fetch service providers' }, { status: 500 });
  }
});

// Schema for creating a new service provider
const serviceProviderCreateSchema = z.object({
  name: z.string().min(1, { message: "Service provider name is required" }),
  contactPerson: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  address: z.string().optional(),
  category: z.string().optional(),
  services: z.string().optional(),
  expertise: z.string().optional(),
  ratePerDay: z.number().nonnegative().optional(),
  profileSummary: z.string().optional(),
  website: z.string().url().optional().nullable(),
  programIds: z.array(z.string()).optional()
});

// POST /api/service-providers - Create a new service provider
export const POST = withApiRateLimit(async (request: NextRequest) => {
  try {
    // Validate request body
    const [isValid, validatedData, validationError] = await validateBody(request, serviceProviderCreateSchema);
    
    if (!isValid) {
      // Return validation error if body is invalid
      if (validationError) {
        return createValidationErrorResponse(validationError);
      }
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
    
    if (!validatedData) {
      return NextResponse.json({ error: 'Missing required data' }, { status: 400 });
    }

    // Extract validated fields
    const { 
      name,
      contactPerson,
      email,
      phone,
      location,
      address,
      category,
      services,
      expertise,
      ratePerDay,
      profileSummary,
      website,
      programIds = []
    } = validatedData;
    
    // Create the service provider
    const serviceProvider = await prisma.serviceProvider.create({
      data: {
        name,
        contactPerson: contactPerson || null,
        email: email || null,
        phone: phone || null,
        location: location || null,
        address: address || null,
        category: category || null,
        services: services || '',
        expertise: expertise || '',
        ratePerDay: ratePerDay || null,
        profileSummary: profileSummary || null,
        website: website || null,
        programs: programIds.length > 0 ? {
          create: programIds.map((programId: string) => ({
            program: { connect: { id: programId } }
          }))
        } : undefined
      }
    });

    return NextResponse.json(serviceProvider, { status: 201 });
  } catch (error) {
    console.error('Error creating service provider:', error);
    return NextResponse.json({ error: 'Failed to create service provider' }, { status: 500 });
  }
});
