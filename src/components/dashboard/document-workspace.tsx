"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import dynamic from 'next/dynamic';
import ChatInterface from './chat-interface';

// Dynamically import the PDF renderer with no SSR
const PdfRenderer = dynamic(() => import('./pdf-renderer'), { 
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full w-full">
      <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
    </div>
  )
});

interface DocumentWorkspaceProps {
  fileUrl: string;
  fileName: string;
}

const DocumentWorkspace = ({ fileUrl, fileName }: DocumentWorkspaceProps) => {
  // Extract fileId from the URL
  const fileId = fileUrl.split('/').pop()?.split('?')[0] || '';

  return (
    <div className="w-11/12 h-full bg-white border border-gray-200 rounded-xl shadow-md flex flex-row p-0 overflow-hidden document-workspace">
      {/* Left side - Chat area */}
      <div className="w-5/12 border-r border-gray-200 flex flex-col h-full overflow-hidden">
        <div className="flex flex-col h-full overflow-hidden">
          <h2 className="text-sm font-semibold text-gray-800 mb-2 text-center pt-4">Chat with Papermind</h2>
          <div className="flex-1 overflow-hidden">
            <ChatInterface fileId={fileId} fileName={fileName} />
          </div>
        </div>
      </div>
      
      {/* Right side - PDF preview */}
      <div className="w-7/12 flex flex-col">
        <Suspense fallback={
          <div className="flex items-center justify-center h-full w-full">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
          </div>
        }>
          <div className="h-full">
            <PdfRenderer url={fileUrl} />
          </div>
        </Suspense>
      </div>
    </div>
  );
};

export default DocumentWorkspace; 