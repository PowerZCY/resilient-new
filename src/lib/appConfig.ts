/**
 * @license
 * MIT License
 * Copyright (c) 2025 D8ger
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Define the structure of your user data
export type UserData ={
  name: string;
  color: string;
  email?: string;
}

const admin: UserData[] = [
  {
    name: 'Zia慢成',
    color: '#4f46e5',
    email: process.env.NEXT_PUBLIC_CLERK_FORCE_USER_EMAIL1
  },
  {
    name: '帝八哥',
    color: '#ec4899',
    email: process.env.NEXT_PUBLIC_CLERK_FORCE_USER_EMAIL2
  }
]

/**
 * 应用配置对象，集中管理所有环境变量和配置项
 */
export const appConfig = {
  baseUrl: 'https://d8ger.com',
  // 国际化配置
  i18n: {
    locales: ["zh", "en"] as const,
    defaultLocale: "zh" as const,
    localeLabels: {
      zh: "简体中文",
      en: "English"
    },
  },

  clerk: {
    debug: process.env.CLERK_DEBUG === 'true',
    user: admin
  },

  // 数据库配置
  POSTGRES_PRISMA_URL: process.env.POSTGRES_PRISMA_URL || '',
  POSTGRES_URL_NON_POOLING: process.env.POSTGRES_URL_NON_POOLING || '',

  // 环境配置
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',

  // API配置
  API_DEFAULT_PAGE_SIZE: parseInt(process.env.API_DEFAULT_PAGE_SIZE || '20', 10),
  style: {
    icon: {
      // 所有图标默认颜色, 注意在SVG中fill参数填充色映射为#AC62FD
      uniformColor: "text-purple-500"
    },
    showBanner: true,
  }
} as const;

export const iconColor = appConfig.style.icon.uniformColor
export const showBanner = appConfig.style.showBanner

// 辅助函数：检查是否为支持的语言
function isSupportedLocale(locale: string): locale is typeof appConfig.i18n.locales[number] {
  return (appConfig.i18n.locales as readonly string[]).includes(locale);
}

// 辅助函数：获取有效的语言设置
// 如果当前语言不支持，则返回默认语言
export function getValidLocale(locale: string): typeof appConfig.i18n.locales[number] {
  return isSupportedLocale(locale) ? locale : appConfig.i18n.defaultLocale;
}