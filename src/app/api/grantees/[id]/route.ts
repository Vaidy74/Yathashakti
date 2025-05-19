import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { Prisma } from '@prisma/client';

// GET /api/grantees/[id] - Get a single grantee by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Get grantee with related data
    const grantee = await prisma.grantee.findUnique({
      where: { id },
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
        }
      }
    });

    if (!grantee) {
      return NextResponse.json({ error: 'Grantee not found' }, { status: 404 });
    }

    // Format the response
    const formattedGrantee = {
      ...grantee,
      programs: grantee.grants.map((grant: any) => ({
        programId: grant.program.id,
        programName: grant.program.name,
        status: grant.status
      }))
    };

    return NextResponse.json(formattedGrantee);
  } catch (error) {
    console.error('Error fetching grantee:', error);
    return NextResponse.json({ error: 'Failed to fetch grantee' }, { status: 500 });
  }
}

// PATCH /api/grantees/[id] - Update a grantee
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();

    // Check if grantee exists
    const existingGrantee = await prisma.grantee.findUnique({
      where: { id }
    });

    if (!existingGrantee) {
      return NextResponse.json({ error: 'Grantee not found' }, { status: 404 });
    }

    // Update grantee - using only fields that exist in the schema
    // First, build a compatible data object
    const updateData: Prisma.GranteeUpdateInput = {
      name: body.name,
      phone: body.phone,
      email: body.email,
      address: body.address,
      sector: body.sector
    };
    
    // Add optional fields if they exist
    if (body.dateOfBirth) {
      updateData.dateOfBirth = new Date(body.dateOfBirth);
    }
    
    // Update the grantee
    const updatedGrantee = await prisma.grantee.update({
      where: { id },
      data: updateData
    });

    // Log the update
    await prisma.auditLog.create({
      data: {
        entityType: 'Grantee',
        entityId: id,
        action: 'update',
        previousData: JSON.parse(JSON.stringify(existingGrantee)),
        newData: JSON.parse(JSON.stringify(updatedGrantee)),
        userId: session?.user?.id || 'unknown'
      }
    });

    return NextResponse.json({
      message: 'Grantee updated successfully',
      grantee: updatedGrantee
    });
  } catch (error) {
    console.error('Error updating grantee:', error);
    return NextResponse.json({ error: 'Failed to update grantee' }, { status: 500 });
  }
}

// DELETE /api/grantees/[id] - Delete a grantee
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Check if grantee exists
    const existingGrantee = await prisma.grantee.findUnique({
      where: { id }
    });

    if (!existingGrantee) {
      return NextResponse.json({ error: 'Grantee not found' }, { status: 404 });
    }

    // Delete related grants first (maintain referential integrity)
    await prisma.grant.deleteMany({
      where: { granteeId: id }
    });

    // Delete related documents if they exist in the schema
    // This will be implemented when the document schema is available

    // Delete the grantee
    await prisma.grantee.delete({
      where: { id }
    });

    // Log the deletion
    await prisma.auditLog.create({
      data: {
        entityType: 'Grantee',
        entityId: id,
        action: 'delete',
        previousData: JSON.parse(JSON.stringify(existingGrantee)),
        userId: session?.user?.id || 'unknown'
      }
    });

    return NextResponse.json({
      message: 'Grantee deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting grantee:', error);
    return NextResponse.json({ error: 'Failed to delete grantee' }, { status: 500 });
  }
}
