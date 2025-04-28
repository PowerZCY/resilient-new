import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const nickname = searchParams.get('nickname');

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

  // 准备响应
  const response = NextResponse.json(entries);
  return response;
} 