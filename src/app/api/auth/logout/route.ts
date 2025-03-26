/**
 * @license
 * MIT License
 * Copyright (c) 2025 D8ger
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { Logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    // 清除认证Cookie
    cookies().delete('auth_token');
    const requestId = request.headers.get('X-Request-ID') || '';
    // 记录登出操作
    Logger.info('User logged out successfully', {
      ip: request.ip,
      userAgent: request.headers.get('user-agent')
    }, requestId);


    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    Logger.error('Logout processing error', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { success: false, message: 'Error during logout process' },
      { status: 500 }
    );
  }
} 