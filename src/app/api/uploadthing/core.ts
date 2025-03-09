import { createUploadthing, type FileRouter } from "uploadthing/next";

// Create a new instance of UploadThing
const f = createUploadthing();

// Define the file router
export const ourFileRouter = {
  // Define a route for PDF uploads
  pdfUploader: f({ pdf: { maxFileSize: "4MB" } })
    .middleware(() => {
      // No authentication or database operations in middleware
      console.log("[UploadThing] Middleware called");
      return { userId: "test-user" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Log the file details but don't interact with the database
      console.log("[UploadThing] Upload complete:", {
        userId: metadata.userId,
        fileName: file.name,
        fileSize: file.size,
        fileKey: file.key,
        fileUrl: file.url
      });
      
      // Return success without database operations
      return { success: true };
    }),
};

export type OurFileRouter = typeof ourFileRouter;