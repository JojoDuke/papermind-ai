import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check if UploadThing environment variables are set
    const uploadthingSecret = process.env.UPLOADTHING_SECRET;
    const uploadthingAppId = process.env.UPLOADTHING_APP_ID;
    
    // Return the status of the UploadThing configuration
    return NextResponse.json({
      status: 'ok',
      uploadthing: {
        secretConfigured: !!uploadthingSecret,
        appIdConfigured: !!uploadthingAppId,
        secretLength: uploadthingSecret ? uploadthingSecret.length : 0,
        appIdLength: uploadthingAppId ? uploadthingAppId.length : 0,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in test-uploadthing route:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
} 