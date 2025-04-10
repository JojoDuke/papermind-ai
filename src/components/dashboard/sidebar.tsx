"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { LogOut, Loader2, PanelLeftClose, PanelLeftOpen, FileText, AlertCircle, Plus, MoreVertical, Trash, Coins } from "lucide-react";
import { Button } from "../ui/button";
import { Tooltip } from "../ui/tooltip";
import { supabase } from "@/lib/supabase";
import { useToast } from "../ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useFiles } from "@/contexts/FileContext";
import { useCredits } from "@/contexts/CreditsContext";

// Define a type for uploaded files
interface UploadedFile {
  id: string;
  user_id?: string;
  name: string;
  url: string;
  created_at?: string;
  file_size?: number;
  collection_id?: string;
}

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const { userFiles, setUserFiles, removeFile, addFile } = useFiles();
  const { credits, isPremium } = useCredits();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isLoadingFiles, setIsLoadingFiles] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

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
          .select('id, user_id, name, url, created_at, file_size, collection_id')
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
  }, [toast, setUserFiles]);

  // Add useEffect to get user ID
  useEffect(() => {
    const getUserId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getUserId();
  }, []);

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
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
      setShowLogoutDialog(false);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
    // Dispatch a custom event to inform other components
    const event = new CustomEvent('sidebar-toggled');
    window.dispatchEvent(event);
  };

  // Listen for toggle-sidebar events from other components (like document page)
  useEffect(() => {
    const handleToggleSidebar = () => {
      toggleSidebar();
    };
    
    window.addEventListener('toggle-sidebar', handleToggleSidebar);
    
    return () => {
      window.removeEventListener('toggle-sidebar', handleToggleSidebar);
    };
  }, []);

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
      removeFile(file.id);
      
      // If we're deleting the current file, go back to dashboard
      if (currentFileId === file.id) {
        router.push('/dashboard');
      }

      // Get the current user's ID
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('No user found');

      // Delete from Supabase Storage
      const filePath = `${user.id}/${file.id}`;
      const { error: storageError } = await supabase.storage
        .from('user-files-bucket')
        .remove([filePath]);

      if (storageError) {
        console.error('Error deleting from storage:', storageError);
        throw storageError;
      }

      // Delete from Supabase database
      const { error: dbError } = await supabase
        .from('files')
        .delete()
        .eq('id', file.id);

      if (dbError) {
        console.error('Error deleting from database:', dbError);
        throw dbError;
      }

      // Delete from Wetro collection
      try {
        const response = await fetch('https://papermind-ai-backend.onrender.com/delete-collection', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ collection_id: file.collection_id })
        });

        if (!response.ok) {
          console.error('Failed to delete Wetro collection:', await response.text());
          throw new Error('Failed to delete Wetro collection');
        }
      } catch (error) {
        console.error('Error deleting Wetro collection:', error);
        // Continue with other deletions even if Wetro deletion fails
      }

      toast({
        title: "File deleted",
        description: `${file.name} has been deleted.`,
        variant: "default",
      });
    } catch (error) {
      console.error('Error deleting file:', error);
      // Revert UI update on error
      addFile(file);
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

  const handleUpgrade = () => {
    if (!userId) return;
    
    // Pass user ID in metadata with test product ID
    const paymentUrl = `https://test.checkout.dodopayments.com/buy/pdt_idWXm8RKDDzZ5nnMMDyLo?quantity=1&redirect_url=${encodeURIComponent('http://usepapermind.com/dashboard')}&metadata_user_id=${encodeURIComponent(userId)}`;
    window.location.href = paymentUrl;
  };

  return (
    <>
      {/* Mobile Sidebar Toggle Button - Only visible when sidebar is collapsed and NOT on document page */}
      {isSidebarCollapsed && !pathname.startsWith('/dashboard/d/') && (
        <button
          onClick={toggleSidebar}
          className="md:hidden fixed top-4 left-4 z-30 bg-purple-500 text-white p-3 rounded-full shadow-lg"
          aria-label="Open sidebar"
        >
          <PanelLeftOpen className="h-5 w-5" />
        </button>
      )}
      
      {/* Mobile Overlay - Only visible when sidebar is open on mobile */}
      {!isSidebarCollapsed && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-10"
          onClick={() => setIsSidebarCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <div 
        id="sidebar"
        className={`absolute top-0 left-0 h-full bg-white border-r border-gray-200 shadow-lg flex flex-col transition-all duration-300 z-20
          ${isSidebarCollapsed ? 'w-0 md:w-16 -translate-x-full md:translate-x-0' : 'w-[85%] sm:w-72 translate-x-0'}`}
      >
        {/* Credits Display */}
        <div className={`p-4 border-b border-gray-200 ${isSidebarCollapsed ? "justify-center" : "justify-between"} flex items-center ${isSidebarCollapsed ? 'md:flex hidden' : 'flex'}`}>
          <div className={`flex items-center gap-2 ${isSidebarCollapsed ? "w-8 h-8 justify-center" : ""}`}>
            <Coins className="w-5 h-5 text-purple-500" />
            {!isSidebarCollapsed && (
              <div>
                <p className="text-sm font-medium">{credits} Credits</p>
                <p className="text-xs text-gray-500">{isPremium ? 'Premium' : 'Free'} Plan</p>
              </div>
            )}
          </div>
          {!isSidebarCollapsed && !isPremium && (
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs"
              onClick={handleUpgrade}
            >
              Upgrade
            </Button>
          )}
        </div>

        {/* Sidebar Header with Toggle Button */}
        <div className={`p-4 border-b border-gray-200 flex ${isSidebarCollapsed ? 'md:flex hidden justify-center' : 'flex justify-between items-center'}`}>
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
        <div className={`flex-1 overflow-y-auto py-4 px-3 ${isSidebarCollapsed ? 'md:block hidden' : 'block'}`}>
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
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-gray-500 hover:text-red-600 hover:bg-red-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFile(file);
                          }}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Logout Button at bottom of sidebar */}
        <div className={`p-4 border-t border-gray-200 ${isSidebarCollapsed ? 'md:block hidden' : 'block'}`}>
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
        </div>
      </div>

      {/* Content overlay when sidebar is expanded on desktop */}
      <div 
        className={`fixed top-0 left-0 w-full h-full bg-black transition-opacity duration-300 z-5 md:block hidden ${
          !isSidebarCollapsed ? 'opacity-20' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsSidebarCollapsed(true)}
      />

      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>
              Are you sure you want to log out? You will need to sign in again to access your documents.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowLogoutDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="gap-2"
            >
              {isLoggingOut && <Loader2 className="h-4 w-4 animate-spin" />}
              {isLoggingOut ? "Logging out..." : "Logout"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 