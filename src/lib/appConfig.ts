/**
 * @license
 * MIT License
 * Copyright (c) 2025 D8ger
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * 应用配置类，集中管理所有环境变量和配置项
 */
export class AppConfig {
  // JWT配置
  static readonly JWT_SECRET = process.env.JWT_SECRET || '';
  
  // Cookie配置
  static readonly COOKIE_MAX_AGE_DAYS = parseInt(process.env.COOKIE_MAX_AGE_DAYS || '7', 10);
  static readonly COOKIE_REMEMBER_ME_DAYS = parseInt(process.env.COOKIE_REMEMBER_ME_DAYS || '30', 10);
  
  // 数据库配置
  static readonly POSTGRES_PRISMA_URL = process.env.POSTGRES_PRISMA_URL || '';
  static readonly POSTGRES_URL_NON_POOLING = process.env.POSTGRES_URL_NON_POOLING || '';
  
  // 用户配置
  static readonly USER1 = {
    id: process.env.USER1_ID || '1',
    username: process.env.USER1_USERNAME || '',
    password: process.env.USER1_PASSWORD || '',
    nickname: process.env.USER1_NICKNAME || process.env.USER1_USERNAME || ''
  };
  
  static readonly USER2 = {
    id: process.env.USER2_ID || '2',
    username: process.env.USER2_USERNAME || '',
    password: process.env.USER2_PASSWORD || '',
    nickname: process.env.USER2_NICKNAME || process.env.USER2_USERNAME || ''
  };
  
  // 环境配置
  static readonly IS_PRODUCTION = process.env.NODE_ENV === 'production';
  static readonly IS_DEVELOPMENT = process.env.NODE_ENV === 'development';
  
  // API配置
  static readonly API_DEFAULT_PAGE_SIZE = parseInt(process.env.API_DEFAULT_PAGE_SIZE || '20', 10);
  
  /**
   * 获取配置的用户列表
   */
  static getConfiguredUsers() {
    const users = [];
    
    // 添加第一个用户（如果配置了）
    if (this.USER1.username && this.USER1.password) {
      users.push({
        id: this.USER1.id,
        username: this.USER1.username,
        password: this.USER1.password,
        nickname: this.USER1.nickname
      });
    }
    
    // 添加第二个用户（如果配置了）
    if (this.USER2.username && this.USER2.password) {
      users.push({
        id: this.USER2.id,
        username: this.USER2.username,
        password: this.USER2.password,
        nickname: this.USER2.nickname
      });
    }
    
    return users;
  }
  
  /**
   * 获取默认用户（仅用于开发环境）
   */
  static getDefaultUsers() {
    return [
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
    ];
  }
  
  /**
   * 计算Cookie过期时间（秒）
   */
  static getCookieMaxAge(rememberMe: boolean): number {
    const secondsInDay = 24 * 60 * 60;
    return rememberMe 
      ? this.COOKIE_REMEMBER_ME_DAYS * secondsInDay 
      : this.COOKIE_MAX_AGE_DAYS * secondsInDay;
  }
} 