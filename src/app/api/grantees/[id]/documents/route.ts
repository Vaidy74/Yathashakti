import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// GET - Retrieve documents for a grantee
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { id } = params;
    
    // Check if grantee exists
    const grantee = await prisma.grantee.findUnique({
      where: { id },
      include: { documents: true }
    });
    
    if (!grantee) {
      return NextResponse.json({ error: "Grantee not found" }, { status: 404 });
    }
    
    return NextResponse.json(grantee.documents);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST - Add a document to a grantee
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { id } = params;
    
    // Check if grantee exists
    const grantee = await prisma.grantee.findUnique({
      where: { id }
    });
    
    if (!grantee) {
      return NextResponse.json({ error: "Grantee not found" }, { status: 404 });
    }
    
    // Get document data from request
    const data = await request.json();
    
    // Validate required fields
    if (!data.name || !data.type || !data.fileUrl) {
      return NextResponse.json({ 
        error: "Missing required fields (name, type, fileUrl)" 
      }, { status: 400 });
    }
    
    // Create document
    const document = await prisma.granteeDocument.create({
      data: {
        name: data.name,
        type: data.type,
        fileUrl: data.fileUrl,
        granteeId: id
      }
    });
    
    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE - Delete a document
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { id } = params;
    const searchParams = new URL(request.url).searchParams;
    const documentId = searchParams.get('documentId');
    
    if (!documentId) {
      return NextResponse.json({ error: "Document ID is required" }, { status: 400 });
    }
    
    // Check if document exists and belongs to this grantee
    const document = await prisma.granteeDocument.findFirst({
      where: {
        id: documentId,
        granteeId: id
      }
    });
    
    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }
    
    // Delete document
    await prisma.granteeDocument.delete({
      where: { id: documentId }
    });
    
    // In a production environment, you would also delete the file from storage
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
