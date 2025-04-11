/**
 * @license
 * MIT License
 * Copyright (c) 2025 D8ger
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { Logger } from '@/lib/logger';
import { jwtVerify } from 'jose';
import { appConfig } from '@/lib/appConfig';

// 定义需要保护的路径
const PROTECTED_PATHS = [
  '/',  // 添加根路径，保护主页
  '/api/entries',
  '/api/entries/heatmap',
  '/new'
];

// 不需要验证的路径
const PUBLIC_PATHS = [
  '/api/auth/login',
  '/api/auth/logout',
  '/login',
  '/_next',
  '/favicon.ico',
  '/logo.svg'
];

export async function middleware(request: NextRequest) {
  // 生成请求ID用于日志追踪
  const requestId = crypto.randomUUID();
  // 创建响应对象并设置请求头
  const response = NextResponse.next();
  response.headers.set('X-Request-ID', requestId);

  // 检查是否需要进行认证
  const url = request.nextUrl.pathname;

  // 检查是否是公开路径
  if (PUBLIC_PATHS.some(path => url.startsWith(path))) {
    return response;  // 返回带有请求ID的响应
  }

  // 检查是否是受保护路径
  const needsAuth = PROTECTED_PATHS.some(path => {
    // 对于根路径，需要精确匹配
    if (path === '/' && url === '/') {
      return true;
    }
    // 对于其他路径，使用前缀匹配
    return url.startsWith(path) && path !== '/';
  });

  if (needsAuth) {
    // 从Cookie中获取令牌
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      // 如果是API请求，返回401错误
      if (url.startsWith('/api/')) {
        return NextResponse.json(
          { success: false, message: 'Unauthorized access' },
          { status: 401 }
        );
      }

      // 否则重定向到登录页面
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      // 验证令牌
      const jwtSecret = appConfig.JWT_SECRET;
      if (!jwtSecret) {
        throw new Error('JWT_SECRET environment variable is not set');
      }

      const encoder = new TextEncoder();
      const { payload } = await jwtVerify(
        token,
        encoder.encode(jwtSecret)
      );

      // 将用户信息添加到请求头中
      response.headers.set('X-User-ID', payload.id as string);

      // 对昵称进行Base64编码，避免中文字符问题
      const nickname = payload.nickname as string;
      const encodedNickname = Buffer.from(nickname).toString('base64');
      response.headers.set('X-User-Nickname-Base64', encodedNickname);
      return response;
    } catch (error) {
      // 将unknown类型转换为Error类型
      const errorInstance = error instanceof Error ? error : new Error(String(error));
      Logger.error('JWT verification failed', errorInstance, null, requestId);

      // 如果是API请求，返回401错误
      if (url.startsWith('/api/')) {
        return NextResponse.json(
          { success: false, message: 'Token invalid or expired' },
          { status: 401 }
        );
      }

      // 否则重定向到登录页面
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // 对于其他路径，继续处理
  return NextResponse.next();
}

// 只对 API 路由启用中间件
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ]
}