import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Logger } from '@/lib/logger';

export async function GET(request: Request) {
  const requestId = request.headers.get('X-Request-ID');
  const { searchParams } = new URL(request.url);
  const nickname = searchParams.get('nickname');

  Logger.info('Heatmap data fetching', { nickname }, requestId);

  const entries = await prisma.detail.findMany({
    where: {
      ...(nickname && { nickname })
    },
    select: {
      id: true,
      date: true
    },
    orderBy: {
      date: 'desc'
    }
  });

  Logger.info('Heatmap data fetched successfully', { 
    nickname: nickname,
    count: entries.length 
  }, requestId);

  return NextResponse.json(entries);
} 