import { createRouteHandler } from "uploadthing/next";
import { UTApi } from "uploadthing/server";
import { NextResponse } from "next/server";

const utapi = new UTApi();

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json(
        { error: "File key is required" },
        { status: 400 }
      );
    }

    await utapi.deleteFiles(key);

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 }
    );
  }
} 