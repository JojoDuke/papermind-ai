import { createUploadthing, type FileRouter } from "uploadthing/next";

// Create a new instance of UploadThing
const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  pdfUploader: f({ pdf: { maxFileSize: "4MB" } })
    .middleware(() => {
      return { };
    })
    .onUploadComplete((res) => {
      console.log("Upload complete:", res);
      return { };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;