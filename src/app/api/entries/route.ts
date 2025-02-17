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

// GET 请求处理函数 - 获取日记条目列表
export async function GET(request: Request) {
  const requestId = request.headers.get('X-Request-ID');
  // 从请求 URL 中获取查询参数
  const { searchParams } = new URL(request.url);
  // 获取 nickname 查询参数
  const nickname = searchParams.get('nickname');
  Logger.info('Timeline data fetching', { nickname }, requestId);

  // 使用 Prisma 查询数据库
  const entries = await prisma.detail.findMany({
    where: nickname ? { nickname } : undefined,  // 如果提供了昵称，则按昵称筛选
    orderBy: { date: 'desc' },                  // 按日期降序排序
  });

  Logger.info('Timeline data fetched successfully', { 
    nickname: nickname,
    count: entries.length 
  }, requestId);
  // 返回查询结果作为 JSON 响应
  return NextResponse.json(entries);
}
