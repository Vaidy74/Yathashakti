import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// GET - Retrieve a specific grant by ID
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
    
    // Fetch grant with related data
    const grant = await prisma.grant.findUnique({
      where: { id },
      include: {
        grantee: true,
        program: true,
        serviceProvider: true,
        repaymentSchedule: {
          orderBy: { dueDate: 'asc' }
        },
        repaymentHistory: {
          orderBy: { date: 'desc' }
        },
        communications: {
          orderBy: { date: 'desc' }
        }
      }
    });
    
    if (!grant) {
      return NextResponse.json({ error: "Grant not found" }, { status: 404 });
    }
    
    // Calculate total repaid amount
    const totalRepaid = grant.repaymentHistory.reduce(
      (sum, repayment) => sum + repayment.amount, 
      0
    );
    
    // Add calculated fields to the response
    const enhancedGrant = {
      ...grant,
      totalRepaid,
      percentRepaid: grant.amount > 0 ? (totalRepaid / grant.amount) * 100 : 0,
      remainingAmount: grant.amount - totalRepaid
    };
    
    return NextResponse.json(enhancedGrant);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PATCH - Update a grant
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
    const data = await request.json();
    
    // Check if grant exists
    const existingGrant = await prisma.grant.findUnique({
      where: { id }
    });
    
    if (!existingGrant) {
      return NextResponse.json({ error: "Grant not found" }, { status: 404 });
    }
    
    // Update the grant
    const updatedGrant = await prisma.grant.update({
      where: { id },
      data: {
        amount: data.amount !== undefined ? data.amount : undefined,
        disbursementDate: data.disbursementDate ? new Date(data.disbursementDate) : undefined,
        status: data.status || undefined,
        repaymentRate: data.repaymentRate !== undefined ? data.repaymentRate : undefined,
        notes: data.notes !== undefined ? data.notes : undefined,
        programId: data.programId || undefined,
        granteeId: data.granteeId || undefined,
        serviceProviderId: data.serviceProviderId || undefined
      },
      include: {
        grantee: true,
        program: true
      }
    });
    
    return NextResponse.json(updatedGrant);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE - Delete a grant
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
    
    // Check if grant exists
    const existingGrant = await prisma.grant.findUnique({
      where: { id }
    });
    
    if (!existingGrant) {
      return NextResponse.json({ error: "Grant not found" }, { status: 404 });
    }
    
    // Delete the grant
    // Note: This assumes you have CASCADE set up in your Prisma schema
    // for related repayment schedules, communications, etc.
    await prisma.grant.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
