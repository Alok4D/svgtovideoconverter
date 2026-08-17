import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ jobId: string }> | { jobId: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const { jobId } = resolvedParams;

    if (!jobId) {
      return new NextResponse('Job ID is required', { status: 400 });
    }

    const filePath = path.join(process.cwd(), 'uploads', `video-${jobId}.mp4`);
    
    if (!fs.existsSync(filePath)) {
      return new NextResponse('Video not found or still processing', { status: 404 });
    }

    const stat = fs.statSync(filePath);
    const fileBuffer = fs.readFileSync(filePath);
    
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Length': stat.size.toString(),
        'Accept-Ranges': 'bytes',
        'Content-Disposition': `inline; filename="video-${jobId}.mp4"`,
        'Cache-Control': 'public, max-age=31536000, immutable',
      }
    });
  } catch (error: any) {
    console.error('Download error:', error);
    return new NextResponse(error.message || 'Internal server error', { status: 500 });
  }
}

