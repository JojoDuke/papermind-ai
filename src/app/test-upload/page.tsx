"use client";

import { useState } from "react";
import { useUploadThing } from "@/lib/uploadthing";
import { Button } from "@/components/ui/button";

export default function TestUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  
  const { startUpload } = useUploadThing("pdfUploader");
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setSuccess(null);
      setDebugInfo(null);
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
    setDebugInfo(null);
    
    try {
      // Log file details
      const fileDetails = {
        name: file.name,
        type: file.type,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      };
      console.log("File details:", fileDetails);
      setDebugInfo(`Uploading: ${JSON.stringify(fileDetails, null, 2)}`);
      
      // Start upload
      console.log("Starting upload...");
      const response = await startUpload([file]);
      console.log("Upload response:", response);
      
      if (response && response[0]) {
        setSuccess(`File uploaded successfully! Key: ${response[0].key}`);
        setDebugInfo(prev => `${prev}\n\nResponse: ${JSON.stringify(response[0], null, 2)}`);
      } else {
        setError("Upload failed: No response from server");
        setDebugInfo(prev => `${prev}\n\nNo response data received`);
      }
    } catch (err) {
      console.error("Upload error:", err);
      
      // Extract detailed error information
      let errorMessage = "An unknown error occurred";
      let errorDetails = "";
      
      if (err instanceof Error) {
        errorMessage = err.message;
        errorDetails = err.stack || "";
      }
      
      setError(`Upload error: ${errorMessage}`);
      setDebugInfo(prev => `${prev}\n\nError: ${errorMessage}\n${errorDetails}`);
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">UploadThing Test</h1>
      
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
          </div>
        )}
        
        {debugInfo && (
          <div className="bg-gray-50 border border-gray-200 p-4 rounded-md">
            <h3 className="font-semibold mb-2">Debug Information</h3>
            <pre className="text-xs text-gray-600 whitespace-pre-wrap overflow-auto max-h-60">
              {debugInfo}
            </pre>
          </div>
        )}
        
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-md">
          <h3 className="font-semibold mb-2">Troubleshooting Tips</h3>
          <ul className="text-sm text-blue-700 list-disc pl-5 space-y-1">
            <li>Check that your UploadThing API keys are correctly set in .env.local</li>
            <li>Ensure your PDF file is under 4MB</li>
            <li>Check the browser console (F12) for detailed error logs</li>
            <li>Verify that your database connection is working</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 