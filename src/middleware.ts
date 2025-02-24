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

export async function middleware(request: NextRequest) {
  return traceHttp(request)
}

// HTTP请求处理
async function traceHttp(request: NextRequest) {
  // 只记录 API 请求
  if (!request.url.includes('/api/')) {
    return NextResponse.next()
  }

  const requestTime = new Date()
  const requestId = crypto.randomUUID()

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
    '/api/:path*'
  ]
}