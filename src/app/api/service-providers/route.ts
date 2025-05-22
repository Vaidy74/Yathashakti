import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { ServiceProvider } from '@/types/service-provider';

// GET /api/service-providers - List all service providers with optional filtering
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

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

    return NextResponse.json({
      serviceProviders: formattedServiceProviders,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    console.error('Error fetching service providers:', error);
    return NextResponse.json({ error: 'Failed to fetch service providers' }, { status: 500 });
  }
}

// POST /api/service-providers - Create a new service provider
export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.name || !data.category || !data.type) {
      return NextResponse.json(
        { error: 'Name, category, and type are required fields' },
        { status: 400 }
      );
    }

    // Create service provider
    const serviceProvider = await prisma.serviceProvider.create({
      data: {
        name: data.name,
        category: data.category,
        type: data.type,
        contactPerson: data.contactPerson || null,
        contactNumber: data.contactNumber || null,
        email: data.email || null,
        phone: data.contactNumber || null, // Legacy field, use contactNumber
        location: data.location || null,
        description: data.description || null,
        website: data.website || null,
        services: data.services || [],
        ratePerDay: data.ratePerDay ? parseFloat(data.ratePerDay) : null,
        registeredOn: data.registeredOn ? new Date(data.registeredOn) : new Date(),
      },
    });

    return NextResponse.json(serviceProvider, { status: 201 });
  } catch (error) {
    console.error('Error creating service provider:', error);
    return NextResponse.json({ error: 'Failed to create service provider' }, { status: 500 });
  }
}
