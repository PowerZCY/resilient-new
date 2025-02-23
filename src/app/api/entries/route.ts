import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Logger } from '@/lib/logger';

// POST 请求处理函数 - 创建新的日记条目
export async function POST(request: Request) {
  const requestId = request.headers.get('X-Request-ID');
  // 解析请求体中的 JSON 数据
  const body = await request.json();
  // 从请求体中解构出需要的字段
  const { date, nickname, content } = body;

  Logger.info('Timeline data creating', { nickname }, requestId);

  // 使用 Prisma 创建新的数据记录
  // test
  const entry = await prisma.detail.create({
    data: {
      date: new Date(date),    // 将日期字符串转换为 Date 对象
      nickname,                // 用户昵称
      content,                // 日记内容
    },
  });
  Logger.info('Timeline data created successfully', { nickname }, requestId);

  // 返回创建的记录作为 JSON 响应
  return NextResponse.json(entry);
}

export async function GET(request: Request) {
  const requestId = request.headers.get('X-Request-ID');
  // 从请求 URL 中获取查询参数
  const { searchParams } = new URL(request.url);
  // 获取 nickname、page 和 limit 查询参数
  const nickname = searchParams.get('nickname');
  const page = parseInt(searchParams.get('page') || '1', 10); // 默认第 1 页
  const limit = parseInt(searchParams.get('limit') || '20', 10); // 默认每页 20 条

  Logger.info('Timeline data fetching', { nickname, page, limit }, requestId);

  // 计算分页的偏移量
  const skip = (page - 1) * limit;

  // 使用 Prisma 查询数据库
  const [entries, total] = await Promise.all([
    prisma.detail.findMany({
      where: nickname ? { nickname } : undefined, // 如果提供了昵称，则按昵称筛选
      orderBy: [{ date: 'desc' }, { id: 'desc' }],// 按日期降序排序
      skip, // 跳过前面的记录
      take: limit, // 限制返回数量
    }),
    prisma.detail.count({
      where: nickname ? { nickname } : undefined, // 计算符合条件的总记录数
    }),
  ]);

  Logger.info(
    'Timeline data fetched successfully',
    {
      nickname,
      page,
      limit,
      count: entries.length,
      total,
    },
    requestId
  );

  // 返回分页数据和总数
  return NextResponse.json({
    entries,
    total,
  });
}
