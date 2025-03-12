import { createUploadthing, type FileRouter } from "uploadthing/next";

// Create a new instance of UploadThing
const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  pdfUploader: f({
    pdf: {
      maxFileSize: "4MB",
      maxFileCount: 1
    },
  })
    .middleware(async () => {
      // For testing purposes, we'll allow uploads without authentication
      return { userId: "test-user" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      try {
        console.log("Upload complete for userId:", metadata.userId);
        console.log("File URL:", file.url);

        return { fileUrl: file.url };
      } catch (err) {
        console.error("Upload completion error:", err);
        throw new Error("Failed to process upload");
      }
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;