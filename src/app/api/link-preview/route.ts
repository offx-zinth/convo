import { getLinkPreview } from 'link-preview-js';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    const data = await getLinkPreview(url);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch preview' }, { status: 500 });
  }
}
