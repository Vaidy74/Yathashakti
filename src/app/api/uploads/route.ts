import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { withApiRateLimit } from "@/utils/apiRateLimit";

// In a production environment, you would use a cloud storage service like AWS S3
// This is a simplified implementation for development purposes

export const POST = withApiRateLimit(async (request: NextRequest) => {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    
    // Process form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const entityType = formData.get('entityType') as string;
    const entityId = formData.get('entityId') as string;
    const documentType = formData.get('documentType') as string;
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    
    if (!entityType || !entityId) {
      return NextResponse.json({ error: "Entity information required" }, { status: 400 });
    }
    
    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File size exceeds 5MB limit" }, { status: 400 });
    }
    
    // Get file extension
    const originalFilename = file.name;
    const fileExtension = originalFilename.split('.').pop() || '';
    
    // Generate unique filename
    const uniqueFilename = `${uuidv4()}.${fileExtension}`;
    const filePath = join('uploads', uniqueFilename);
    const fullPath = join(process.cwd(), 'public', filePath);
    
    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Write file to disk
    await writeFile(fullPath, buffer);
    
    // Return file information
    return NextResponse.json({
      success: true,
      file: {
        name: originalFilename,
        type: file.type,
        size: file.size,
        url: `/${filePath}`,
        documentType: documentType || 'Document',
        entityType,
        entityId
      }
    });
  } catch (error) {
    console.error("File upload error:", error);
    return NextResponse.json({ 
      error: "Error uploading file",
      message: (error as Error).message
    }, { status: 500 });
  }
});
