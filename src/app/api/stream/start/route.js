import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
  try {
    const body = await request.json();
    const { streamId = 'default', publisherId = null } = body || {};

    const stream = await prisma.stream.upsert({
      where: { streamId },
      update: { status: 'live', publisherId, lastFrameAt: new Date() },
      create: { streamId, status: 'live', publisherId, lastFrameAt: new Date() },
    });

    return NextResponse.json({ ok: true, stream });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}

