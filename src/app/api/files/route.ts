import { NextRequest, NextResponse } from 'next/server';
import { readdir } from 'fs/promises';
import { join } from 'path';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const supabase = createServerComponentClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session || !session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get the uploads directory path
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    
    // Read the directory contents
    const files = await readdir(uploadsDir).catch(() => []);
    
    // Map the files to a more useful format
    const fileList = files.map(filename => {
      // Extract timestamp and original filename
      const parts = filename.split('-');
      const timestamp = parseInt(parts[0]);
      const originalName = parts.slice(1).join('-');
      
      return {
        key: filename,
        name: originalName,
        url: `/uploads/${filename}`,
        uploadedAt: new Date(timestamp).toISOString(),
      };
    });
    
    // Sort by upload date (newest first)
    fileList.sort((a, b) => {
      return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
    });
    
    return NextResponse.json({ files: fileList });
  } catch (error) {
    console.error('Error listing files:', error);
    return NextResponse.json(
      { 
        error: 'Failed to list files',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 