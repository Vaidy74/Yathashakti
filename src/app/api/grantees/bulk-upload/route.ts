import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// Type definition for CSV row
interface GranteeCSVRow {
  name: string;
  gender: string;
  phone: string;
  email?: string;
  village: string;
  district: string;
  state: string;
  pincode?: string;
  dateOfBirth?: string;
  idType: string;
  idNumber: string;
  sector: string;
  programId?: string;
  activities?: string;
  notes?: string;
}

// Validate a single grantee record
function validateGranteeRecord(record: any, rowIndex: number): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Required fields validation
  if (!record.name) errors.push(`Row ${rowIndex + 1}: Name is required`);
  if (!record.phone) errors.push(`Row ${rowIndex + 1}: Phone number is required`);
  if (!record.village) errors.push(`Row ${rowIndex + 1}: Village/Town is required`);
  if (!record.district) errors.push(`Row ${rowIndex + 1}: District is required`);
  if (!record.state) errors.push(`Row ${rowIndex + 1}: State is required`);
  if (!record.idType) errors.push(`Row ${rowIndex + 1}: ID Type is required`);
  if (!record.idNumber) errors.push(`Row ${rowIndex + 1}: ID Number is required`);
  if (!record.sector) errors.push(`Row ${rowIndex + 1}: Sector is required`);
  
  // Format validations
  if (record.email && !/^\S+@\S+\.\S+$/.test(record.email)) {
    errors.push(`Row ${rowIndex + 1}: Invalid email format`);
  }
  
  if (record.phone && !/^\d{10}$/.test(record.phone)) {
    errors.push(`Row ${rowIndex + 1}: Phone number should be 10 digits`);
  }
  
  if (record.dateOfBirth && isNaN(Date.parse(record.dateOfBirth))) {
    errors.push(`Row ${rowIndex + 1}: Invalid date format for Date of Birth`);
  }
  
  return { isValid: errors.length === 0, errors };
}

// Process CSV content
async function processCSVContent(csvContent: string): Promise<{ 
  successful: number; 
  failed: number; 
  errors: string[]
}> {
  try {
    // Parse CSV - now using the sync version which returns an array directly
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    }) as Record<string, string>[];
    
    let successful = 0;
    let failed = 0;
    const errors: string[] = [];
    
    // Validate all records first
    const validationResults = records.map((record, index) => 
      validateGranteeRecord(record, index)
    );
    
    // Collect all validation errors
    validationResults.forEach((result, index) => {
      if (!result.isValid) {
        failed++;
        errors.push(...result.errors);
      }
    });
    
    // If there are validation errors, stop processing
    if (errors.length > 0) {
      return { successful, failed, errors };
    }
    
    // Process valid records
    for (let i = 0; i < records.length; i++) {
      if (validationResults[i].isValid) {
        const record = records[i];
        
        try {
          // Create grantee in database
          await prisma.grantee.create({
            data: {
              name: record.name,
              // If gender is an enum in Prisma, we need to ensure it's uppercase
              // We'll omit it if it's not provided to avoid type errors
              ...(record.gender ? { gender: record.gender.toUpperCase() } : {}),
              phone: record.phone,
              email: record.email || null,
              village: record.village,
              district: record.district,
              state: record.state,
              pincode: record.pincode || null,
              dateOfBirth: record.dateOfBirth ? new Date(record.dateOfBirth) : null,
              idType: record.idType,
              idNumber: record.idNumber,
              sector: record.sector,
              activities: record.activities || null,
              notes: record.notes || null,
              // We would handle program assignments separately
            }
          });
          
          successful++;
        } catch (err) {
          failed++;
          errors.push(`Row ${i + 1}: Database error - ${(err as Error).message}`);
        }
      } else {
        failed++;
      }
    }
    
    return { successful, failed, errors };
  } catch (error) {
    console.error("Error processing CSV:", error);
    return { successful: 0, failed: 0, errors: [(error as Error).message] };
  }
}

// Handle file uploads
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Process form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }
    
    // Check file type
    const fileType = file.name.split('.').pop()?.toLowerCase();
    if (!['csv', 'xls', 'xlsx'].includes(fileType || '')) {
      return NextResponse.json({ 
        error: "Invalid file type. Please upload CSV or Excel file" 
      }, { status: 400 });
    }
    
    // For CSV processing
    if (fileType === 'csv') {
      const content = await file.text();
      const result = await processCSVContent(content);
      
      return NextResponse.json({
        message: "File processed",
        successful: result.successful,
        failed: result.failed,
        errors: result.errors
      }, { status: result.errors.length > 0 ? 400 : 200 });
    }
    
    // For Excel processing (in a real implementation, we would use a library like exceljs or xlsx)
    // Currently only simulating Excel processing
    if (['xls', 'xlsx'].includes(fileType || '')) {
      return NextResponse.json({
        message: "Excel processing is not implemented yet",
        error: "Please use CSV format for now"
      }, { status: 400 });
    }
    
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ 
      error: "Error processing file",
      message: (error as Error).message
    }, { status: 500 });
  }
}

// Create a sample CSV template for download
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // CSV header and sample data
    const csvContent = `name,gender,phone,email,village,district,state,pincode,dateOfBirth,idType,idNumber,sector,activities,notes
John Doe,MALE,9876543210,john@example.com,Greenfield,Central,Karnataka,560001,1990-01-15,Aadhaar,123456789012,Agriculture,Organic farming,Example grantee
Jane Smith,FEMALE,8765432109,jane@example.com,Riverside,North,Tamil Nadu,600001,1985-05-20,Voter ID,ABC1234567,Handicrafts,Handloom weaving,Another example`;
    
    // Create response with CSV content
    const response = new NextResponse(csvContent);
    response.headers.set('Content-Type', 'text/csv');
    response.headers.set('Content-Disposition', 'attachment; filename=grantee_template.csv');
    
    return response;
  } catch (error) {
    console.error("Template API error:", error);
    return NextResponse.json({ error: "Error generating template" }, { status: 500 });
  }
}
