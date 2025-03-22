"use client";

import { useState, useEffect } from "react";
import { Upload, FileText, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Dropzone from "react-dropzone";
import { useToast } from "../ui/use-toast";
import { Progress } from "../ui/progress";
import { generateReactHelpers } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";
import { useFiles } from "@/contexts/FileContext";

const { useUploadThing } = generateReactHelpers<OurFileRouter>();

const Dashboard = () => {
  const router = useRouter();
  const { toast } = useToast();
  const { addFile } = useFiles();
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadTimeout, setUploadTimeout] = useState<NodeJS.Timeout | null>(null);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (uploadTimeout) {
        clearTimeout(uploadTimeout);
      }
    };
  }, [uploadTimeout]);

  const { startUpload } = useUploadThing("pdfUploader", {
    onUploadProgress: (progress) => {
      console.log("Upload progress:", progress);
      setUploadProgress(progress);
    },
    onClientUploadComplete: async (res: any[]) => {
      if (uploadTimeout) {
        clearTimeout(uploadTimeout);
      }
      
      if (res && res[0]) {
        console.log("Upload completed:", res);

        try {
          // Get the current user's ID
          const { data: { user }, error: userError } = await supabase.auth.getUser();
          
          if (userError) throw userError;
          if (!user) throw new Error('No user found');

          const newFile = {
            id: res[0].key,
            user_id: user.id,
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

          // Add the new file to context
          addFile(newFile);

          setIsUploading(false);
          setUploadProgress(0);
          
          // Navigate to the new file
          router.push(`/dashboard/d/${newFile.id}`);
          
          toast({
            title: "File uploaded successfully",
            description: `${res[0].name} has been uploaded.`,
            variant: "default",
          });
        } catch (error) {
          console.error('Error saving file:', error);
          handleUploadError(new Error('Failed to save file information'));
        }
      }
    },
    onUploadError: (error: Error) => {
      handleUploadError(error);
    }
  });

  const handleUploadError = (error: Error) => {
    console.error("Upload error:", error);
    if (uploadTimeout) {
      clearTimeout(uploadTimeout);
    }
    setIsUploading(false);
    setUploadProgress(0);
    toast({
      title: "Upload error",
      description: error.message || "An unknown error occurred. Please try again.",
      variant: "destructive",
    });
  };

  const handleUpload = async (acceptedFiles: File[]) => {
    console.log("Files dropped:", acceptedFiles);
    try {
      setIsUploading(true);
      
      // Set a 5-minute timeout for the upload
      const timeout = setTimeout(() => {
        handleUploadError(new Error('Upload timed out. Please try again.'));
      }, 300000); // 5 minutes
      
      setUploadTimeout(timeout);
      
      await startUpload(acceptedFiles);
    } catch (err) {
      console.error("Upload error:", err);
      handleUploadError(err instanceof Error ? err : new Error('Failed to start upload'));
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
      
      {/* Main Content */}
      <div className="relative h-full w-full p-8 flex items-center justify-center z-0">
        <div className="w-3/4 h-3/4 bg-white border border-gray-200 rounded-xl shadow-md flex flex-col items-center justify-center p-8">
          <Dropzone
            onDrop={handleUpload}
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
      </div>
    </div>
  );
};

export default Dashboard;
