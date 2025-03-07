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

// 从环境变量中读取用户凭据
const getConfiguredUsers = () => {
  const users = [];
  
  // 读取第一个用户
  if (process.env.USER1_USERNAME && process.env.USER1_PASSWORD) {
    users.push({
      id: process.env.USER1_ID || '1',
      username: process.env.USER1_USERNAME,
      password: process.env.USER1_PASSWORD,
      nickname: process.env.USER1_NICKNAME || process.env.USER1_USERNAME
    });
  }
  
  // 读取第二个用户
  if (process.env.USER2_USERNAME && process.env.USER2_PASSWORD) {
    users.push({
      id: process.env.USER2_ID || '2',
      username: process.env.USER2_USERNAME,
      password: process.env.USER2_PASSWORD,
      nickname: process.env.USER2_NICKNAME || process.env.USER2_USERNAME
    });
  }
  
  // 如果没有配置用户，使用默认用户（仅用于开发环境）
  if (users.length === 0 && process.env.NODE_ENV !== 'production') {
    Logger.warn('No users configured in environment variables. Using default users for development only.');
    users.push(
      {
        id: '1',
        username: 'admin',
        password: 'admin123',
        nickname: 'Zia慢成'
      },
      {
        id: '2',
        username: 'user',
        password: 'user123',
        nickname: '帝八哥'
      }
    );
  }
  
  return users;
};

export async function POST(request: NextRequest) {
  try {
    const { username, password, rememberMe } = await request.json();
    
    // 获取配置的用户
    const USERS = getConfiguredUsers();
    
    // 验证用户凭证
    const user = USERS.find(u => u.username === username && u.password === password);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid username or password' },
        { status: 401 }
      );
    }
    
    // 生成JWT令牌
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is not set');
    }
    
    const encoder = new TextEncoder();
    const expiresIn = rememberMe ? 7 * 24 * 60 * 60 : 24 * 60 * 60; // 7天或1天（秒）
    
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
      secure: process.env.NODE_ENV === 'production',
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
    console.error('Login processing error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 