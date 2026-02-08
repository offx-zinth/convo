import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const num1 = Math.floor(Math.random() * 10);
  const num2 = Math.floor(Math.random() * 10);
  const answer = (num1 + num2).toString();

  const cookieStore = await cookies();
  cookieStore.set('captcha', answer, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 300,
  });

  // Return a simple SVG with the question
  const svg = `
    <svg width="150" height="50" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f1f5f9"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="24" fill="#334155">
        ${num1} + ${num2} = ?
      </text>
    </svg>
  `;

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
    },
  });
}
