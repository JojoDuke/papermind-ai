"use client";

import { useState, useEffect } from "react";
import { Upload, FileText, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Dropzone from "react-dropzone";
import { useToast } from "../ui/use-toast";
import { Progress } from "../ui/progress";
import { useFiles } from "@/contexts/FileContext";
import { Button } from "../ui/button";

const Dashboard = () => {
  const router = useRouter();
  const { toast } = useToast();
  const { addFile } = useFiles();
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadTimeout, setUploadTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const maxFileSize = isPremium ? 50 * 1024 * 1024 : 4 * 1024 * 1024; // 50MB for premium, 4MB for free
  const maxFileSizeText = isPremium ? "50MB" : "4MB";

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (uploadTimeout) {
        clearTimeout(uploadTimeout);
      }
    };
  }, [uploadTimeout]);

  // Add useEffect to check premium status
  useEffect(() => {
    const checkPremiumStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { data: userData } = await supabase
          .from('users')
          .select('is_premium')
          .eq('id', user.id)
          .single();
        
        if (userData) {
          setIsPremium(userData.is_premium);
        }
      }
    };
    
    checkPremiumStatus();
  }, []);

  const handleUploadError = (error: Error) => {
    console.error("Upload error:", error);
    if (uploadTimeout) {
      clearTimeout(uploadTimeout);
    }
    setIsUploading(false);
    setUploadProgress(0);
    
    // Check if this is a file size limit error
    const isFileSizeError = error.message?.includes('File size exceeds the 4MB limit for free users');
    
    toast({
      title: "Upload error",
      description: "File size exceeds the 4MB limit for free users",
      variant: "destructive",
      action: isFileSizeError ? (
        <Button
          variant="outline"
          size="sm"
          className="bg-white mt-2 border-purple-500 text-purple-700 hover:bg-purple-50"
          onClick={handleUpgrade}
        >
          Upgrade to Premium
        </Button>
      ) : undefined,
    });
  };

  const handleUpgrade = () => {
    if (!userId) return;
    
    // Pass user ID in metadata with test product ID
    const currentOrigin = window.location.origin;
    const paymentUrl = `https://test.checkout.dodopayments.com/buy/pdt_idWXm8RKDDzZ5nnMMDyLo?quantity=1&redirect_url=${encodeURIComponent(`${currentOrigin}/dashboard?success=true`)}&metadata_user_id=${encodeURIComponent(userId)}`;
    window.location.href = paymentUrl;
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

      const file = acceptedFiles[0]; // We only handle one file at a time

      // Check file size limit for free tier users
      if (!isPremium && file.size > 4 * 1024 * 1024) {
        throw new Error(
          'File size exceeds the 4MB limit for free users. Upgrade to Premium for files up to 50MB.'
        );
      }

      // Get the current user's ID
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('No user found');

      // Generate a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('user-files-bucket')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Simulate upload progress since Supabase Storage doesn't support progress tracking
      const simulateProgress = () => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          if (progress > 90) {
            clearInterval(interval);
          } else {
            setUploadProgress(progress);
          }
        }, 200);
        return () => clearInterval(interval);
      };

      const clearSimulatedProgress = simulateProgress();
      
      // Get the public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('user-files-bucket')
        .getPublicUrl(filePath);

      // Set progress to 100% when upload is complete
      setUploadProgress(100);
      clearSimulatedProgress();

      // Process PDF with Wetro
      const wetroResponse = await fetch('https://papermind-ai-backend.onrender.com/process-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fileUrl: publicUrl,
          fileName: file.name,
          fileId: fileName
        })
      });

      if (!wetroResponse.ok) {
        throw new Error('Failed to process PDF with Wetro');
      }

      const { collection_id } = await wetroResponse.json();

      const newFile = {
        id: fileName,
        user_id: user.id,
        name: file.name,
        url: publicUrl,
        created_at: new Date().toISOString(),
        file_size: file.size,
        collection_id: collection_id
      };

      // Save file info to Supabase
      const { error } = await supabase
        .from('files')
        .insert([newFile]);

      if (error) throw error;

      // Add the new file to context
      addFile(newFile);

      if (uploadTimeout) {
        clearTimeout(uploadTimeout);
      }

      setIsUploading(false);
      setUploadProgress(0);
      
      // Navigate to the new file
      router.push(`/dashboard/d/${newFile.id}`);
      
      toast({
        title: "File uploaded successfully",
        description: `${file.name} has been uploaded and processed.`,
        variant: "default",
      });
    } catch (err) {
      console.error("Upload error:", err);
      handleUploadError(err instanceof Error ? err : new Error('Failed to upload file'));
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
      <div className="relative h-full w-full p-4 md:p-8 flex items-center justify-center z-0">
        <div className="w-[95%] sm:w-[90%] md:w-3/4 h-auto sm:h-3/4 bg-white border border-gray-200 rounded-xl shadow-md flex flex-col items-center justify-center p-4 sm:p-8">
          <Dropzone
            onDrop={handleUpload}
            accept={{ "application/pdf": [".pdf"] }}
            maxSize={maxFileSize}
          >
            {({getRootProps, getInputProps, isDragActive}) => (
              <div 
                {...getRootProps()} 
                className="w-full sm:w-2/3 mx-auto h-52 sm:h-64 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer flex flex-col items-center justify-center"
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center justify-center p-4">
                  <div className="p-3 sm:p-4 rounded-full bg-purple-100 mb-3 sm:mb-4">
                    {isUploading ? (
                      <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 text-purple-500 animate-spin" />
                    ) : (
                      <Upload className="h-8 w-8 sm:h-10 sm:w-10 text-purple-500" />
                    )}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-3 text-center">
                    {isUploading ? "Uploading..." : "Upload Your Documents"}
                  </h2>
                  {isUploading ? (
                    <div className="w-full max-w-xs space-y-2">
                      <Progress value={uploadProgress} className="h-2" />
                      <p className="text-sm text-gray-500 text-center">{Math.round(uploadProgress)}%</p>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm sm:text-base text-gray-600 text-center max-w-md mb-3 sm:mb-4">
                        {isDragActive ? "Drop your PDF here" : "Click to browse or drag and drop your PDF"}
                      </p>
                      <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500">
                        <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span>Maximum file size: {maxFileSizeText}</span>
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
