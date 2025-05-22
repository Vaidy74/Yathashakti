import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET /api/service-providers/[id]/documents - Get all documents for a service provider
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

    // Get documents for the service provider
    const documents = await prisma.serviceProviderDocument.findMany({
      where: {
        serviceProviderId,
      },
      orderBy: {
        uploadedAt: 'desc',
      },
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error('Error fetching service provider documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

// POST /api/service-providers/[id]/documents - Create a new document for a service provider
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const serviceProviderId = params.id;
    const data = await request.json();
    
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

    // Create new document
    const document = await prisma.serviceProviderDocument.create({
      data: {
        name: data.name,
        type: data.type,
        fileUrl: data.fileUrl,
        description: data.description,
        serviceProviderId,
      },
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error('Error creating service provider document:', error);
    return NextResponse.json(
      { error: 'Failed to create document' },
      { status: 500 }
    );
  }
}
