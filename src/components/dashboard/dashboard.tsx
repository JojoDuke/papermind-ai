"use client";

import { LogOut, Loader2, PanelLeftClose, PanelLeftOpen, Upload, FileText, AlertCircle } from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { Tooltip } from "../ui/tooltip";
import Link from "next/link";
import Dropzone from "react-dropzone";
import { useToast } from "../ui/use-toast";
import { Progress } from "../ui/progress";
import { File, Cloud } from "lucide-react";
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

// Define a type for uploaded files
interface UploadedFile {
  id: string;
  name: string;
  url: string;
}

const Dashboard = () => {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [isUploadHovered, setIsUploadHovered] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [currentFile, setCurrentFile] = useState<UploadedFile | null>(null);
  const [hasUploadedFile, setHasUploadedFile] = useState<boolean>(false);

  const { toast } = useToast();
  
  // Load uploaded files on component mount
  useEffect(() => {
    const fetchUploadedFiles = async () => {
      try {
        const response = await fetch('/api/files');
        if (response.ok) {
          const data = await response.json();
          if (data.files && Array.isArray(data.files)) {
            // Transform the files to match our expected format
            const files = data.files.map((file: any) => ({
              id: file.key,
              name: file.name,
              url: file.url
            }));
            setUploadedFiles(files);
            
            // If there are files, set the most recent one as current
            if (files.length > 0) {
              setCurrentFile(files[0]);
              setHasUploadedFile(true);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching files:', error);
      }
    };
    
    fetchUploadedFiles();
  }, []);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false);
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await supabase.auth.signOut();
      router.push('/signin');
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      setIsLoggingOut(false);
      setShowLogoutConfirm(false);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const startSimulatedProgress = () => {
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress((prevProgress) => {
        if (prevProgress >= 95) {
          clearInterval(interval);
          return prevProgress;
        }
        return prevProgress + 5;
      });
    }, 500);
    return interval;
  };

  // Function to handle file upload using our local API
  const handleFileUpload = async (file: File) => {
    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      
      // Log file details
      console.log("Uploading file:", file.name);
      
      // Send the file to our local API
      const response = await fetch('/api/local-upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server responded with ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Upload response:", data);
      
      if (data.success && data.file) {
        // Create a new file object
        const newFile: UploadedFile = {
          id: data.file.key,
          name: data.file.name,
          url: data.file.url
        };
        
        // Update state
        setUploadedFiles(prev => [newFile, ...prev]);
        setCurrentFile(newFile);
        setHasUploadedFile(true);
        
        return {
          success: true,
          file: data.file
        };
      } else {
        throw new Error("Upload failed: Unexpected response format");
      }
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    }
  };

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById('sidebar');
      if (!isSidebarCollapsed && sidebar && !sidebar.contains(event.target as Node)) {
        setIsSidebarCollapsed(true);
      }
    };

    if (!isSidebarCollapsed) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSidebarCollapsed]);

  // Render the upload area when no file has been uploaded
  const renderUploadArea = () => (
    <div className="w-3/4 h-3/4 bg-white border border-gray-200 rounded-xl shadow-md flex flex-col items-center justify-center p-8">
      <Dropzone
        multiple={false}
        onDrop={async (acceptedFile) => {
          if (acceptedFile.length === 0) return;
          
          setIsUploading(true);
          const progressInterval = startSimulatedProgress();

          try {
            // Log file details
            console.log("Starting upload for file:", acceptedFile[0].name);
            
            // Use our local upload function
            const result = await handleFileUpload(acceptedFile[0]);
            
            if (result && result.success) {
              clearInterval(progressInterval);
              setUploadProgress(100);
              console.log("Upload successful:", result.file);
              
              // Show success toast
              toast({
                title: "File uploaded successfully",
                description: `${acceptedFile[0].name} has been uploaded.`,
                variant: "default",
              });
              
              // Reset upload state after a delay
              setTimeout(() => {
                setIsUploading(false);
                setUploadProgress(0);
              }, 2000);
            } else {
              throw new Error("Upload failed");
            }
          } catch (error) {
            console.error("Upload error:", error);
            setIsUploading(false);
            clearInterval(progressInterval);
            toast({
              title: "Upload error",
              description: error instanceof Error ? error.message : "An unknown error occurred",
              variant: "destructive",
            });
          }
        }}
      >
        {({ getRootProps, getInputProps, acceptedFiles }) => (
          <div 
            {...getRootProps()}
            className="w-2/3 mx-auto h-64 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors"
          >
            <input {...getInputProps()} />
            
            <div className="flex flex-col items-center justify-center p-6">
              <div className="p-4 rounded-full bg-purple-100 mb-4">
                <Upload className="h-10 w-10 text-purple-500" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-3">Upload Your Documents</h2>
              <p className="text-gray-600 text-center max-w-md mb-4">
                Click to browse and upload files. Supported file types: PDF
              </p>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <FileText className="h-4 w-4" />
                <span>Maximum file size: 4MB</span>
              </div>
              
              {acceptedFiles && acceptedFiles[0] ? (
                <div className="max-w-xs bg-white flex items-center rounded-md overflow-hidden outline outline-[1px] outline-zinc-200 divide-x divide-zinc-200 mt-4">
                  <div className="px-3 py-2 h-full grid place-items-center">
                    <File className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="px-3 py-2 h-full text-sm truncate">
                    {acceptedFiles[0].name}
                  </div>
                </div>
              ) : null}
              
              {isUploading && (
                <div className="w-full mt-4 max-w-xs mx-auto">
                  <Progress
                    value={uploadProgress}
                    className="h-1 w-full bg-zinc-200"
                    indicatorColor={uploadProgress === 100 ? "bg-green-500" : ""}
                  />
                  {uploadProgress === 100 ? (
                    <div className="flex gap-1 items-center justify-center text-sm text-zinc-700 text-center pt-2">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    <div className="text-xs text-center text-zinc-500 pt-1">
                      Uploading: {uploadProgress}%
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </Dropzone>
    </div>
  );

  // Render the document workspace with writing area and PDF preview
  const renderDocumentWorkspace = () => (
    <div className="w-11/12 h-full bg-white border border-gray-200 rounded-xl shadow-md flex flex-row p-0 overflow-hidden document-workspace">
      {/* Left side - Chat area */}
      <div className="w-5/12 border-r border-gray-200 flex flex-col h-full overflow-hidden">
        <div className="flex flex-col h-full overflow-hidden">
          <h2 className="text-sm font-semibold text-gray-800 mb-2 text-center pt-4">Chat with Papermind</h2>
          <div className="flex-1 overflow-hidden">
            <ChatInterface />
          </div>
        </div>
      </div>
      
      {/* Right side - PDF preview */}
      <div className="w-7/12 flex flex-col">
        {currentFile && (
          <Suspense fallback={
            <div className="flex items-center justify-center h-full w-full">
              <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            </div>
          }>
            <div className="h-full">
              <PdfRenderer url={currentFile.url} />
            </div>
          </Suspense>
        )}
      </div>
    </div>
  );

  return (
    <div className="relative h-screen bg-gradient-to-br from-white via-purple-100 to-indigo-200 overflow-hidden">
      {/* Gradient overlay elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200/40 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 left-0 w-72 h-72 bg-indigo-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/3 w-80 h-80 bg-purple-300/20 rounded-full blur-3xl"></div>
      </div>
      
      {/* Main Content - Fixed width regardless of sidebar state */}
      <div className="relative h-full w-full p-8 flex items-center justify-center z-0">
        {hasUploadedFile ? renderDocumentWorkspace() : renderUploadArea()}
      </div>
      
      {/* Content overlay when sidebar is expanded */}
      <div 
        className={`absolute top-0 left-0 w-full h-full bg-black transition-opacity duration-300 z-5 ${
          !isSidebarCollapsed ? 'opacity-20' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsSidebarCollapsed(true)}
      ></div>
      
      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full mx-4">
            <div className="flex items-center mb-4">
              <AlertCircle className="h-6 w-6 text-red-500 mr-2" />
              <h3 className="text-lg font-semibold">Confirm Logout</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to log out of your account?
            </p>
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={handleLogoutCancel}
                disabled={isLoggingOut}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Logging out...
                  </>
                ) : (
                  'Log out'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Sidebar - Absolute positioned */}
      <div 
        id="sidebar"
        className={`absolute top-0 left-0 h-full bg-white border-r border-gray-200 shadow-lg flex flex-col transition-all duration-300 z-10 ${
          isSidebarCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {/* Sidebar Header with Toggle Button */}
        <div className={`p-4 border-b border-gray-200 flex ${isSidebarCollapsed ? 'justify-center' : 'justify-start'}`}>
          <Tooltip 
            content={isSidebarCollapsed ? "Open sidebar" : "Close sidebar"}
            side={isSidebarCollapsed ? "right" : "bottom"}
          >
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-1 hover:bg-gray-100"
              onClick={toggleSidebar}
            >
              {isSidebarCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
            </Button>
          </Tooltip>
        </div>
        
        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-2">
            {/* Add navigation items here later */}
          </ul>
        </div>
        
        {/* Logout Button at bottom of sidebar */}
        <div className="p-4 border-t border-gray-200">
          <Tooltip 
            content="Log out of this account"
            side={isSidebarCollapsed ? "right" : "top"}
          >
            {isSidebarCollapsed ? (
              <div 
                onClick={handleLogoutClick}
                className="flex justify-center items-center cursor-pointer bg-red-50 border border-red-300 rounded-[10px] p-2 text-white hover:bg-red-100 transition-colors"
                aria-label="Logout"
              >
                <LogOut className="h-5 w-5 text-red-600" />
              </div>
            ) : (
              <Button 
                onClick={handleLogoutClick} 
                variant="destructive"
                className="w-full justify-center border border-red-300 rounded-md"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span>Logout</span>
              </Button>
            )}
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
