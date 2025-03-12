import { createUploadthing, type FileRouter } from "uploadthing/next";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

// Create a new instance of UploadThing
const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  pdfUploader: f({
    pdf: {
      maxFileSize: "32MB",
      maxFileCount: 1
    },
  })
    .middleware(async ({ req }) => {
      const supabase = createServerComponentClient({ cookies });
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        throw new Error("Unauthorized");
      }

      // Return metadata that will be accessible in onUploadComplete
      return {
        userId: session.user.id,
        uploadedAt: new Date().toISOString()
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      try {
        const supabase = createServerComponentClient({ cookies });
        
        // Insert the file record into the database
        const { data, error } = await supabase
          .from('files')
          .insert([
            {
              user_id: metadata.userId,
              name: file.name,
              size: file.size,
              url: file.url,
              uploaded_at: metadata.uploadedAt,
              type: 'pdf'
            }
          ])
          .select()
          .single();

        if (error) {
          console.error("Database error:", error);
          throw new Error("Failed to save file record");
        }

        console.log("File record created:", data);
        return { fileId: data.id, fileUrl: file.url };
      } catch (err) {
        console.error("Upload completion error:", err);
        throw new Error("Failed to process upload");
      }
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;