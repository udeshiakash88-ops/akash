import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { verifyToken } from '@/lib/auth';

export const runtime = 'nodejs';

const MAX_SIZE_BYTES = 5 * 1024 * 1024;

function getExtension(file: File): string {
  const originalExt = path.extname(file.name || '').toLowerCase();
  if (originalExt) return originalExt;

  const mimeMap: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
  };

  return mimeMap[file.type] || '.jpg';
}

export async function POST(request: NextRequest) {
  const auth = verifyToken(request);
  if (!auth.valid) return NextResponse.json({ error: auth.error }, { status: 401 });

  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: 'Image size must be 5MB or less' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = getExtension(file);
    const fileName = `about-${Date.now()}-${randomUUID().slice(0, 8)}${ext}`;

    // Upload to Vercel Blob
    const blob = await put(`about/${fileName}`, buffer, {
      access: 'public',
      addRandomSuffix: true,
    });

    return NextResponse.json({ url: blob.url });
  } catch (err: any) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: `Upload failed: ${err.message}` }, { status: 500 });
  }
}
