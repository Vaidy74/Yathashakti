import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// GET - Retrieve all communications for a grant
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
    
    // Check if grant exists
    const grant = await prisma.grant.findUnique({
      where: { id }
    });
    
    if (!grant) {
      return NextResponse.json({ error: "Grant not found" }, { status: 404 });
    }
    
    // Get communications for this grant
    const communications = await prisma.communication.findMany({
      where: { grantId: id },
      orderBy: { date: 'desc' }
    });
    
    return NextResponse.json(communications);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST - Log a new communication
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
    const data = await request.json();
    
    // Validate required fields
    if (!data.date || !data.type || !data.notes) {
      return NextResponse.json({ 
        error: "Missing required fields: date, type, notes" 
      }, { status: 400 });
    }
    
    // Check if grant exists
    const grant = await prisma.grant.findUnique({
      where: { id },
      include: { grantee: true }
    });
    
    if (!grant) {
      return NextResponse.json({ error: "Grant not found" }, { status: 404 });
    }
    
    // Create the communication record
    const communication = await prisma.communication.create({
      data: {
        date: new Date(data.date),
        type: data.type,
        notes: data.notes,
        evidence: data.evidence || null,
        grantId: id
      }
    });
    
    // Check if we need to update grant status based on communication
    if (data.updateGrantStatus && data.newGrantStatus) {
      await prisma.grant.update({
        where: { id },
        data: { status: data.newGrantStatus }
      });
    }
    
    // Automatically create a follow-up task if followUpDate is provided
    if (data.followUpDate) {
      await prisma.task.create({
        data: {
          title: `Follow up with ${grant.grantee.name} on grant ${grant.grantIdentifier}`,
          description: `Follow up on communication from ${new Date(data.date).toLocaleDateString()}: ${data.notes.slice(0, 100)}...`,
          dueDate: new Date(data.followUpDate),
          status: 'TO_DO',
          priority: 'MEDIUM',
          assigneeId: data.assigneeId || null,
          // Note: Task model doesn't have direct relation to Grant
          // We store grant info in the description instead
        }
      });
    }
    
    return NextResponse.json(communication, { status: 201 });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PATCH - Update a communication
export async function PATCH(
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
    const communicationId = searchParams.get('communicationId');
    
    if (!communicationId) {
      return NextResponse.json({ error: "Communication ID is required" }, { status: 400 });
    }
    
    const data = await request.json();
    
    // Check if communication exists and belongs to this grant
    const communication = await prisma.communication.findFirst({
      where: {
        id: communicationId,
        grantId: id
      }
    });
    
    if (!communication) {
      return NextResponse.json({ error: "Communication not found" }, { status: 404 });
    }
    
    // Update the communication
    const updatedCommunication = await prisma.communication.update({
      where: { id: communicationId },
      data: {
        date: data.date ? new Date(data.date) : undefined,
        type: data.type || undefined,
        notes: data.notes || undefined,
        evidence: data.evidence !== undefined ? data.evidence : undefined
      }
    });
    
    return NextResponse.json(updatedCommunication);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE - Delete a communication
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
    const communicationId = searchParams.get('communicationId');
    
    if (!communicationId) {
      return NextResponse.json({ error: "Communication ID is required" }, { status: 400 });
    }
    
    // Check if communication exists and belongs to this grant
    const communication = await prisma.communication.findFirst({
      where: {
        id: communicationId,
        grantId: id
      }
    });
    
    if (!communication) {
      return NextResponse.json({ error: "Communication not found" }, { status: 404 });
    }
    
    // Delete the communication
    await prisma.communication.delete({
      where: { id: communicationId }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
