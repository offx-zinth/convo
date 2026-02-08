import { NextRequest, NextResponse } from 'next/server';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '@/lib/s3';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-at-least-32-chars-long'
);

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await jwtVerify(token, JWT_SECRET);

    const { fileName, fileType, fileSize } = await req.json();

    const maxFileSize = parseInt(process.env.MAX_FILE_SIZE || '52428800'); // Default 50MB
    if (fileSize > maxFileSize) {
      return NextResponse.json({ error: 'File too large' }, { status: 400 });
    }

    const key = `uploads/${uuidv4()}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      ContentType: fileType,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    return NextResponse.json({
      uploadUrl: signedUrl,
      fileUrl: `${process.env.NEXT_PUBLIC_S3_PUBLIC_URL}/${key}`,
      key,
    });
  } catch (error) {
    console.error('Presigned URL error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
