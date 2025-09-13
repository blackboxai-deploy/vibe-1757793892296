import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, filename } = await request.json();

    if (!imageUrl || typeof imageUrl !== "string") {
      return NextResponse.json(
        { error: "Valid image URL is required" },
        { status: 400 }
      );
    }

    console.log("Downloading image from:", imageUrl);

    // Fetch the image from the external URL
    const imageResponse = await fetch(imageUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        'Accept-Encoding': 'identity', // Avoid compression issues
        'Cache-Control': 'no-cache',
      },
    });

    if (!imageResponse.ok) {
      console.error(`Failed to fetch image: ${imageResponse.status} ${imageResponse.statusText}`);
      return NextResponse.json(
        { error: `Failed to fetch image: ${imageResponse.status}` },
        { status: imageResponse.status }
      );
    }

    // Get the content type
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
    console.log("Image content type:", contentType);

    // Get the image data as an array buffer
    const imageBuffer = await imageResponse.arrayBuffer();
    console.log("Image buffer size:", imageBuffer.byteLength);

    if (imageBuffer.byteLength === 0) {
      return NextResponse.json(
        { error: "Received empty image file" },
        { status: 400 }
      );
    }

    // Determine file extension based on content type
    let extension = 'jpg';
    if (contentType.includes('png')) extension = 'png';
    else if (contentType.includes('webp')) extension = 'webp';
    else if (contentType.includes('gif')) extension = 'gif';

    // Set appropriate response headers
    const headers = new Headers();
    headers.set('Content-Type', contentType);
    headers.set('Content-Disposition', `attachment; filename="${filename || 'story-image'}.${extension}"`);
    headers.set('Content-Length', imageBuffer.byteLength.toString());
    headers.set('Cache-Control', 'no-cache');

    return new NextResponse(imageBuffer, {
      status: 200,
      headers,
    });

  } catch (error) {
    console.error("Image download error:", error);
    
    return NextResponse.json(
      { 
        error: "Failed to download image",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

// Set timeout for image downloads
export const maxDuration = 30; // 30 seconds timeout