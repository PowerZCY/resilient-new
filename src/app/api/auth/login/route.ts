/**
 * @license
 * MIT License
 * Copyright (c) 2025 D8ger
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';
import { Logger } from '@/lib/logger';
import { AppConfig } from '@/lib/appConfig';

// 获取用户列表
const getUsers = () => {
  // 获取配置的用户
  const configuredUsers = AppConfig.getConfiguredUsers();
  
  // 如果没有配置用户，并且不是生产环境，使用默认用户
  if (configuredUsers.length === 0 && !AppConfig.IS_PRODUCTION) {
    Logger.warn('No users configured in environment variables. Using default users for development only.');
    return AppConfig.getDefaultUsers();
  }
  
  return configuredUsers;
};

export async function POST(request: NextRequest) {
  try {
    const { username, password, rememberMe } = await request.json();
    
    // 获取用户列表
    const USERS = getUsers();
    
    // 验证用户凭证
    const user = USERS.find(u => u.username === username && u.password === password);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid username or password' },
        { status: 401 }
      );
    }
    
    // 获取JWT密钥
    const jwtSecret = AppConfig.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is not set');
    }
    
    // 计算过期时间
    const expiresIn = AppConfig.getCookieMaxAge(rememberMe === true);
    
    // 生成JWT令牌
    const encoder = new TextEncoder();
    const token = await new SignJWT({ 
      id: user.id,
      username: user.username,
      nickname: user.nickname
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(Math.floor(Date.now() / 1000) + expiresIn)
      .sign(encoder.encode(jwtSecret));
    
    // 设置Cookie
    const cookieOptions = {
      httpOnly: true,
      secure: AppConfig.IS_PRODUCTION,
      sameSite: 'strict' as const,
      maxAge: expiresIn,
      path: '/'
    };
    
    // 使用Next.js的cookies API设置cookie
    cookies().set('auth_token', token, cookieOptions);
    
    return NextResponse.json({ 
      success: true,
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname
      }
    });
    
  } catch (error) {
    Logger.error('Login processing error', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 