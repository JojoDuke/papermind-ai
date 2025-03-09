"use client";

import ChatWrapper from "@/components/dashboard/chat-wrapper";
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { notFound, redirect } from "next/navigation";
import { readdir } from 'fs/promises';
import { join } from 'path';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import the PDF renderer with no SSR
const PdfRenderer = dynamic(() => import('@/components/dashboard/pdf-renderer'), { 
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full w-full">
      <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
    </div>
  )
});

interface PageProps {
  params: {
    fileid: string;
  };
}

const Page = async ({ params }: PageProps) => {
  const { fileid } = params;

  // Use Supabase Auth instead of Kinde Auth
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session || !session.user.id) redirect(`/signin?redirect=/dashboard/${fileid}`);

  // Check if the file exists in our local uploads directory
  const uploadsDir = join(process.cwd(), 'public', 'uploads');
  let files: string[] = [];
  
  try {
    files = await readdir(uploadsDir);
  } catch (error) {
    console.error('Error reading uploads directory:', error);
  }
  
  // Find the file with the matching ID (which is the filename)
  const fileExists = files.includes(fileid);
  
  if (!fileExists) {
    // If not found in local files, try the database as fallback
    try {
      const db = (await import('@/db')).db;
      const file = await db.file.findFirst({
        where: {
          id: fileid,
          userId: session.user.id,
        },
      });
      
      if (file) {
        // Determine if the URL is a local file or an UploadThing URL
        let fileUrl = file.url;
        
        // If the URL doesn't start with http, it's likely a local file
        if (!fileUrl.startsWith('http')) {
          // Check if it's a local upload path (starts with /uploads/)
          if (fileUrl.startsWith('/uploads/')) {
            // The URL is already in the correct format for local files
            // No changes needed
          } else {
            // For any other format, assume it's a relative path and prepend the base URL
            fileUrl = `${process.env.NEXT_PUBLIC_APP_URL || ''}${fileUrl}`;
          }
        }
        
        return renderPdfPage(fileUrl);
      }
    } catch (error) {
      console.error('Error checking database for file:', error);
    }
    
    // If we get here, the file wasn't found in either location
    notFound();
  }
  
  // For local files, construct the URL
  const fileUrl = `/uploads/${fileid}`;
  
  return renderPdfPage(fileUrl);
};

// Helper function to render the PDF page
function renderPdfPage(fileUrl: string) {
  return (
    <div className="flex-1 justify-between flex flex-col h-[calc(100vh-3.5rem)]">
      <div className=" mx-auto w-full max-w-8xl grow lg:flex xl:px-2">
        {/* Left Side */}
        <div className="flex-1 xl:flex">
          <div className="px-4 py-6 sm:px-6 lg:pl-8 xl:flex-1 xl:pl-6">
            <Suspense fallback={
              <div className="flex items-center justify-center h-full w-full">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
              </div>
            }>
              <PdfRenderer url={fileUrl} />
            </Suspense>
          </div>
        </div>

        {/* Right Side */}
        <div className="shrink-0 flex-[0.75] border-t border-gray-200 lg:w-96 lg:border-l lg:border-t-0">
          <ChatWrapper />
        </div>
      </div>
    </div>
  );
}

export default Page;
