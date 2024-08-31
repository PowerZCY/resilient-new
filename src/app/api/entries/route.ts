import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  const body = await request.json();
  const { date, nickname, content } = body;

  const entry = await prisma.detail.create({
    data: {
      date: new Date(date),
      nickname,
      content,
    },
  });

  return NextResponse.json(entry);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const nickname = searchParams.get('nickname');

  const entries = await prisma.detail.findMany({
    where: nickname ? { nickname } : undefined,
    orderBy: { date: 'desc' },
  });

  return NextResponse.json(entries);
}