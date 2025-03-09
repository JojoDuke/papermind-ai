"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function LocalUploadTest() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setSuccess(null);
      setUploadedFileUrl(null);
    }
  };
  
  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }
    
    setUploading(true);
    setError(null);
    setSuccess(null);
    setUploadedFileUrl(null);
    
    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      
      // Log file details
      console.log("File details:", {
        name: file.name,
        type: file.type,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      });
      
      // Send the file to our local API
      console.log("Starting local upload...");
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
        setSuccess(`File uploaded successfully!`);
        setUploadedFileUrl(data.file.url);
      } else {
        setError("Upload failed: Unexpected response format");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Local File Upload Test</h1>
      
      <div className="space-y-6">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="mb-4"
          />
          
          {file && (
            <p className="text-sm text-gray-600 mb-4">
              Selected file: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
          
          <Button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="w-full"
          >
            {uploading ? "Uploading..." : "Upload File"}
          </Button>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
            <h3 className="font-semibold mb-1">Error</h3>
            <p>{error}</p>
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-md">
            <h3 className="font-semibold mb-1">Success</h3>
            <p>{success}</p>
            
            {uploadedFileUrl && (
              <div className="mt-4">
                <p className="font-semibold mb-2">Preview:</p>
                <iframe 
                  src={uploadedFileUrl} 
                  className="w-full h-96 border border-gray-200 rounded"
                />
              </div>
            )}
          </div>
        )}
        
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-md">
          <h3 className="font-semibold mb-2">How This Works</h3>
          <p className="text-sm text-blue-700 mb-2">
            This is a local file upload solution that stores files in your project's public directory.
            It's a fallback for when UploadThing has connectivity issues.
          </p>
          <ul className="text-sm text-blue-700 list-disc pl-5 space-y-1">
            <li>Files are stored in the <code>/public/uploads</code> directory</li>
            <li>Maximum file size is 4MB</li>
            <li>Only PDF files are accepted</li>
            <li>This is for development/testing only</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 