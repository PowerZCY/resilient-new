import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Logger } from '@/lib/logger';

interface Entry {
  date: string; // ISO 字符串
  nickname: string;
  content: string;
}

// POST 请求处理函数 - 批量创建日记条目
export async function POST(request: Request) {
  const requestId = request.headers.get('X-Request-ID');
  const body = await request.json();
  const entries: Entry[] = Array.isArray(body) ? body : [body];

  try {
    // 批量创建记录
    const createdEntries = await prisma.detail.createMany({
      data: entries.map(entry => ({
        date: new Date(entry.date), // 转换为 Date 对象
        nickname: entry.nickname,
        content: entry.content,
      })),
      skipDuplicates: true, // 跳过重复记录（可选，根据需求）
    });

    Logger.info('Timeline data created successfully in bulk', { nickname: entries[0]?.nickname, count: entries.length }, requestId);

    return NextResponse.json({ success: true, count: createdEntries.count });
  } catch (error) {
    Logger.error('Error creating timeline data in bulk:', error as Error, requestId);
    return NextResponse.json({ error: 'Failed to create entries' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const nickname = searchParams.get('nickname');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '20', 10);


  const skip = (page - 1) * limit;

  const [entries, total] = await Promise.all([
    prisma.detail.findMany({
      where: nickname ? { nickname } : undefined,
      orderBy: [{ date: 'desc' }, { id: 'desc' }],
      skip,
      take: limit,
    }),
    prisma.detail.count({
      where: nickname ? { nickname } : undefined,
    }),
  ]);

  const safeEntries = entries.map(entry => ({
    ...entry,
    id: entry.id.toString(), // BigInt 转字符串
    // 其他字段如果也是 BigInt，也要转
  }));

  return NextResponse.json({
    entries: safeEntries,
    total,
  });
}