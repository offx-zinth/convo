import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { pusherServer } from '@/lib/pusher';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-at-least-32-chars-long'
);

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const { content, type, fileUrl, fileName, fileSize } = await req.json();

    const message = await prisma.message.create({
      data: {
        content,
        type: type || 'TEXT',
        fileUrl,
        fileName,
        fileSize,
        senderId: payload.userId as string,
        senderName: payload.senderName as string,
      },
    });

    // Trigger Pusher event
    await pusherServer.trigger('chat', 'new-message', message);

    return NextResponse.json(message);
  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await jwtVerify(token, JWT_SECRET);

    const messages = await prisma.message.findMany({
      orderBy: { createdAt: 'asc' },
      take: 100, // Limit for performance
    });

    return NextResponse.json(messages);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
