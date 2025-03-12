'use client';

import { UploadDropzone } from "@/utils/uploadthing";
import { useToast } from "@/components/ui/use-toast";

export default function UploadTest() {
  const { toast } = useToast();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-center mb-6">Upload PDF</h1>
          
          <UploadDropzone
            endpoint="pdfUploader"
            onClientUploadComplete={(res) => {
              if (res && res[0]) {
                toast({
                  title: "Upload Successful",
                  description: "Your file has been uploaded.",
                });
                console.log("Upload Result:", res);
              }
            }}
            onUploadError={(error: Error) => {
              toast({
                title: "Upload Failed",
                description: error.message || "Something went wrong",
                variant: "destructive",
              });
              console.error("Upload error:", error);
            }}
            appearance={{
              button: "bg-purple-500 hover:bg-purple-600",
              allowedContent: "text-gray-600 font-medium",
              label: "text-gray-700 font-semibold",
            }}
          />
        </div>
      </div>
    </main>
  );
} 