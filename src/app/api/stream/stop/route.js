import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
  try {
    const body = await request.json();
    const { streamId = 'default' } = body || {};

    const stream = await prisma.stream.update({
      where: { streamId },
      data: { status: 'idle' },
    });

    return NextResponse.json({ ok: true, stream });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}

