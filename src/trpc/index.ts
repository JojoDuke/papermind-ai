import { privateProcedure, publicProcedure, router } from "./trpc";
import { TRPCError } from "@trpc/server";
import { db } from "@/db";
import { z } from "zod";
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const appRouter = router({
  authCallback: publicProcedure.query(async () => {
    const supabase = createServerComponentClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session || !session.user.id || !session.user.email) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    // Check if the user is in the database
    const dbUser = await db.user.findFirst({
      where: {
        id: session.user.id,
      },
    });

    if (!dbUser) {
      // Create user in db
      await db.user.create({
        data: {
          id: session.user.id,
          email: session.user.email,
        },
      });
    }

    return { success: true };
  }),
  getUserFiles: privateProcedure.query(async ({ ctx }) => {
    const { userId } = ctx;

    return await db.file.findMany({
      where: {
        userId,
      },
    });
  }),
  getFile: privateProcedure
    .input(z.object({ key: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;

      // Check if this is a local file key (from our local upload solution)
      if (input.key.includes('-')) {
        try {
          // For local files, we need to create a file record in the database
          // Extract the original filename from the key (format: timestamp-filename)
          const parts = input.key.split('-');
          const timestamp = parts[0];
          const filename = parts.slice(1).join('-');
          
          // Check if a file with this key already exists
          const existingFile = await db.file.findFirst({
            where: {
              key: input.key,
              userId,
            },
          });
          
          if (existingFile) return existingFile;
          
          // Create a new file record
          const newFile = await db.file.create({
            data: {
              key: input.key,
              name: filename,
              userId,
              url: `/uploads/${input.key}`,
              uploadStatus: "SUCCESS", // Local files are immediately available
            },
          });
          
          return newFile;
        } catch (error) {
          console.error("Error handling local file:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        }
      }
      
      // For UploadThing files, use the original logic
      const file = await db.file.findFirst({
        where: {
          key: input.key,
          userId,
        },
      });
      
      if (!file) throw new TRPCError({ code: "NOT_FOUND" });

      return file;
    }),
  deleteFile: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;

      const file = await db.file.findFirst({
        where: {
          id: input.id,
          userId,
        },
      });
      if (!file) throw new TRPCError({ code: "NOT_FOUND" });

      await db.file.delete({
        where: {
          id: input.id,
        },
      });
      return file;
    }),
});

export type AppRouter = typeof appRouter;
