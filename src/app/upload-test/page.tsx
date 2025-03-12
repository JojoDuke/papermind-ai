'use client';

import { useUploadThing } from "@/lib/uploadthing";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Upload } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function UploadTest() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const { startUpload, isUploading: isUploadingFile } = useUploadThing("pdfUploader");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      console.log("Starting upload with UploadThing...");
      const uploadResult = await startUpload([file]);
      
      console.log("Upload result:", uploadResult);
      
      if (uploadResult && uploadResult[0]) {
        const { url } = uploadResult[0];
        
        toast({
          title: "Upload successful",
          description: `File ${file.name} uploaded successfully`,
        });
        
        // Clear the file input
        setFile(null);
        const input = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (input) input.value = '';
        
        console.log("File URL:", url);
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An error occurred during upload",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full space-y-6">
        <h1 className="text-2xl font-bold text-center mb-6">UploadThing Test</h1>
        
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              onChange={handleFileChange}
              accept="application/pdf"
              className="hidden"
              id="file-input"
            />
            <label
              htmlFor="file-input"
              className="cursor-pointer flex flex-col items-center justify-center"
            >
              <Upload className="h-12 w-12 text-gray-400 mb-2" />
              <span className="text-sm text-gray-600">
                {file ? file.name : "Click to select a PDF file"}
              </span>
            </label>
          </div>

          <Button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="w-full"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Uploading...
              </>
            ) : (
              "Upload File"
            )}
          </Button>
        </div>

        <div className="mt-4 text-sm text-gray-500">
          <p>Status: {isUploading ? "Uploading..." : "Ready"}</p>
          {file && (
            <p className="mt-2">
              Selected file: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>
      </div>
    </div>
  );
} 