"use client";

import { LogOut, Loader2, PanelLeftClose, PanelLeftOpen, Upload, FileText, AlertCircle, Plus, MoreVertical, Trash } from "lucide-react";
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
import { generateReactHelpers } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const { useUploadThing } = generateReactHelpers<OurFileRouter>();

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
  user_id?: string;
  name: string;
  url: string;
  created_at?: string;
  file_size?: number;
}

const Dashboard = () => {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [currentFile, setCurrentFile] = useState<UploadedFile | null>(null);
  const [hasUploadedFile, setHasUploadedFile] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [userFiles, setUserFiles] = useState<UploadedFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(true);

  // Load user's files on component mount
  useEffect(() => {
    const loadUserFiles = async () => {
      try {
        const { data: files, error } = await supabase
          .from('files')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        setUserFiles(files || []);
        // If we have files and no current file is selected, select the most recent one
        if (files?.length > 0 && !currentFile) {
          setCurrentFile(files[0]);
          setHasUploadedFile(true);
        }
      } catch (error) {
        console.error('Error loading files:', error);
        toast({
          title: "Error loading files",
          description: "Failed to load your documents. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingFiles(false);
      }
    };

    loadUserFiles();
  }, []);

  const { startUpload } = useUploadThing("pdfUploader", {
    onUploadProgress: (progress) => {
      console.log("Upload progress:", progress);
      setUploadProgress(progress);
    },
    onClientUploadComplete: async (res: any[]) => {
      if (res && res[0]) {
        console.log("Upload completed:", res);

        try {
          // Get the current user's ID
          const { data: { user }, error: userError } = await supabase.auth.getUser();
          
          if (userError) throw userError;
          if (!user) throw new Error('No user found');

          const newFile = {
            id: res[0].key,
            user_id: user.id,  // Add the user_id
            name: res[0].name,
            url: res[0].url,
            created_at: new Date().toISOString(),
            file_size: res[0].size
          };

          // Save file info to Supabase
          const { error } = await supabase
            .from('files')
            .insert([newFile]);

          if (error) throw error;

          setUserFiles(prev => [newFile, ...prev]);
          setCurrentFile(newFile);
          setHasUploadedFile(true);
          setIsUploading(false);
          setUploadProgress(0);
          
          toast({
            title: "File uploaded successfully",
            description: `${res[0].name} has been uploaded.`,
            variant: "default",
          });
        } catch (error) {
          console.error('Error saving file:', error);
          toast({
            title: "Error saving file",
            description: "File uploaded but failed to save. Please try again.",
            variant: "destructive",
          });
        }
      }
    },
    onUploadError: (error: Error) => {
      console.error("Upload error:", error);
      setIsUploading(false);
      setUploadProgress(0);
      toast({
        title: "Upload error",
        description: error.message || "An unknown error occurred",
        variant: "destructive",
      });
    }
  });
  const { toast } = useToast();

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

  // Function to format file size
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  // Function to format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Render the upload area when no file has been uploaded
  const renderUploadArea = () => (
    <div className="w-3/4 h-3/4 bg-white border border-gray-200 rounded-xl shadow-md flex flex-col items-center justify-center p-8">
      <Dropzone
        onDrop={async (acceptedFiles) => {
          console.log("Files dropped:", acceptedFiles);
          try {
            setIsUploading(true);
            await startUpload(acceptedFiles);
          } catch (err) {
            console.error("Upload error:", err);
            setIsUploading(false);
            setUploadProgress(0);
            toast({
              title: "Upload error",
              description: "Failed to start upload",
              variant: "destructive",
            });
          }
        }}
        accept={{ "application/pdf": [".pdf"] }}
        maxSize={4 * 1024 * 1024} // 4MB
      >
        {({getRootProps, getInputProps, isDragActive}) => (
          <div 
            {...getRootProps()} 
            className="w-2/3 mx-auto h-64 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer flex flex-col items-center justify-center"
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center">
              <div className="p-4 rounded-full bg-purple-100 mb-4">
                {isUploading ? (
                  <Loader2 className="h-10 w-10 text-purple-500 animate-spin" />
                ) : (
                  <Upload className="h-10 w-10 text-purple-500" />
                )}
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-3">
                {isUploading ? "Uploading..." : "Upload Your Documents"}
              </h2>
              {isUploading ? (
                <div className="w-full max-w-xs space-y-2">
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-sm text-gray-500 text-center">{Math.round(uploadProgress)}%</p>
                </div>
              ) : (
                <>
                  <p className="text-gray-600 text-center max-w-md mb-4">
                    {isDragActive ? "Drop your PDF here" : "Click to browse or drag and drop your PDF"}
                  </p>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <FileText className="h-4 w-4" />
                    <span>Maximum file size: 4MB</span>
                  </div>
                </>
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

  const handleDeleteFile = async (file: UploadedFile) => {
    try {
      // Delete from Supabase
      const { error: dbError } = await supabase
        .from('files')
        .delete()
        .eq('id', file.id);

      if (dbError) throw dbError;

      // Delete from UploadThing
      const response = await fetch(`/api/uploadthing/delete?key=${file.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete file from UploadThing');
      }

      // Update UI
      setUserFiles(prev => prev.filter(f => f.id !== file.id));
      
      // If the deleted file was the current file, clear it
      if (currentFile?.id === file.id) {
        setCurrentFile(null);
        setHasUploadedFile(false);
      }

      toast({
        title: "File deleted",
        description: `${file.name} has been deleted.`,
        variant: "default",
      });
    } catch (error) {
      console.error('Error deleting file:', error);
      toast({
        title: "Error deleting file",
        description: "Failed to delete the file. Please try again.",
        variant: "destructive",
      });
    }
  };

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
        <div className={`p-4 border-b border-gray-200 flex ${isSidebarCollapsed ? 'justify-center' : 'justify-between items-center'}`}>
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
          
          {!isSidebarCollapsed && (
            <Tooltip content="New Document" side="bottom">
              <Button
                variant="ghost"
                size="sm"
                className="p-1 hover:bg-gray-100"
                onClick={() => {
                  setCurrentFile(null);
                  setHasUploadedFile(false);
                }}
              >
                <Plus className="h-5 w-5" />
              </Button>
            </Tooltip>
          )}
        </div>
        
        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-4 px-3">
          <div className={`mb-4 ${isSidebarCollapsed ? 'hidden' : 'block'}`}>
            <h3 className="px-2 text-sm font-semibold text-gray-500 uppercase tracking-wider">
              Your Documents
            </h3>
          </div>
          {isLoadingFiles ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
            </div>
          ) : (
            <ul className="space-y-2">
              {userFiles.map((file) => (
                <li key={file.id}>
                  <div className="flex items-center">
                    <button
                      onClick={() => {
                        setCurrentFile(file);
                        setHasUploadedFile(true);
                        if (!isSidebarCollapsed) setIsSidebarCollapsed(true);
                      }}
                      className={`flex-1 text-left ${
                        isSidebarCollapsed 
                          ? 'p-2 flex justify-center' 
                          : 'p-3 hover:bg-gray-100'
                      } rounded-lg transition-colors ${
                        currentFile?.id === file.id ? 'bg-purple-100 text-purple-900' : 'text-gray-700'
                      }`}
                    >
                      {isSidebarCollapsed ? (
                        <FileText className={`h-5 w-5 ${
                          currentFile?.id === file.id ? 'text-purple-600' : 'text-gray-500'
                        }`} />
                      ) : (
                        <div className="flex items-center justify-between w-full">
                          <div className="flex flex-col">
                            <div className="flex items-center">
                              <FileText className="h-4 w-4 mr-2 text-gray-500" />
                              <span className="text-sm font-medium truncate">
                                {file.name}
                              </span>
                            </div>
                            <div className="mt-1 flex items-center text-xs text-gray-500">
                              <span>{formatDate(file.created_at)}</span>
                              <span className="mx-1">•</span>
                              <span>{formatFileSize(file.file_size)}</span>
                            </div>
                          </div>
                          {!isSidebarCollapsed && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 hover:bg-transparent"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-[160px]">
                                <DropdownMenuItem>
                                  Share
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  Rename
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  Archive
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteFile(file)}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      )}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
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
