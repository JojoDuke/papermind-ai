"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabase';
import ChatInterface from '@/components/dashboard/chat-interface';
import { useToast } from '@/components/ui/use-toast';

// Dynamically import the PDF renderer with no SSR
const PdfRenderer = dynamic(() => import('@/components/dashboard/pdf-renderer'), { 
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full w-full">
      <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
    </div>
  )
});

interface FileData {
  id: string;
  name: string;
  url: string;
  user_id: string;
  collection_id: string;
}

export default function DocumentPage({ params }: { params: { fileId: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [file, setFile] = useState<FileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFile = async () => {
      try {
        // Get the current user's ID
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) throw userError;
        if (!user) {
          router.push('/signin');
          return;
        }

        // Fetch the file data
        const { data: fileData, error: fileError } = await supabase
          .from('files')
          .select('*')
          .eq('id', params.fileId)
          .single();

        if (fileError) throw fileError;
        if (!fileData) {
          toast({
            title: "File not found",
            description: "The requested document could not be found.",
            variant: "destructive",
          });
          router.push('/dashboard');
          return;
        }

        // Verify file ownership
        if (fileData.user_id !== user.id) {
          toast({
            title: "Access denied",
            description: "You don't have permission to view this document.",
            variant: "destructive",
          });
          router.push('/dashboard');
          return;
        }

        setFile(fileData);
      } catch (error) {
        console.error('Error fetching file:', error);
        toast({
          title: "Error loading document",
          description: "Failed to load the document. Please try again.",
          variant: "destructive",
        });
        router.push('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFile();
  }, [params.fileId, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!file) {
    return null;
  }

  return (
    <div className="relative h-screen bg-gradient-to-br from-white via-purple-100 to-indigo-200 overflow-hidden">
      {/* Gradient overlay elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200/40 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 left-0 w-72 h-72 bg-indigo-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/3 w-80 h-80 bg-purple-300/20 rounded-full blur-3xl"></div>
      </div>
      
      {/* Main Content */}
      <div className="relative h-full w-full p-8 flex items-center justify-center z-0">
        <div className="w-11/12 h-full bg-white border border-gray-200 rounded-xl shadow-md flex flex-row p-0 overflow-hidden document-workspace">
          {/* Left side - Chat area */}
          <div className="w-5/12 border-r border-gray-200 flex flex-col h-full overflow-hidden">
            <div className="flex flex-col h-full overflow-hidden">
              <h2 className="text-sm font-semibold text-gray-800 mb-2 text-center pt-4">Chat with Papermind</h2>
              <div className="flex-1 overflow-hidden">
                <ChatInterface fileId={params.fileId} fileName={file.name} collectionId={file.collection_id} />
              </div>
            </div>
          </div>
          
          {/* Right side - PDF preview */}
          <div className="w-7/12 flex flex-col">
            <div className="h-full">
              <PdfRenderer url={file.url} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 