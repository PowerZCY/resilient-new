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

  const safeEntries = entries.map(entry => ({
    ...entry,
    id: entry.id.toString(), // BigInt 转字符串
    // 其他字段如果也是 BigInt，也要转
  }));
  // 准备响应
  const response = NextResponse.json(safeEntries);
  return response;
} 