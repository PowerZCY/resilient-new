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
import dayjs from 'dayjs';
import { jwtVerify } from 'jose';

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
  '/login',
  '/_next',
  '/favicon.ico',
  '/logo.svg'
];

export async function middleware(request: NextRequest) {
  // 生成请求ID用于日志追踪
  const requestId = crypto.randomUUID();
  request.headers.set('X-Request-ID', requestId);
  
  // 检查是否需要进行认证
  const url = request.nextUrl.pathname;
  
  // 检查是否是公开路径
  if (PUBLIC_PATHS.some(path => url.startsWith(path))) {
    // 对于公开的API路径，仍然记录请求日志
    if (url.startsWith('/api/')) {
      return await traceHttp(request);
    }
    return NextResponse.next();
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
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new Error('JWT_SECRET environment variable is not set');
      }
      
      const encoder = new TextEncoder();
      const { payload } = await jwtVerify(
        token, 
        encoder.encode(jwtSecret)
      );
      
      // 将用户信息添加到请求头中 - 使用Base64编码处理可能包含的非ASCII字符
      const response = NextResponse.next();
      response.headers.set('X-User-ID', payload.id as string);
      
      // 对昵称进行Base64编码，避免中文字符问题
      const nickname = payload.nickname as string;
      const encodedNickname = Buffer.from(nickname).toString('base64');
      response.headers.set('X-User-Nickname-Base64', encodedNickname);
      
      // 对于API请求，记录请求日志
      if (url.startsWith('/api/')) {
        // 将用户信息传递给traceHttp函数
        request.headers.set('X-User-ID', payload.id as string);
        request.headers.set('X-User-Nickname-Base64', encodedNickname);
        return await traceHttp(request);
      }
      
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

// HTTP请求处理
async function traceHttp(request: NextRequest) {
  const requestTime = new Date()
  const requestId = request.headers.get('X-Request-ID') || crypto.randomUUID()

  // 获取并解码用户昵称
  let userNickname = null;
  const encodedNickname = request.headers.get('X-User-Nickname-Base64');
  if (encodedNickname) {
    try {
      userNickname = Buffer.from(encodedNickname, 'base64').toString();
    } catch (e) {
      Logger.warn(`Failed to decode nickname from header`, null, new Error(String(e)), requestId);
    }
  }

  // 记录请求信息
  const requestLog = {
    timestamp: dayjs(requestTime).format('YYYY-MM-DD HH:mm:ss.SSS'),
    method: request.method,
    url: request.url,
    path: request.nextUrl.pathname,
    query: Object.fromEntries(request.nextUrl.searchParams),
    body: request.body,
    headers: Object.fromEntries(request.headers),
    ip: request.ip,
    userAgent: request.headers.get('user-agent'),
    userId: request.headers.get('X-User-ID'),
    userNickname: userNickname
  }

  // 克隆请求以获取请求体
  let requestBody = null
  if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
    try {
      const clone = request.clone()
      requestBody = await clone.json()
    } catch (e) {
      if(e instanceof Error) {
        Logger.error(`|${request.nextUrl.pathname}|Failed to parse request body`, e, null, requestId)
      } else {
        Logger.error(`|${request.nextUrl.pathname}|Failed to parse request body`, new Error(String(e)), null, requestId)
      }
    }
  }

  Logger.info('API Request', {
    ...requestLog,
    body: requestBody
  }, requestId)

  // 使用 fetch 直接调用 API 路由，并在请求头添加日志追踪标志 X-Request-ID
  request.headers.set('X-Request-ID', requestId)

  const response = NextResponse.next()
  // 设置响应头
  response.headers.set('X-Request-ID', requestId)
  // 记录响应信息
  const responseTime = new Date()
  const duration = responseTime.getTime() - requestTime.getTime()


  const responseLog = {
    timestamp: dayjs(responseTime).format('YYYY-MM-DD HH:mm:ss.SSS'),
    method: request.method,
    url: request.url,
    path: request.nextUrl.pathname,
    duration: `${duration}ms`,
    status: response.status,
    statusText: response.statusText,
    headers: Object.fromEntries(response.headers),
  }
  Logger.info('API Response', responseLog, requestId)
  
  return response
}


// 只对 API 路由启用中间件
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ]
}