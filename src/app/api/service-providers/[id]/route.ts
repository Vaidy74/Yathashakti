import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET /api/service-providers/[id] - Get a specific service provider
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const serviceProviderId = params.id;
    
    const serviceProvider = await prisma.serviceProvider.findUnique({
      where: {
        id: serviceProviderId,
      },
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
        grants: {
          select: {
            id: true,
            grantIdentifier: true,
            amount: true,
            status: true,
            grantee: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!serviceProvider) {
      return NextResponse.json(
        { error: 'Service provider not found' },
        { status: 404 }
      );
    }

    // Transform data to match our TypeScript interface
    const formattedServiceProvider = {
      ...serviceProvider,
      programs: serviceProvider.programs.map(p => ({
        id: p.program.id,
        name: p.program.name,
      })),
    };

    return NextResponse.json(formattedServiceProvider);
  } catch (error) {
    console.error('Error fetching service provider:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service provider' },
      { status: 500 }
    );
  }
}

// PATCH /api/service-providers/[id] - Update a service provider
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const serviceProviderId = params.id;
    const data = await request.json();
    
    // Validate service provider exists
    const existingProvider = await prisma.serviceProvider.findUnique({
      where: { id: serviceProviderId },
    });
    
    if (!existingProvider) {
      return NextResponse.json(
        { error: 'Service provider not found' },
        { status: 404 }
      );
    }

    // Update the service provider
    const updatedData: any = {};
    
    // Only update fields that are provided
    if (data.name !== undefined) updatedData.name = data.name;
    if (data.category !== undefined) updatedData.category = data.category;
    if (data.type !== undefined) updatedData.type = data.type;
    if (data.contactPerson !== undefined) updatedData.contactPerson = data.contactPerson;
    if (data.contactNumber !== undefined) {
      updatedData.contactNumber = data.contactNumber;
      updatedData.phone = data.contactNumber; // Keep legacy field in sync
    }
    if (data.email !== undefined) updatedData.email = data.email;
    if (data.location !== undefined) updatedData.location = data.location;
    if (data.description !== undefined) updatedData.description = data.description;
    if (data.website !== undefined) updatedData.website = data.website;
    if (data.services !== undefined) updatedData.services = data.services;
    if (data.ratePerDay !== undefined) {
      updatedData.ratePerDay = data.ratePerDay ? parseFloat(data.ratePerDay) : null;
    }
    if (data.registeredOn !== undefined) {
      updatedData.registeredOn = new Date(data.registeredOn);
    }

    const updatedServiceProvider = await prisma.serviceProvider.update({
      where: { id: serviceProviderId },
      data: updatedData,
    });

    return NextResponse.json(updatedServiceProvider);
  } catch (error) {
    console.error('Error updating service provider:', error);
    return NextResponse.json(
      { error: 'Failed to update service provider' },
      { status: 500 }
    );
  }
}

// DELETE /api/service-providers/[id] - Delete a service provider
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const serviceProviderId = params.id;
    
    // Check if service provider exists
    const serviceProvider = await prisma.serviceProvider.findUnique({
      where: { id: serviceProviderId },
      include: {
        programs: true,
        grants: true,
      },
    });
    
    if (!serviceProvider) {
      return NextResponse.json(
        { error: 'Service provider not found' },
        { status: 404 }
      );
    }
    
    // Check for relationships that would prevent deletion
    if (serviceProvider.programs.length > 0 || serviceProvider.grants.length > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete service provider with associated programs or grants',
          programCount: serviceProvider.programs.length,
          grantCount: serviceProvider.grants.length
        },
        { status: 400 }
      );
    }

    // Delete the service provider
    await prisma.serviceProvider.delete({
      where: { id: serviceProviderId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting service provider:', error);
    return NextResponse.json(
      { error: 'Failed to delete service provider' },
      { status: 500 }
    );
  }
}
