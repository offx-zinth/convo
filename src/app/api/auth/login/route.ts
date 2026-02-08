import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-at-least-32-chars-long'
);

export async function POST(req: NextRequest) {
  try {
    const { captcha, secret, senderName } = await req.json();
    const cookieStore = await cookies();
    const ip = req.headers.get('x-forwarded-for') || 'unknown';

    // Rate Limiting
    const rateLimit = await prisma.rateLimit.upsert({
      where: { ip_key: { ip, key: 'login' } },
      update: {
        count: { increment: 1 },
        lastAttempt: new Date()
      },
      create: {
        ip,
        key: 'login',
        count: 1
      }
    });

    if (rateLimit.count > 10 && (Date.now() - rateLimit.lastAttempt.getTime()) < 60000) {
      return NextResponse.json({ error: 'Too many attempts. Try again in a minute.' }, { status: 429 });
    }

    // 1. Validate CAPTCHA
    const storedCaptcha = cookieStore.get('captcha')?.value;
    if (!storedCaptcha || storedCaptcha.toLowerCase() !== captcha.toLowerCase()) {
      return NextResponse.json({ error: 'Invalid CAPTCHA' }, { status: 400 });
    }

    // 2. Validate Secret Code
    const hashedSecret = process.env.CHAT_SECRET_HASHED;
    const plainSecret = process.env.CHAT_SECRET_CODE; // Fallback or direct check if not hashed yet

    let isSecretValid = false;
    if (hashedSecret) {
      isSecretValid = await bcrypt.compare(secret, hashedSecret);
    } else if (plainSecret) {
      isSecretValid = secret === plainSecret;
    }

    if (!isSecretValid) {
      return NextResponse.json({
        error: 'Invalid Secret Code',
        redirectUrl: process.env.WRONG_CODE_REDIRECT_URL || 'https://www.google.com'
      }, { status: 401 });
    }

    // 3. Create Session
    const userId = senderName === 'User 1' ? 'user1' : 'user2'; // Simplified for 2 people
    const token = await new SignJWT({ userId, senderName })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(JWT_SECRET);

    cookieStore.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 1 day
    });

    // Clear captcha
    cookieStore.delete('captcha');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
