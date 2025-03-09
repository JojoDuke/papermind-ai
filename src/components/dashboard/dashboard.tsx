"use client";

import { LogOut, Loader2, PanelLeftClose, PanelLeftOpen, Upload, FileText } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { Tooltip } from "../ui/tooltip";
import Link from "next/link";

const Dashboard = () => {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isUploadHovered, setIsUploadHovered] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await supabase.auth.signOut();
      router.push('/signin');
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      setIsLoggingOut(false);
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
        <div className="w-3/4 h-3/4 bg-white border border-gray-200 rounded-xl shadow-md flex flex-col items-center justify-center p-8">
          <div 
            className={`p-6 rounded-full bg-purple-100 mb-6 cursor-pointer transition-colors duration-300 ${
              isUploadHovered ? 'bg-purple-200' : ''
            }`}
            onMouseEnter={() => setIsUploadHovered(true)}
            onMouseLeave={() => setIsUploadHovered(false)}
          >
            <Upload className={`h-12 w-12 text-purple-500 transition-colors duration-300 ${
              isUploadHovered ? 'text-purple-600' : ''
            }`} />
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">Upload Your Documents</h2>
          <p className="text-gray-600 text-center max-w-md mb-6">
            Click to browse and upload files. Supported file types: PDF
          </p>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <FileText className="h-4 w-4" />
            <span>Maximum file size: 10MB</span>
          </div>
        </div>
      </div>
      
      {/* Content overlay when sidebar is expanded */}
      <div 
        className={`absolute top-0 left-0 w-full h-full bg-black transition-opacity duration-300 z-5 ${
          !isSidebarCollapsed ? 'opacity-20' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsSidebarCollapsed(true)}
      ></div>
      
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
                onClick={handleLogout}
                className="flex justify-center items-center cursor-pointer bg-red-50 border border-red-300 rounded-[10px] p-2 text-white hover:bg-red-100 transition-colors"
                aria-label="Logout"
              >
                {isLoggingOut ? (
                  <Loader2 className="h-5 w-5 animate-spin text-red-600" />
                ) : (
                  <LogOut className="h-5 w-5 text-red-600" />
                )}
              </div>
            ) : (
              <Button 
                onClick={handleLogout} 
                variant="destructive"
                className="w-full justify-center border border-red-300 rounded-md"
                disabled={isLoggingOut}
              >
                {isLoggingOut ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <LogOut className="h-4 w-4 mr-2" />
                )}
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
