import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET /api/service-providers/[id]/documents/[documentId] - Get a specific document
export async function GET(
  request: Request,
  { params }: { params: { id: string; documentId: string } }
) {
  try {
    const { id: serviceProviderId, documentId } = params;
    
    // Check if document exists and belongs to the service provider
    const document = await prisma.serviceProviderDocument.findFirst({
      where: {
        id: documentId,
        serviceProviderId,
      },
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(document);
  } catch (error) {
    console.error('Error fetching document:', error);
    return NextResponse.json(
      { error: 'Failed to fetch document' },
      { status: 500 }
    );
  }
}

// DELETE /api/service-providers/[id]/documents/[documentId] - Delete a specific document
export async function DELETE(
  request: Request,
  { params }: { params: { id: string; documentId: string } }
) {
  try {
    const { id: serviceProviderId, documentId } = params;
    
    // Check if document exists and belongs to the service provider
    const document = await prisma.serviceProviderDocument.findFirst({
      where: {
        id: documentId,
        serviceProviderId,
      },
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Delete the document
    await prisma.serviceProviderDocument.delete({
      where: {
        id: documentId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}

// PATCH /api/service-providers/[id]/documents/[documentId] - Update a specific document
export async function PATCH(
  request: Request,
  { params }: { params: { id: string; documentId: string } }
) {
  try {
    const { id: serviceProviderId, documentId } = params;
    const data = await request.json();
    
    // Check if document exists and belongs to the service provider
    const existingDocument = await prisma.serviceProviderDocument.findFirst({
      where: {
        id: documentId,
        serviceProviderId,
      },
    });

    if (!existingDocument) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Update the document
    const updatedDocument = await prisma.serviceProviderDocument.update({
      where: {
        id: documentId,
      },
      data: {
        name: data.name !== undefined ? data.name : undefined,
        description: data.description !== undefined ? data.description : undefined,
        // fileUrl and type can't be changed once uploaded
      },
    });

    return NextResponse.json(updatedDocument);
  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json(
      { error: 'Failed to update document' },
      { status: 500 }
    );
  }
}
