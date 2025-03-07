import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Logger } from '@/lib/logger';

export async function GET(request: Request) {
  const functionStartTime = performance.now();
  const startTime = Date.now();
  const requestId = request.headers.get('X-Request-ID');
  const { searchParams } = new URL(request.url);
  const nickname = searchParams.get('nickname');

  Logger.info('Heatmap data fetching', { nickname, timestamp: startTime }, requestId);

  const dbStartTime = Date.now();
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
  const dbEndTime = Date.now();

  Logger.info('Heatmap data fetched from DB', { 
    nickname: nickname,
    count: entries.length,
    dbQueryTime: dbEndTime - dbStartTime
  }, requestId);

  // 准备响应
  const responseStartTime = Date.now();
  const response = NextResponse.json(entries);
  const responseEndTime = Date.now();
  
  Logger.info('Heatmap response prepared', {
    responseTime: responseEndTime - responseStartTime,
    totalTime: responseEndTime - startTime
  }, requestId);

  Logger.info('Heatmap complete performance breakdown', {
    functionExecutionTime: performance.now() - functionStartTime,
    totalRequestTime: Date.now() - startTime,
    dbQueryTime: dbEndTime - dbStartTime,
    responsePreparationTime: responseEndTime - responseStartTime,
    unaccountedTime: (Date.now() - startTime) - (dbEndTime - dbStartTime) - (responseEndTime - responseStartTime)
  }, requestId);

  return response;
} 