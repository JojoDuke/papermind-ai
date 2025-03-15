"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { LogOut, Loader2, PanelLeftClose, PanelLeftOpen, FileText, AlertCircle, Plus, MoreVertical, Trash } from "lucide-react";
import { Button } from "../ui/button";
import { Tooltip } from "../ui/tooltip";
import { supabase } from "@/lib/supabase";
import { useToast } from "../ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Define a type for uploaded files
interface UploadedFile {
  id: string;
  user_id?: string;
  name: string;
  url: string;
  created_at?: string;
  file_size?: number;
}

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [userFiles, setUserFiles] = useState<UploadedFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(true);

  // Get current file ID from URL if we're on a document page
  const currentFileId = pathname.startsWith('/dashboard/d/') 
    ? pathname.split('/').pop() 
    : null;

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
  }, [toast]);

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

  const handleDeleteFile = async (file: UploadedFile) => {
    console.log('Delete initiated for file:', file);
    try {
      // Update UI first for better perceived performance
      setUserFiles(prev => prev.filter(f => f.id !== file.id));
      
      // If we're deleting the current file, go back to dashboard
      if (currentFileId === file.id) {
        router.push('/dashboard');
      }

      // Delete from Supabase with retries
      let retries = 3;
      let supabaseSuccess = false;
      
      while (retries > 0 && !supabaseSuccess) {
        try {
          console.log(`Attempting to delete from Supabase (${retries} retries left)...`);
          const { error: dbError, data } = await supabase
            .from('files')
            .delete()
            .eq('id', file.id)
            .select();

          if (dbError) {
            console.error('Supabase delete error:', dbError);
            throw dbError;
          }
          
          console.log('Supabase deletion response:', data);
          supabaseSuccess = true;
        } catch (error) {
          console.error(`Supabase delete attempt failed (${retries} retries left):`, error);
          retries--;
          if (retries === 0) throw error;
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between retries
        }
      }

      // Delete from UploadThing with retries
      let uploadThingSuccess = false;
      retries = 3;
      
      while (retries > 0 && !uploadThingSuccess) {
        try {
          console.log(`Attempting to delete from UploadThing (${retries} retries left)...`);
          const response = await fetch(`/api/uploadthing/delete?key=${file.id}`, {
            method: 'DELETE',
            headers: {
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            }
          });

          console.log('UploadThing response:', response);
          if (!response.ok) {
            throw new Error(`Failed to delete file from UploadThing: ${response.status} ${response.statusText}`);
          }
          
          uploadThingSuccess = true;
        } catch (error) {
          console.error(`UploadThing delete attempt failed (${retries} retries left):`, error);
          retries--;
          if (retries === 0) throw error;
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between retries
        }
      }

      toast({
        title: "File deleted",
        description: `${file.name} has been deleted.`,
        variant: "default",
      });
    } catch (error) {
      console.error('Delete operation failed:', error);
      // Revert UI changes if deletion failed
      const { data: files } = await supabase
        .from('files')
        .select('*')
        .order('created_at', { ascending: false });
      
      setUserFiles(files || []);

      toast({
        title: "Error deleting file",
        description: "Failed to delete the file. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFileSelect = (file: UploadedFile) => {
    router.push(`/dashboard/d/${file.id}`);
    if (!isSidebarCollapsed) setIsSidebarCollapsed(true);
  };

  const handleNewDocument = () => {
    router.push('/dashboard');
  };

  return (
    <>
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
                onClick={handleNewDocument}
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
                    {isSidebarCollapsed ? (
                      <button
                        onClick={() => handleFileSelect(file)}
                        className="w-full p-2 flex justify-center hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <FileText className={`h-5 w-5 ${
                          currentFileId === file.id ? 'text-purple-600' : 'text-gray-500'
                        }`} />
                      </button>
                    ) : (
                      <div className={`flex items-center w-full p-3 hover:bg-gray-100 rounded-lg transition-colors ${
                        currentFileId === file.id ? 'bg-purple-100 text-purple-900' : 'text-gray-700'
                      }`}>
                        <div 
                          className="flex-1 min-w-0 cursor-pointer"
                          onClick={() => handleFileSelect(file)}
                        >
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 flex-shrink-0 text-gray-500 mr-2" />
                            <span className="text-sm font-medium truncate">
                              {file.name}
                            </span>
                          </div>
                          <div className="flex items-center text-xs text-gray-500 mt-1">
                            <span className="truncate">{formatDate(file.created_at)}</span>
                            <span className="mx-1 flex-shrink-0">•</span>
                            <span className="truncate">{formatFileSize(file.file_size)}</span>
                          </div>
                        </div>
                        <div className="flex-shrink-0 ml-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                className="h-6 w-6 p-0 text-gray-500 hover:text-gray-900"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                className="text-red-600 cursor-pointer"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleDeleteFile(file);
                                }}
                              >
                                <Trash className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    )}
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

      {/* Content overlay when sidebar is expanded */}
      <div 
        className={`absolute top-0 left-0 w-full h-full bg-black transition-opacity duration-300 z-5 ${
          !isSidebarCollapsed ? 'opacity-20' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsSidebarCollapsed(true)}
      />

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
    </>
  );
} 